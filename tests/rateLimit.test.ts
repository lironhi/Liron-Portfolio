import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkLimits, clientKey, rateLimit } from '@/lib/rateLimit';

const MINUTE = { name: 'minute', limit: 3, windowMs: 60_000 };
const DAY = { name: 'day', limit: 5, windowMs: 86_400_000 };

/** In-memory counters are module-level: a fresh id per test keeps them apart. */
const freshId = () => randomUUID();

describe('in-memory windows', () => {
  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('KV_REST_API_URL', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('refuses the request past the limit, with a Retry-After', () => {
    const id = freshId();
    for (let i = 0; i < 3; i++) expect(rateLimit(id, 3, 60_000).ok).toBe(true);
    const refused = rateLimit(id, 3, 60_000);
    expect(refused.ok).toBe(false);
    expect(refused.retryAfter).toBeGreaterThan(0);
  });

  it('names the window that refused - a day cap behind a looser minute cap', async () => {
    const id = freshId();
    const tight = { ...DAY, limit: 2 };
    expect((await checkLimits(id, [MINUTE, tight])).ok).toBe(true);
    expect((await checkLimits(id, [MINUTE, tight])).remaining).toBe(0);

    const refused = await checkLimits(id, [MINUTE, tight]);
    expect(refused).toMatchObject({ ok: false, exceeded: 'day' });
  });

  it('reports the tightest remaining count', async () => {
    const result = await checkLimits(freshId(), [MINUTE, DAY]);
    expect(result).toMatchObject({ ok: true, remaining: 2 });
  });
});

describe('shared store (Upstash REST)', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io/');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('counts every window in one pipelined request', async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        { result: 1 },
        { result: 1 },
        { result: 60_000 },
        { result: 6 },
        { result: 0 },
        { result: 7_200_000 },
      ])
    );

    const result = await checkLimits('203.0.113.7', [MINUTE, DAY]);

    expect(result).toEqual({ ok: false, remaining: 0, retryAfter: 7200, exceeded: 'day' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.upstash.io/pipeline');
    expect(init.headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(init.body)).toEqual([
      ['INCR', 'ratelimit:minute:203.0.113.7'],
      ['PEXPIRE', 'ratelimit:minute:203.0.113.7', '60000', 'NX'],
      ['PTTL', 'ratelimit:minute:203.0.113.7'],
      ['INCR', 'ratelimit:day:203.0.113.7'],
      ['PEXPIRE', 'ratelimit:day:203.0.113.7', '86400000', 'NX'],
      ['PTTL', 'ratelimit:day:203.0.113.7'],
    ]);
  });

  it('also reads the KV_* names the Vercel integration sets', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('KV_REST_API_URL', 'https://kv.example.io');
    vi.stubEnv('KV_REST_API_TOKEN', 'kv-token');
    fetchMock.mockResolvedValue(Response.json([{ result: 1 }, { result: 1 }, { result: 60_000 }]));

    expect((await checkLimits(freshId(), [MINUTE])).ok).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe('https://kv.example.io/pipeline');
  });

  it('falls back to memory when the store is down, instead of letting everything through', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error('network down'));
    const id = freshId();
    const tight = { ...MINUTE, limit: 1 };

    expect((await checkLimits(id, [tight])).ok).toBe(true);
    expect((await checkLimits(id, [tight])).ok).toBe(false);
  });
});

describe('clientKey', () => {
  it('takes the first address of x-forwarded-for', () => {
    const req = new Request('https://x', {
      headers: { 'x-forwarded-for': '203.0.113.7, 10.0.0.1' },
    });
    expect(clientKey(req)).toBe('203.0.113.7');
  });
});
