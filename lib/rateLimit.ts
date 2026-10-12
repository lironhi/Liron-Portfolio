/**
 * Fixed-window rate limiter.
 *
 * Counters live in Upstash Redis when it is configured, so every serverless
 * instance shares them - that is what makes a per-day cap mean anything.
 * Without it (local dev, or before the store is set up) each instance keeps its
 * own in-memory Map: still enough to throttle casual abuse and runaway scripts.
 * Upstash is reached over its REST API with plain fetch, so there is no
 * dependency, and a store outage falls back to memory instead of failing open.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Drop expired entries so the Map can't grow without bound. */
function sweep(now: number) {
  if (windows.size < 500) return;
  for (const [key, win] of windows) {
    if (win.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets - suitable for a Retry-After header. */
  retryAfter: number;
}

/** In-memory window, local to this instance. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfter };
  }

  return { ok: true, remaining: limit - existing.count, retryAfter };
}

export interface LimitWindow {
  /** Part of the counter key, and reported back when this window is the one exceeded. */
  name: string;
  limit: number;
  windowMs: number;
}

export interface LimitsResult extends RateLimitResult {
  /** The window that refused the request, when one did. */
  exceeded?: string;
}

/** Vercel's Upstash integration has shipped both naming schemes. */
function upstash() {
  // `||`, not `??`: a variable defined but left empty must not hide the other name.
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

/** One pipelined round trip for every window: INCR, set the expiry once, read the TTL. */
async function countShared(
  store: { url: string; token: string },
  id: string,
  list: LimitWindow[]
): Promise<Array<{ count: number; ttlMs: number }>> {
  const commands = list.flatMap((w) => {
    const key = `ratelimit:${w.name}:${id}`;
    return [
      ['INCR', key],
      ['PEXPIRE', key, String(w.windowMs), 'NX'],
      ['PTTL', key],
    ];
  });

  const response = await fetch(`${store.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${store.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Upstash ${response.status}`);

  const results = (await response.json()) as Array<{ result?: number; error?: string }>;
  return list.map((w, i) => {
    const [incr, , ttl] = results.slice(i * 3, i * 3 + 3);
    if (incr?.error || typeof incr?.result !== 'number') throw new Error('Upstash INCR failed');
    const ttlMs = typeof ttl?.result === 'number' && ttl.result > 0 ? ttl.result : w.windowMs;
    return { count: incr.result, ttlMs };
  });
}

let warnedStoreDown = false;

/**
 * Count one request against every window. Refused as soon as one is over its
 * limit; `remaining` is the tightest of them.
 */
export async function checkLimits(id: string, list: LimitWindow[]): Promise<LimitsResult> {
  const store = upstash();
  let counts: Array<{ count: number; ttlMs: number }> | null = null;

  if (store) {
    try {
      counts = await countShared(store, id, list);
    } catch (error) {
      if (!warnedStoreDown) {
        console.warn('Rate-limit store unreachable, counting in memory:', error);
        warnedStoreDown = true;
      }
    }
  }

  const results: Array<RateLimitResult & { name: string }> = list.map((w, i) => {
    if (!counts) return { name: w.name, ...rateLimit(`${w.name}:${id}`, w.limit, w.windowMs) };
    const { count, ttlMs } = counts[i];
    return {
      name: w.name,
      ok: count <= w.limit,
      remaining: Math.max(0, w.limit - count),
      retryAfter: count <= w.limit ? 0 : Math.max(1, Math.ceil(ttlMs / 1000)),
    };
  });

  const refused = results.find((r) => !r.ok);
  if (refused) {
    return { ok: false, remaining: 0, retryAfter: refused.retryAfter, exceeded: refused.name };
  }
  return {
    ok: true,
    remaining: Math.min(...results.map((r) => r.remaining)),
    retryAfter: 0,
  };
}

/** Best-effort client IP behind Vercel's proxy. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
