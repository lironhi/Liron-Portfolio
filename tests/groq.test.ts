import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** A Response whose body arrives in the given raw chunks - split anywhere. */
function sse(chunks: string[]) {
  const encoder = new TextEncoder();
  return new Response(
    new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
        controller.close();
      },
    })
  );
}

const frame = (payload: unknown) => `data: ${JSON.stringify(payload)}\n\n`;

/** Fresh module per test: the set of retired models lives at module level. */
async function load() {
  vi.resetModules();
  return import('@/lib/chatbot/groq');
}

describe('readRound', () => {
  it('forwards text deltas and reassembles tool calls split across chunks', async () => {
    const { readRound } = await load();
    const raw =
      frame({ choices: [{ delta: { content: 'Let me ' } }] }) +
      frame({ choices: [{ delta: { content: 'check.' } }] }) +
      frame({
        choices: [
          {
            delta: {
              tool_calls: [
                { index: 0, id: 'call_1', function: { name: 'get_project', arguments: '{"sl' } },
              ],
            },
          },
        ],
      }) +
      frame({
        choices: [
          {
            delta: {
              tool_calls: [{ index: 0, function: { name: '_details', arguments: 'ug":"x"}' } }],
            },
          },
        ],
      }) +
      frame({
        choices: [{ delta: {} }],
        x_groq: { usage: { prompt_tokens: 10, completion_tokens: 3 } },
      }) +
      'data: [DONE]\n\n';

    // Cut the stream mid-frame to exercise the line buffer.
    const cut = Math.floor(raw.length / 2);
    const deltas: string[] = [];
    const round = await readRound(sse([raw.slice(0, cut), raw.slice(cut)]), (d) => deltas.push(d));

    expect(deltas).toEqual(['Let me ', 'check.']);
    expect(round.text).toBe('Let me check.');
    expect(round.toolCalls).toEqual([
      {
        id: 'call_1',
        type: 'function',
        function: { name: 'get_project_details', arguments: '{"slug":"x"}' },
      },
    ]);
    expect(round.usage).toEqual({ prompt_tokens: 10, completion_tokens: 3 });
  });

  it('turns an in-stream tool_use_failed into a ToolCallError', async () => {
    const { readRound, ToolCallError } = await load();
    const response = sse([frame({ error: { code: 'tool_use_failed', message: 'bad call' } })]);
    await expect(readRound(response, () => {})).rejects.toBeInstanceOf(ToolCallError);
  });

  it('skips keep-alive lines and malformed frames', async () => {
    const { readRound } = await load();
    const response = sse([
      ': ping\n\n',
      'data: {oops\n\n',
      frame({ choices: [{ delta: { content: 'ok' } }] }),
    ]);
    expect((await readRound(response, () => {})).text).toBe('ok');
  });
});

describe('groq', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('GROQ_MODEL', '');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const sentModels = () => fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).model);

  it('skips a retired model, and keeps skipping it', async () => {
    const { groq } = await load();
    fetchMock
      .mockResolvedValueOnce(new Response('{"error":{"code":"model_not_found"}}', { status: 404 }))
      .mockResolvedValue(new Response('ok'));

    expect((await groq({}, 'key')).model).toBe('openai/gpt-oss-20b');
    await groq({}, 'key');

    expect(sentModels()).toEqual([
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'openai/gpt-oss-20b',
    ]);
  });

  it('falls through to the next model on a quota, then reports a daily quota', async () => {
    const { groq, GroqQuotaError } = await load();
    fetchMock.mockImplementation(
      async () =>
        new Response('Rate limit reached on tokens per day (TPD): Limit 200000', { status: 429 })
    );

    const error = await groq({}, 'key').catch((e) => e);
    expect(error).toBeInstanceOf(GroqQuotaError);
    expect(error.perDay).toBe(true);
    expect(sentModels()).toEqual(['openai/gpt-oss-120b', 'openai/gpt-oss-20b']);
  });

  it('reads a per-minute quota as such', async () => {
    const { groq } = await load();
    fetchMock.mockImplementation(
      async () => new Response('tokens per minute (TPM): Limit 8000', { status: 429 })
    );
    expect((await groq({}, 'key').catch((e) => e)).perDay).toBe(false);
  });

  it('asks gpt-oss for low reasoning effort, and nothing of other models', async () => {
    vi.stubEnv('GROQ_MODEL', 'qwen/qwen3.8-27b');
    const { groq } = await load();
    fetchMock.mockResolvedValue(new Response('ok'));

    await groq({ messages: [] }, 'key');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe('qwen/qwen3.8-27b');
    expect(body).not.toHaveProperty('reasoning_effort');
  });

  it('retries without tools when Groq rejects the function call', async () => {
    const { openRound } = await load();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock
      .mockResolvedValueOnce(new Response('{"error":{"code":"tool_use_failed"}}', { status: 400 }))
      .mockResolvedValue(new Response('ok'));

    await openRound([], [{ type: 'function' }], 'key');

    const [first, second] = fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body));
    expect(first.tools).toHaveLength(1);
    expect(first.reasoning_effort).toBe('low');
    expect(second).not.toHaveProperty('tools');
  });

  it('surfaces any other failure as an error, not a quota', async () => {
    const { groq, GroqQuotaError } = await load();
    fetchMock.mockResolvedValue(new Response('upstream exploded', { status: 500 }));
    const error = await groq({}, 'key').catch((e) => e);
    expect(error).not.toBeInstanceOf(GroqQuotaError);
    expect(error.message).toContain('Groq 500');
  });
});
