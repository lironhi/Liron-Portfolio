import { type NextRequest, NextResponse } from 'next/server';
import { systemPrompt } from '@/lib/chatbot/knowledge-base';
import { data, type Project } from '@/lib/data';
import { callTool, getGroqTools } from '@/lib/mcp/registry';
import { clientKey, rateLimit } from '@/lib/rateLimit';

// fs access (the tools read from data/ and content/) rules out the edge runtime.
export const runtime = 'nodejs';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Tried in order. Groq retires models with little notice - llama-3.3-70b-versatile
 * vanished and every single question answered 500 until the code changed. Each
 * model also has its own per-minute token bucket, so the second one absorbs a
 * burst that throttles the first. GROQ_MODEL swaps the primary without a code change.
 */
const MODELS = [
  ...new Set([process.env.GROQ_MODEL || 'openai/gpt-oss-120b', 'openai/gpt-oss-20b']),
];

/** Models Groq answered 404 for, skipped for the lifetime of this instance. */
const retiredModels = new Set<string>();

/** Public endpoint spending our own API credits - keep casual abuse in check. */
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;

/** Rounds in which the model may call tools; the round after that must answer. */
const MAX_TOOL_ROUNDS = 2;

/**
 * Groq's free tier allows 8k tokens per minute per model, and the system prompt,
 * tool schemas, history and tool results are re-sent on every round. These caps
 * keep a typical question (one tool round, then the answer) near half of that.
 */
const MAX_TOOL_RESULT_CHARS = 5000;
const MAX_HISTORY_CHARS = 6000;
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;

const COMPLETION = { temperature: 0.5, max_tokens: 1024, stream: true } as const;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

interface Usage {
  prompt_tokens: number;
  completion_tokens: number;
}

interface StreamChunk {
  error?: unknown;
  choices?: Array<{
    delta?: {
      content?: string;
      tool_calls?: Array<{
        index?: number;
        id?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
  }>;
  x_groq?: { usage?: Usage };
}

/** Raised when Groq itself throttles us - quota, not a bug in our code. */
class GroqQuotaError extends Error {
  constructor(public readonly perDay: boolean) {
    super('groq quota exhausted');
  }
}

/** Groq rejected a function call the model produced (`tool_use_failed`). */
class ToolCallError extends Error {}

function quotaMessage(perDay: boolean) {
  return perDay
    ? "I've hit my daily question limit. Try again tomorrow, or email Liron at lironbenharrouch@gmail.com."
    : "I'm getting a lot of questions right now. Give me a minute and ask again.";
}

async function groq(body: Record<string, unknown>, apiKey: string, signal: AbortSignal) {
  let quota: GroqQuotaError | null = null;

  for (const model of MODELS) {
    if (retiredModels.has(model)) continue;

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        // gpt-oss reasons before it answers, and those tokens come out of the same
        // per-minute budget. Answering from tool data needs very little of it.
        ...(model.startsWith('openai/gpt-oss') ? { reasoning_effort: 'low' } : {}),
        ...body,
      }),
      signal,
    });

    if (response.ok) return { response, model };

    const detail = await response.text();
    if (response.status === 404 && detail.includes('model_not_found')) {
      console.error(`Groq no longer serves ${model} - update MODELS or GROQ_MODEL`);
      retiredModels.add(model);
      continue;
    }
    if (response.status === 429 || response.status === 413) {
      // Quotas are per model, so the next one may still have room. A visitor must
      // never see "Internal server error" because a budget ran out.
      quota = new GroqQuotaError(/per day|TPD|RPD/i.test(detail));
      continue;
    }
    if (detail.includes('tool_use_failed')) throw new ToolCallError(detail.slice(0, 300));
    throw new Error(`Groq ${response.status} (${model}): ${detail.slice(0, 300)}`);
  }

  throw quota ?? new Error('Groq serves none of the configured models');
}

/** Open a streamed round, offering the tools when they are given. */
async function openRound(
  messages: ChatMessage[],
  tools: unknown[] | null,
  apiKey: string,
  signal: AbortSignal
) {
  const withTools = tools ? { tools, tool_choice: 'auto' } : {};
  try {
    return await groq({ messages, ...COMPLETION, ...withTools }, apiKey, signal);
  } catch (error) {
    // A malformed function call must not cost the visitor their answer: retry
    // without tools and let the model answer from the system prompt.
    if (!(error instanceof ToolCallError) || !tools) throw error;
    console.warn('Tool call rejected, answering without tools');
    return groq({ messages, ...COMPLETION }, apiKey, signal);
  }
}

interface Round {
  text: string;
  toolCalls: ToolCall[];
  usage?: Usage;
}

/**
 * Read one streamed completion. Text is forwarded as it arrives; tool calls come
 * as fragments keyed by index and are reassembled. A question that needs no tool
 * is therefore answered by a single Groq call, streamed from the first token.
 */
async function readRound(response: Response, onText: (delta: string) => void): Promise<Round> {
  const round: Round = { text: '', toolCalls: [] };
  const reader = response.body?.getReader();
  if (!reader) return round;

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') continue;

      let chunk: StreamChunk;
      try {
        chunk = JSON.parse(payload);
      } catch {
        continue; // Keep-alive or partial frame.
      }

      if (chunk.error) {
        const detail = JSON.stringify(chunk.error).slice(0, 300);
        throw detail.includes('tool_use_failed')
          ? new ToolCallError(detail)
          : new Error(`Groq stream: ${detail}`);
      }

      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) {
        round.text += delta.content;
        onText(delta.content);
      }
      for (const part of delta?.tool_calls ?? []) {
        const index = part.index ?? 0;
        if (!round.toolCalls[index]) {
          round.toolCalls[index] = {
            id: '',
            type: 'function',
            function: { name: '', arguments: '' },
          };
        }
        const call = round.toolCalls[index];
        if (part.id) call.id = part.id;
        if (part.function?.name) call.function.name += part.function.name;
        if (part.function?.arguments) call.function.arguments += part.function.arguments;
      }
      if (chunk.x_groq?.usage) round.usage = chunk.x_groq.usage;
    }
  }

  round.toolCalls = round.toolCalls.filter((call) => call?.function.name);
  return round;
}

function parseArgs(raw: string): Record<string, unknown> {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    // Models emit the literal "null" for a zero-parameter tool, and
    // JSON.parse("null") succeeds - a try/catch alone lets a null through.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    // Malformed arguments: run the tool with no filters rather than failing.
    return {};
  }
}

/**
 * Only role + content are trusted from the client. The newest turns are kept
 * until the budget is spent - the latest question always survives - so a long
 * conversation can't grow past the per-minute token limit on its own.
 */
function trimHistory(incoming: unknown[]): ChatMessage[] {
  const clean = incoming
    .slice(-MAX_MESSAGES)
    .filter((m): m is ChatMessage => {
      const role = (m as ChatMessage | null)?.role;
      return role === 'user' || role === 'assistant';
    })
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? '')
        .slice(0, MAX_CHARS_PER_MESSAGE)
        .trim(),
    }))
    // An empty assistant turn (a stream that died) says nothing and some models reject it.
    .filter((m) => m.content);

  const kept: ChatMessage[] = [];
  let used = 0;
  for (let i = clean.length - 1; i >= 0; i--) {
    used += clean[i].content.length;
    if (used > MAX_HISTORY_CHARS && kept.length > 0) break;
    kept.unshift(clean[i]);
  }
  return kept;
}

/** The name people actually write: "Eliana Beauty", not "Eliana Beauty - Booking & CRM System". */
function shortTitle(title: string) {
  return title
    .split(/\s[-–—:]\s/)[0]
    .replace(/\s*\(.*\)\s*$/, '')
    .trim();
}

/** Two words are distinctive enough, and survive "Codii CRM" for "Codii CRM System". */
function mentionPattern(title: string) {
  const key = shortTitle(title).split(/\s+/).slice(0, 2).join(' ');
  return new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
}

/**
 * Cards for the projects the answer actually talks about, in the order it names
 * them. Falls back to the project the model looked up, for follow-ups such as
 * "which stack did it use?" whose answer never repeats the name.
 */
function pickCards(projects: Project[], answer: string, lookedUp: Set<string>) {
  // gpt-oss writes non-breaking hyphens (U+2011): "LLM‑Based CRM Agent".
  const text = answer.replace(/[‐-―]/g, '-');
  const named = projects
    .map((project) => ({ project, at: text.search(mentionPattern(project.title)) }))
    .filter(({ at }) => at !== -1)
    .sort((a, b) => a.at - b.at)
    .map(({ project }) => project);

  return (named.length ? named : projects.filter((p) => lookedUp.has(p.slug)))
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      year: p.year,
      image: p.image ?? p.coverImage ?? null,
      tags: p.tags.slice(0, 3).map((t) => t.name),
    }));
}

/**
 * Follow-up suggestions are derived, not generated: a second LLM call would cost
 * another round of tokens for three short strings, and these appear instantly.
 * Questions the visitor already asked are not offered again.
 */
function buildFollowUps(projectName: string | undefined, asked: string[]): string[] {
  const candidates = projectName
    ? [
        `What was the hardest part of ${projectName}?`,
        `Which stack did ${projectName} use?`,
        'Show me a different project',
      ]
    : [
        'What is his most complex AI project?',
        'How deep is his LangGraph and MCP experience?',
        'Is he available for hire?',
      ];
  const seen = new Set(asked.map((q) => q.trim().toLowerCase()));
  return candidates.filter((q) => !seen.has(q.toLowerCase()));
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(clientKey(req), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: 'Too many messages. Give me a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } }
    );
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Chat is not configured. Add GROQ_API_KEY to .env.local.' },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const history = trimHistory(Array.isArray(body?.messages) ? body.messages : []);
  if (history.at(-1)?.role !== 'user') {
    return NextResponse.json({ error: 'Messages must end with a user question' }, { status: 400 });
  }

  // Aborts every Groq request in flight once the visitor goes away mid-answer:
  // panel closed, tab navigated, page refreshed.
  const abort = new AbortController();
  req.signal.addEventListener('abort', () => abort.abort());

  try {
    // Giving the model the real slugs stops it inventing one for get_project_details.
    const projects = await data.getProjects();
    const catalogue = `\n\nPROJECT SLUGS (use these verbatim with get_project_details):\n${projects
      .map((p) => `- ${p.slug}: ${p.title}`)
      .join('\n')}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt + catalogue },
      ...history,
    ];
    const tools = getGroqTools();
    const asked = history.filter((m) => m.role === 'user').map((m) => m.content ?? '');
    const startedAt = Date.now();

    // The first round is opened before the response goes out, so a quota or
    // configuration failure still reaches the client as a real HTTP status.
    const first = await openRound(messages, tools, apiKey, abort.signal);

    const encoder = new TextEncoder();
    let clientGone = false;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: unknown) => {
          if (clientGone) return;
          try {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          } catch {
            // Controller already closed - the reader hung up. Stop writing.
            clientGone = true;
          }
        };

        let pending: Awaited<ReturnType<typeof groq>> | null = first;
        let answer = '';
        const toolsUsed: string[] = [];
        const lookedUp = new Set<string>();
        const modelsUsed = new Set<string>();
        const tokens = { prompt: 0, completion: 0 };
        let rounds = 0;
        let remaining: string | null = null;

        try {
          while (pending && !clientGone) {
            const { response, model } = pending;
            pending = null;
            rounds++;
            modelsUsed.add(model);
            remaining = response.headers.get('x-ratelimit-remaining-tokens');

            // Text from an earlier round ("let me check that") stays on screen;
            // keep the actual answer visually apart from it.
            const separator = answer ? '\n\n' : '';
            let roundText = '';

            let round: Round;
            try {
              round = await readRound(response, (delta) => {
                const value = roundText ? delta : separator + delta;
                roundText += delta;
                answer += value;
                send({ type: 'text', value });
              });
            } catch (error) {
              // A function call rejected mid-stream: replay the round without tools.
              if (error instanceof ToolCallError && !roundText) {
                pending = await openRound(messages, null, apiKey, abort.signal);
                continue;
              }
              throw error;
            }

            tokens.prompt += round.usage?.prompt_tokens ?? 0;
            tokens.completion += round.usage?.completion_tokens ?? 0;
            if (!round.toolCalls.length) break;

            messages.push({
              role: 'assistant',
              content: round.text || null,
              tool_calls: round.toolCalls,
            });
            for (const call of round.toolCalls) {
              const args = parseArgs(call.function.arguments);
              toolsUsed.push(call.function.name);
              if (typeof args.slug === 'string') lookedUp.add(args.slug);
              messages.push({
                role: 'tool',
                tool_call_id: call.id,
                name: call.function.name,
                content: await callTool(call.function.name, args, MAX_TOOL_RESULT_CHARS),
              });
            }

            // Let the UI show which portfolio data was consulted.
            send({ type: 'tools', names: [...new Set(toolsUsed)] });

            // Past the last tool round the tools are withheld, so the model has to
            // answer. (tool_choice "none" is no use: Groq rejects the request when
            // the model tries to call one anyway.)
            const offerTools = rounds < MAX_TOOL_ROUNDS ? tools : null;
            pending = await openRound(messages, offerTools, apiKey, abort.signal);
          }

          if (clientGone) return;

          if (!answer.trim()) {
            send({
              type: 'error',
              code: 'empty',
              value:
                "I couldn't put an answer together for that one. Try rephrasing it, or email Liron at lironbenharrouch@gmail.com.",
            });
            return;
          }

          const cards = pickCards(projects, answer, lookedUp);
          if (cards.length) send({ type: 'projects', items: cards });

          // Offered once the answer is complete, so the thread never dead-ends.
          send({
            type: 'followups',
            items: buildFollowUps(cards[0] && shortTitle(cards[0].title), asked),
          });
        } catch (error) {
          if (clientGone || abort.signal.aborted) return;
          if (error instanceof GroqQuotaError) {
            console.warn(
              `Groq quota exhausted mid-answer (${error.perDay ? 'daily' : 'per-minute'})`
            );
            send({ type: 'error', code: 'quota', value: quotaMessage(error.perDay) });
          } else {
            console.error('Chat stream error:', error);
            send({
              type: 'error',
              code: 'failed',
              value: 'My answer got cut off. Ask again in a moment.',
            });
          }
        } finally {
          // A round opened but never read (the visitor left) still holds a connection.
          await pending?.response.body?.cancel().catch(() => {});
          console.info(
            `[chat] ${[...modelsUsed].join('+')} rounds=${rounds} tools=${toolsUsed.join(',') || '-'} ` +
              `tokens=${tokens.prompt}+${tokens.completion} remaining/min=${remaining ?? '?'} ` +
              `${Date.now() - startedAt}ms`
          );
          try {
            controller.close();
          } catch {
            /* already closed by the client going away */
          }
        }
      },

      // Fires when the browser aborts: closing the panel, navigating, refreshing.
      cancel() {
        clientGone = true;
        abort.abort();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    if (error instanceof GroqQuotaError) {
      console.warn(`Groq quota exhausted (${error.perDay ? 'daily' : 'per-minute'})`);
      return NextResponse.json(
        { error: quotaMessage(error.perDay) },
        { status: 429, headers: { 'Retry-After': error.perDay ? '3600' : '60' } }
      );
    }
    console.error('Chat API error:', error);
    // In development, surface the real reason in the chat panel itself - a bare
    // "Internal server error" tells neither of us anything. Never in production.
    const detail = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development'
            ? `Server error: ${detail.slice(0, 300)}`
            : 'Something went wrong on my side. Try again, or email lironbenharrouch@gmail.com.',
      },
      { status: 500 }
    );
  }
}
