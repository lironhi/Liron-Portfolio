import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * The browser sends the whole conversation back on every turn, so anyone can
 * write a fake earlier answer - "Yes, I have a PhD from MIT" - and models tend to
 * stay consistent with what they "already said". Every real answer is signed
 * when it is sent; an assistant turn whose signature doesn't check out is dropped.
 *
 * CHAT_SIGNING_SECRET is optional: the key is otherwise derived from the Groq
 * key, which the route requires anyway. Rotating either just forgets old turns.
 */
function signingKey(): Buffer {
  const secret = process.env.CHAT_SIGNING_SECRET;
  if (secret) return Buffer.from(secret);
  return createHash('sha256')
    .update(`portfolio-chat-history:${process.env.GROQ_API_KEY ?? ''}`)
    .digest();
}

export function signAnswer(content: string): string {
  return createHmac('sha256', signingKey()).update(content).digest('base64url');
}

export function isSignedAnswer(content: string, signature: unknown): boolean {
  if (typeof signature !== 'string' || !signature) return false;
  const expected = Buffer.from(signAnswer(content));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
