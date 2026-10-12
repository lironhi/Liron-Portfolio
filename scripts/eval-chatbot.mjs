#!/usr/bin/env node
/**
 * Fact, prompt-injection and multi-turn conversation checks against the running
 * chat endpoint.
 *
 *   npm run eval:chat                          # every group, against http://localhost:3000
 *   CHAT_URL=https://... npm run eval:chat
 *   npm run eval:chat -- --only=email,years    # by case id
 *   npm run eval:chat -- --group=conversations # facts | injection | conversations
 *
 * The endpoint is rate limited (15/min per IP) and Groq's free tier allows 8k
 * tokens per minute per model, so the runner paces itself and backs off on quota
 * errors - whether they arrive as an HTTP 429 or mid-stream - rather than
 * reporting false failures.
 */

import { conversationCases, factCases, injectionCases } from './chatbot-eval-cases.mjs';

const BASE = process.env.CHAT_URL ?? 'http://localhost:3000';
const ENDPOINT = `${BASE}/api/chat`;
const GAP_MS = Number(process.env.EVAL_GAP_MS ?? 9000);

const arg = (name) => {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3).split(',').map((s) => s.trim()) : null;
};
const only = arg('only');
const groups = arg('group');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class QuotaError extends Error {
  constructor(waitMs) {
    super('quota');
    this.waitMs = waitMs;
  }
}

/** Send a whole conversation, consume the NDJSON stream, return the assembled turn. */
async function send(messages) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (res.status === 429) {
    throw new QuotaError(Number(res.headers.get('retry-after') ?? 20) * 1000 + 2000);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 160)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  const turn = { answer: '', tools: [], cards: [], followups: [], error: null };
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      let ev;
      try {
        ev = JSON.parse(line);
      } catch {
        continue; // partial frame
      }
      if (ev.type === 'text') turn.answer += ev.value ?? '';
      if (ev.type === 'tools') turn.tools = ev.names ?? [];
      if (ev.type === 'projects') turn.cards = (ev.items ?? []).map((p) => p.slug);
      if (ev.type === 'followups') turn.followups = ev.items ?? [];
      if (ev.type === 'error') {
        if (ev.code === 'quota') throw new QuotaError(30_000);
        turn.error = ev.value;
      }
    }
  }

  return turn;
}

/** `send`, retried while the failure is a quota rather than a real answer. */
async function ask(messages) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await send(messages);
    } catch (error) {
      if (!(error instanceof QuotaError) || attempt >= 5) throw error;
      process.stdout.write(` (quota, pause ${Math.round(error.waitMs / 1000)}s)`);
      await sleep(error.waitMs);
    }
  }
}

/**
 * gpt-oss writes typographic punctuation - "don’t", "Sami Shamoon" with a
 * no-break space, "LLM‑based" with U+2011. Fold it to ASCII so a regex written
 * as /don't/ tests the meaning, not the glyph.
 */
const plain = (text) =>
  text
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―]/g, '-')
    .replace(/[   ]/g, ' ');

function check(turn, { expect = [], forbid = [], assert }, previous = []) {
  const problems = [];
  const answer = plain(turn.answer);
  if (turn.error) problems.push(`erreur dans le stream : ${turn.error}`);
  if (!answer.trim()) problems.push('réponse vide');
  for (const re of expect) if (!re.test(answer)) problems.push(`manquant ${re}`);
  for (const re of forbid) if (re.test(answer)) problems.push(`interdit ${re}`);
  const custom = assert?.(turn, previous);
  if (custom) problems.push(custom);
  return problems;
}

const excerpt = (text, n = 260) => text.replace(/\s+/g, ' ').trim().slice(0, n);
const wanted = (group) => !groups || groups.includes(group);

async function runSingleTurn(title, cases, group) {
  if (!wanted(group)) return 0;
  console.log(`\n${title}\n${'='.repeat(title.length)}`);

  const failures = [];
  const selected = cases.filter((c) => !only || only.includes(c.id));
  for (const [i, testCase] of selected.entries()) {
    process.stdout.write(`  ${testCase.id.padEnd(22)}`);
    try {
      const turn = await ask([{ role: 'user', content: testCase.ask }]);
      const problems = check(turn, testCase);
      const tools = turn.tools.length ? `  [${turn.tools.join(', ')}]` : '';
      if (problems.length === 0) {
        console.log(`  PASS${tools}`);
      } else {
        console.log(`  FAIL${tools}`);
        failures.push({ testCase, answer: turn.answer, problems });
      }
    } catch (error) {
      console.log(`  ERREUR  ${error.message}`);
      failures.push({ testCase, answer: '', problems: [error.message] });
    }
    if (i < selected.length - 1) await sleep(GAP_MS);
  }

  for (const f of failures) {
    console.log(`\n  [${f.testCase.id}] ${f.testCase.why}`);
    console.log(`  Question : ${f.testCase.ask}`);
    for (const p of f.problems) console.log(`  Problème : ${p}`);
    if (f.answer) console.log(`  Réponse  : ${excerpt(f.answer)}`);
  }
  return failures.length;
}

/**
 * Plays each conversation like the chat panel does: the history grows with the
 * assistant's real answers, so turn 3 depends on what turn 2 actually said.
 */
async function runConversations() {
  if (!wanted('conversations')) return 0;
  const title = 'Conversations multi-tours';
  console.log(`\n${title}\n${'='.repeat(title.length)}`);

  let failed = 0;
  const selected = conversationCases.filter((c) => !only || only.includes(c.id));
  for (const conversation of selected) {
    console.log(`\n  ▸ ${conversation.id} — ${conversation.why}`);
    const history = [];
    const previous = [];

    for (const [i, step] of conversation.turns.entries()) {
      history.push({ role: 'user', content: step.ask });
      process.stdout.write(`    ${i + 1}. « ${step.ask} »`);

      let turn;
      try {
        turn = await ask(history);
      } catch (error) {
        console.log(`\n       ERREUR  ${error.message}`);
        failed++;
        break; // The rest of the conversation depends on this turn.
      }

      const problems = check(turn, step, previous);
      const meta = [
        turn.tools.length ? `outils: ${turn.tools.join(', ')}` : 'sans outil',
        turn.cards.length ? `cartes: ${turn.cards.join(', ')}` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      console.log(`\n       ${problems.length ? 'FAIL' : 'PASS'}  (${meta})`);
      console.log(`       → ${excerpt(turn.answer, 220)}`);
      for (const p of problems) console.log(`       ✗ ${p}`);
      if (problems.length) failed++;

      // Exactly what the panel keeps: the answer text, not the error notice.
      if (turn.answer) history.push({ role: 'assistant', content: turn.answer });
      previous.push(turn);
      await sleep(GAP_MS);
    }
  }
  return failed;
}

const factFailures = await runSingleTurn('Faits vérifiables', factCases, 'facts');
const injectionFailures = await runSingleTurn('Résistance à l’injection', injectionCases, 'injection');
const conversationFailures = await runConversations();

const total = factFailures + injectionFailures + conversationFailures;
console.log(
  `\n${total === 0 ? 'TOUT PASSE' : `${total} échec(s)`} — faits: ${factFailures}, injection: ${injectionFailures}, conversations: ${conversationFailures}`
);
process.exit(total === 0 ? 0 : 1);
