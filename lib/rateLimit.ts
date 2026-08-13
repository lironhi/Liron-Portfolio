/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory on purpose: no extra dependency, no extra env var. On serverless
 * each instance keeps its own counter, so this throttles casual abuse and
 * runaway scripts rather than a distributed attack. If the endpoint ever needs
 * a hard guarantee, swap the Map for Redis - the call site stays identical.
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

/** Best-effort client IP behind Vercel's proxy. */
export function clientKey(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
