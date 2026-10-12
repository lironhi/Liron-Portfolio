import { type NextRequest, NextResponse } from 'next/server';
import {
  buildFollowUps,
  parseArgs,
  pickCards,
  shortTitle,
  trimHistory,
} from '@/lib/chatbot/conversation';
import {
  type ChatMessage,
  GroqQuotaError,
  type OpenedRound,
  openRound,
  quotaMessage,
  type Round,
  readRound,
  ToolCallError,
} from '@/lib/chatbot/groq';
import { buildSystemPrompt } from '@/lib/chatbot/knowledge-base';
import { isSignedAnswer, signAnswer } from '@/lib/chatbot/signing';
import { data } from '@/lib/data';
import { callTool, getGroqTools } from '@/lib/mcp/registry';
import { checkLimits, clientKey, type LimitWindow } from '@/lib/rateLimit';

// fs access (the tools read from data/ and content/) rules out the edge runtime.
export const runtime = 'nodejs';

/**
 * Public endpoint spending our own API credits. Per minute against bursts; per
 * day because a single script at 15/min drains Groq's 1k requests/day in about an
 * hour, for every visitor. The daily cap defaults to production only - the eval
 * suite fires ~40 questions from localhost in one run - and CHAT_DAILY_LIMIT
 * overrides it (and switches it on locally).
 */
const DAILY_LIMIT =
  Number(process.env.CHAT_DAILY_LIMIT) || (process.env.NODE_ENV === 'production' ? 40 : 0);

const LIMITS: LimitWindow[] = [
  { name: 'chat-minute', limit: 15, windowMs: 60_000 },
  ...(DAILY_LIMIT > 0 ? [{ name: 'chat-day', limit: DAILY_LIMIT, windowMs: 86_400_000 }] : []),
];

/** Rounds in which the model may call tools; the round after that must answer. */
const MAX_TOOL_ROUNDS = 2;

/** Tool results are re-sent on every following round, against 8k tokens per minute. */
const MAX_TOOL_RESULT_CHARS = 5000;

export async function POST(req: NextRequest) {
  const limited = await checkLimits(clientKey(req), LIMITS);
  if (!limited.ok) {
    return NextResponse.json(
      {
        error:
          limited.exceeded === 'chat-day'
            ? "You've reached today's question limit. Email Liron at lironbenharrouch@gmail.com - he answers himself."
            : 'Too many messages. Give me a moment and try again.',
      },
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
  const history = trimHistory(
    Array.isArray(body?.messages) ? body.messages : [],
    // A forged "earlier answer" never reaches the model - see signing.ts.
    isSignedAnswer
  );
  if (history.at(-1)?.role !== 'user') {
    return NextResponse.json({ error: 'Messages must end with a user question' }, { status: 400 });
  }

  // Aborts every Groq request in flight once the visitor goes away mid-answer:
  // panel closed, tab navigated, page refreshed.
  const abort = new AbortController();
  req.signal.addEventListener('abort', () => abort.abort());

  try {
    const projects = await data.getProjects();
    const messages: ChatMessage[] = [
      { role: 'system', content: await buildSystemPrompt(projects) },
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

        let pending: OpenedRound | null = first;
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

          // The client sends this back with the answer on the next turn.
          send({ type: 'signature', value: signAnswer(answer) });

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
