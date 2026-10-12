/**
 * Groq client for the chatbot: model fallback, quota detection, and the parser
 * that turns one streamed completion into text deltas and tool calls.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const DEFAULT_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

/**
 * Tried in order. Groq retires models with little notice - llama-3.3-70b-versatile
 * vanished and every single question answered 500 until the code changed. Each
 * model also has its own per-minute token bucket, so the second one absorbs a
 * burst that throttles the first. GROQ_MODEL swaps the primary without a code change.
 */
function modelChain() {
  return [...new Set([process.env.GROQ_MODEL || DEFAULT_MODEL, FALLBACK_MODEL])];
}

/** Models Groq answered 404 for, skipped for the lifetime of this instance. */
const retiredModels = new Set<string>();

export const COMPLETION = { temperature: 0.5, max_tokens: 1024, stream: true } as const;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface Usage {
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
export class GroqQuotaError extends Error {
  constructor(public readonly perDay: boolean) {
    super('groq quota exhausted');
  }
}

/** Groq rejected a function call the model produced (`tool_use_failed`). */
export class ToolCallError extends Error {}

export function quotaMessage(perDay: boolean) {
  return perDay
    ? "I've hit my daily question limit. Try again tomorrow, or email Liron at lironbenharrouch@gmail.com."
    : "I'm getting a lot of questions right now. Give me a minute and ask again.";
}

export interface OpenedRound {
  response: Response;
  model: string;
}

export async function groq(
  body: Record<string, unknown>,
  apiKey: string,
  signal?: AbortSignal
): Promise<OpenedRound> {
  let quota: GroqQuotaError | null = null;

  for (const model of modelChain()) {
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
      console.error(`Groq no longer serves ${model} - update GROQ_MODEL or lib/chatbot/groq.ts`);
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
export async function openRound(
  messages: ChatMessage[],
  tools: unknown[] | null,
  apiKey: string,
  signal?: AbortSignal
): Promise<OpenedRound> {
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

export interface Round {
  text: string;
  toolCalls: ToolCall[];
  usage?: Usage;
}

/**
 * Read one streamed completion. Text is forwarded as it arrives; tool calls come
 * as fragments keyed by index and are reassembled. A question that needs no tool
 * is therefore answered by a single Groq call, streamed from the first token.
 */
export async function readRound(
  response: Response,
  onText: (delta: string) => void
): Promise<Round> {
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
