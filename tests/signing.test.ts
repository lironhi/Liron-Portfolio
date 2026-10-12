import { afterEach, describe, expect, it, vi } from 'vitest';
import { isSignedAnswer, signAnswer } from '@/lib/chatbot/signing';

describe('answer signing', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('accepts an answer with its own signature', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test');
    const answer = 'I hold a B.Sc. in Software Engineering.';
    expect(isSignedAnswer(answer, signAnswer(answer))).toBe(true);
  });

  it('rejects an edited answer, a missing signature, and junk', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test');
    const signature = signAnswer('I hold a B.Sc.');
    expect(isSignedAnswer('I hold a PhD.', signature)).toBe(false);
    expect(isSignedAnswer('I hold a B.Sc.', undefined)).toBe(false);
    expect(isSignedAnswer('I hold a B.Sc.', '')).toBe(false);
    expect(isSignedAnswer('I hold a B.Sc.', 42)).toBe(false);
    expect(isSignedAnswer('I hold a B.Sc.', 'short')).toBe(false);
  });

  it('prefers CHAT_SIGNING_SECRET, so another key never validates', () => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test');
    const derived = signAnswer('answer');
    vi.stubEnv('CHAT_SIGNING_SECRET', 'a-real-secret');
    expect(isSignedAnswer('answer', derived)).toBe(false);
    expect(isSignedAnswer('answer', signAnswer('answer'))).toBe(true);
  });
});
