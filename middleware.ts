import { type NextRequest, NextResponse } from 'next/server';

/**
 * Server-side gate for /admin. The page used to compare the password in the
 * browser ("admin123"), so the secret shipped in the public JS bundle.
 *
 * HTTP Basic auth against ADMIN_PASSWORD (any user name). Without the variable
 * the page is open in development and does not exist in production: closed by
 * default, so a missing env var can't publish it.
 */
export function middleware(req: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV === 'development') return NextResponse.next();
    // Rewriting to a path no route matches renders the regular 404 page.
    return NextResponse.rewrite(new URL('/__admin-disabled', req.url), { status: 404 });
  }

  if (sameString(basicAuthPassword(req), password)) return NextResponse.next();

  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="admin", charset="UTF-8"' },
  });
}

/** Password half of `Authorization: Basic base64(user:password)`, or null. */
function basicAuthPassword(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return null;
  try {
    const decoded = atob(header.slice(6));
    const colon = decoded.indexOf(':');
    return colon === -1 ? null : decoded.slice(colon + 1);
  } catch {
    return null;
  }
}

/** Constant-time comparison; the edge runtime has no node:crypto timingSafeEqual. */
function sameString(given: string | null, expected: string) {
  if (given === null || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
