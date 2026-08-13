import { type NextRequest, NextResponse } from 'next/server';
import { systemPrompt } from '@/lib/chatbot/knowledge-base';
import { data } from '@/lib/data';
import { callTool, getGroqTools } from '@/lib/mcp/registry';
import { clientKey, rateLimit } from '@/lib/rateLimit';

// fs access (the tools read from data/ and content/) rules out the edge runtime.
export const runtime = 'nodejs';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

/** Public endpoint spending our own API credits - keep casual abuse in check. */
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;

/** Hard stop on tool round-trips so a confused model can't loop forever. */
const MAX_TOOL_ROUNDS = 2;

/**
 * Tool output is re-sent with every subsequent request, and Groq's free tier
 * allows 12k tokens per minute. Keep results tight - a summary, not a dump.
 */
const MAX_TOOL_RESULT_CHARS = 2500;

const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;

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

/**
 * Follow-up suggestions are derived, not generated: a second LLM call would cost
 * another round of tokens against a 12k/minute budget for three short strings.
 * Deterministic also means they appear instantly, with no extra latency.
 */
function buildFollowUps(projectTitle?: string): string[] {
  if (projectTitle) {
    return [
      `What was the hardest part of ${projectTitle}?`,
      `Which stack did ${projectTitle} use?`,
      'Show me a different project',
    ];
  }
  return [
    'What is his most complex AI project?',
    'How deep is his LangGraph and MCP experience?',
    'Is he available for hire?',
  ];
}

/** Raised when Groq itself throttles us - quota, not a bug in our code. */
class GroqQuotaError extends Error {
  constructor(public readonly perDay: boolean) {
    super('groq quota exhausted');
  }
}

async function groq(body: Record<string, unknown>, apiKey: string) {
  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, ...body }),
  });

  if (!response.ok) {
    const detail = await response.text();
    if (response.status === 429) {
      // Free tier caps both tokens-per-minute and tokens-per-day. A visitor must
      // never see "Internal server error" because the daily budget ran out.
      throw new GroqQuotaError(/per day|TPD/i.test(detail));
    }
    throw new Error(`Groq ${response.status}: ${detail.slice(0, 300)}`);
  }

  return response;
}

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const incoming = Array.isArray(body?.messages) ? body.messages : [];
    if (incoming.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Only trust role + content from the client, and cap the payload.
    const history: ChatMessage[] = incoming
      .slice(-MAX_MESSAGES)
      .filter((m: ChatMessage) => m?.role === 'user' || m?.role === 'assistant')
      .map((m: ChatMessage) => ({
        role: m.role,
        content: String(m.content ?? '').slice(0, MAX_CHARS_PER_MESSAGE),
      }));

    // Giving the model the real slugs stops it inventing one for get_project_details,
    // which is what makes Llama emit a malformed call and Groq reject the request.
    const projects = await data.getProjects();
    const catalogue = `\n\nPROJECT SLUGS (use these verbatim with get_project_details):\n${projects
      .map((p) => `- ${p.slug}: ${p.title}`)
      .join('\n')}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt + catalogue },
      ...history,
    ];

    const tools = getGroqTools();
    const toolsUsed: string[] = [];
    const slugsSeen = new Set<string>();

    // ---- Tool rounds: let the model pull real data before it answers -------
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      let json: { choices?: Array<{ message?: ChatMessage }> };
      try {
        const response = await groq(
          { messages, tools, tool_choice: 'auto', temperature: 0.5, max_tokens: 1024 },
          apiKey
        );
        json = await response.json();
      } catch (error) {
        // Llama occasionally emits a malformed function call and Groq answers 400
        // `tool_use_failed`. That must not surface as a 500 - drop the tools and
        // let the model answer from the system prompt instead.
        if (error instanceof Error && error.message.includes('tool_use_failed')) {
          console.warn('Tool call malformed, answering without tools');
          break;
        }
        throw error;
      }

      const choice = json.choices?.[0]?.message as ChatMessage | undefined;

      if (!choice?.tool_calls?.length) {
        // Model answered directly - nothing to look up.
        messages.push({ role: 'assistant', content: choice?.content ?? '' });
        break;
      }

      messages.push(choice);

      for (const call of choice.tool_calls) {
        let args: Record<string, unknown> = {};
        try {
          args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        } catch {
          // Malformed arguments: run the tool with no filters rather than failing.
        }

        toolsUsed.push(call.function.name);
        const result = await callTool(call.function.name, args);

        // Tool payloads are JSON blobs carrying "slug": "..." - pull them out so the
        // UI can render real project cards next to the answer.
        for (const match of result.matchAll(/"slug":\s*"([a-z0-9-]+)"/g)) {
          slugsSeen.add(match[1]);
        }
        if (typeof args.slug === 'string') slugsSeen.add(args.slug);

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: result.slice(0, MAX_TOOL_RESULT_CHARS),
        });
      }
    }

    // ---- Final answer, streamed ------------------------------------------
    // Drop the assistant draft from the last round so the model writes the
    // answer fresh, now that the tool results are in the conversation.
    const forFinal = [...messages];
    const last = forFinal[forFinal.length - 1];
    if (last?.role === 'assistant' && !last.tool_calls) {
      forFinal.pop();
    }

    const streamed = await groq(
      { messages: forFinal, temperature: 0.5, max_tokens: 1024, stream: true },
      apiKey
    );

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: unknown) =>
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

        if (toolsUsed.length) {
          // Let the UI show which portfolio data was consulted.
          send({ type: 'tools', names: [...new Set(toolsUsed)] });
        }

        // Real project cards for whatever the tools surfaced.
        const cards = projects
          .filter((p) => slugsSeen.has(p.slug))
          .slice(0, 3)
          .map((p) => ({
            slug: p.slug,
            title: p.title,
            summary: p.summary,
            year: p.year,
            image: p.image ?? p.coverImage ?? null,
            tags: p.tags.slice(0, 3).map((t) => t.name),
          }));
        if (cards.length) send({ type: 'projects', items: cards });

        const reader = streamed.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = '';
        try {
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

              try {
                const chunk = JSON.parse(payload);
                const delta = chunk.choices?.[0]?.delta?.content;
                if (delta) send({ type: 'text', value: delta });
              } catch {
                // Ignore keep-alive and partial frames.
              }
            }
          }

          // Offered once the answer is complete, so the thread never dead-ends.
          send({ type: 'followups', items: buildFollowUps(cards[0]?.title) });
        } catch (error) {
          console.error('Chat stream error:', error);
          send({ type: 'error', value: 'stream interrupted' });
        } finally {
          controller.close();
        }
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
        {
          error: error.perDay
            ? "I've hit my daily question limit. Try again tomorrow, or email Liron at lironbenharrouch@gmail.com."
            : "I'm getting a lot of questions right now. Give me a minute and ask again.",
        },
        { status: 429, headers: { 'Retry-After': error.perDay ? '3600' : '60' } }
      );
    }
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
