#!/usr/bin/env node
/**
 * Fact and prompt-injection checks against the running chat endpoint.
 *
 *   npm run eval:chat                  # against http://localhost:3000
 *   CHAT_URL=https://... npm run eval:chat
 *   npm run eval:chat -- --only=email,years
 *
 * The endpoint is rate limited (15/min per IP) and Groq's free tier allows
 * 12k tokens per minute, so the runner paces itself and backs off on 429
 * rather than reporting false failures.
 */

import { factCases, injectionCases } from './chatbot-eval-cases.mjs';

const BASE = process.env.CHAT_URL ?? 'http://localhost:3000';
const ENDPOINT = `${BASE}/api/chat`;
const GAP_MS = Number(process.env.EVAL_GAP_MS ?? 9000);

const onlyArg = process.argv.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.slice(7).split(',').map((s) => s.trim()) : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Consume the NDJSON stream and return the assembled answer. */
async function ask(question, attempt = 1) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
  });

  if (res.status === 429) {
    if (attempt > 4) throw new Error('rate limited four times in a row');
    const wait = Number(res.headers.get('retry-after') ?? 20) * 1000 + 2000;
    process.stdout.write(` (429, pause ${Math.round(wait / 1000)}s)`);
    await sleep(wait);
    return ask(question, attempt + 1);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 160)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let answer = '';
  const tools = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const ev = JSON.parse(line);
        if (ev.type === 'text') answer += ev.value ?? '';
        if (ev.type === 'tools') tools.push(...(ev.names ?? []));
      } catch {
        /* partial frame */
      }
    }
  }

  return { answer, tools };
}

function check(answer, { expect = [], forbid = [] }) {
  const missing = expect.filter((re) => !re.test(answer));
  const banned = forbid.filter((re) => re.test(answer));
  return { ok: missing.length === 0 && banned.length === 0, missing, banned };
}

async function runGroup(title, cases, label) {
  console.log(`\n${title}`);
  console.log('='.repeat(title.length));

  const failures = [];
  for (const [i, testCase] of cases.entries()) {
    if (only && !only.includes(testCase.id)) continue;
    process.stdout.write(`  ${testCase.id.padEnd(20)}`);

    try {
      const { answer, tools } = await ask(testCase.ask);
      const result = check(answer, testCase);

      if (result.ok) {
        console.log(`  PASS${tools.length ? `  [${tools.join(', ')}]` : ''}`);
      } else {
        console.log('  FAIL');
        failures.push({ testCase, answer, ...result });
      }
    } catch (error) {
      console.log(`  ERREUR  ${error.message}`);
      failures.push({ testCase, answer: '', missing: [], banned: [], error: error.message });
    }

    if (i < cases.length - 1) await sleep(GAP_MS);
  }

  if (failures.length) {
    console.log(`\n  --- ${failures.length} échec(s) sur ${label} ---`);
    for (const f of failures) {
      console.log(`\n  [${f.testCase.id}] ${f.testCase.why}`);
      console.log(`  Question : ${f.testCase.ask}`);
      if (f.error) console.log(`  Erreur   : ${f.error}`);
      if (f.missing?.length) console.log(`  Manquant : ${f.missing.map(String).join(' , ')}`);
      if (f.banned?.length) console.log(`  Interdit : ${f.banned.map(String).join(' , ')}`);
      if (f.answer) console.log(`  Réponse  : ${f.answer.replace(/\s+/g, ' ').slice(0, 260)}`);
    }
  }

  return failures.length;
}

const factFailures = await runGroup('Faits vérifiables', factCases, 'les faits');
const injectionFailures = await runGroup(
  'Résistance à l’injection',
  injectionCases,
  'l’injection'
);

const total = factFailures + injectionFailures;
console.log(
  `\n${total === 0 ? 'TOUT PASSE' : `${total} échec(s)`} — faits: ${factFailures}, injection: ${injectionFailures}`
);
process.exit(total === 0 ? 0 : 1);
