import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { middleware } from '@/middleware';

function request(auth?: string) {
  return new NextRequest('https://liron-portfolio.vercel.app/admin', {
    headers: auth ? { authorization: `Basic ${btoa(auth)}` } : {},
  });
}

describe('/admin gate', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not exist in production without ADMIN_PASSWORD', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_PASSWORD', '');
    const res = middleware(request());
    expect(res.status).toBe(404);
    expect(res.headers.get('x-middleware-rewrite')).toContain('/__admin-disabled');
  });

  it('stays open in development without a password', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('ADMIN_PASSWORD', '');
    expect(middleware(request()).headers.get('x-middleware-next')).toBe('1');
  });

  it('asks for credentials, and refuses wrong ones', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_PASSWORD', 's3cret:with-colon');
    for (const res of [middleware(request()), middleware(request('admin:wrong'))]) {
      expect(res.status).toBe(401);
      expect(res.headers.get('www-authenticate')).toMatch(/^Basic/);
    }
  });

  it('lets the right password through, whatever the user name', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_PASSWORD', 's3cret:with-colon');
    const res = middleware(request('anyone:s3cret:with-colon'));
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('never trusts the old client-side password', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('ADMIN_PASSWORD', 's3cret');
    expect(middleware(request('admin:admin123')).status).toBe(401);
  });
});
