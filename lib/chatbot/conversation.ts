/**
 * Pure helpers around one chat turn: what history is kept, which project cards
 * go under the answer, which follow-ups are offered. No I/O - unit tested.
 */

import type { Project } from '@/lib/data';
import type { ChatMessage } from './groq';

/** Per-turn caps. Groq's free tier allows 8k tokens per minute per model. */
export const MAX_MESSAGES = 20;
export const MAX_CHARS_PER_MESSAGE = 2000;
export const MAX_HISTORY_CHARS = 6000;

/** A message as the browser sends it. */
export interface IncomingMessage {
  role?: unknown;
  content?: unknown;
  signature?: unknown;
}

/**
 * Only role + content are trusted from the client, and an assistant turn only
 * when `isAuthentic` vouches for it (see signing.ts). The newest turns are kept
 * until the budget is spent - the latest question always survives - so a long
 * conversation can't grow past the per-minute token limit on its own.
 */
export function trimHistory(
  incoming: unknown[],
  isAuthentic: (content: string, signature: unknown) => boolean
): ChatMessage[] {
  const clean = incoming
    .slice(-MAX_MESSAGES)
    .map((m) => (m && typeof m === 'object' ? (m as IncomingMessage) : {}))
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .filter((m) => m.role === 'user' || isAuthentic(String(m.content ?? ''), m.signature))
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content ?? '')
        .slice(0, MAX_CHARS_PER_MESSAGE)
        .trim(),
    }))
    // An empty assistant turn (a stream that died) says nothing and some models reject it.
    .filter((m) => m.content);

  const kept: ChatMessage[] = [];
  let used = 0;
  for (let i = clean.length - 1; i >= 0; i--) {
    used += clean[i].content.length;
    if (used > MAX_HISTORY_CHARS && kept.length > 0) break;
    kept.unshift(clean[i]);
  }
  return kept;
}

export function parseArgs(raw: string): Record<string, unknown> {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    // Models emit the literal "null" for a zero-parameter tool, and
    // JSON.parse("null") succeeds - a try/catch alone lets a null through.
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    // Malformed arguments: run the tool with no filters rather than failing.
    return {};
  }
}

/** The name people actually write: "Eliana Beauty", not "Eliana Beauty - Booking & CRM System". */
export function shortTitle(title: string) {
  return title
    .split(/\s[-–—:]\s/)[0]
    .replace(/\s*\(.*\)\s*$/, '')
    .trim();
}

/** Two words are distinctive enough, and survive "Codii CRM" for "Codii CRM System". */
function mentionPattern(title: string) {
  const key = shortTitle(title).split(/\s+/).slice(0, 2).join(' ');
  return new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
}

export interface ProjectCard {
  slug: string;
  title: string;
  summary: string;
  year: number;
  image: string | null;
  tags: string[];
}

/**
 * Cards for the projects the answer actually talks about, in the order it names
 * them. Falls back to the project the model looked up, for follow-ups such as
 * "which stack did it use?" whose answer never repeats the name.
 */
export function pickCards(
  projects: Project[],
  answer: string,
  lookedUp: Set<string>
): ProjectCard[] {
  // gpt-oss writes non-breaking hyphens (U+2011): "LLM‑Based CRM Agent".
  const text = answer.replace(/[‐-―]/g, '-');
  const named = projects
    .map((project) => ({ project, at: text.search(mentionPattern(project.title)) }))
    .filter(({ at }) => at !== -1)
    .sort((a, b) => a.at - b.at)
    .map(({ project }) => project);

  return (named.length ? named : projects.filter((p) => lookedUp.has(p.slug)))
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      year: p.year,
      image: p.image ?? p.coverImage ?? null,
      tags: p.tags.slice(0, 3).map((t) => t.name),
    }));
}

/**
 * Follow-up suggestions are derived, not generated: a second LLM call would cost
 * another round of tokens for three short strings, and these appear instantly.
 * They speak to the assistant the way it answers - as Liron, in the first
 * person - and questions the visitor already asked are not offered again.
 */
export function buildFollowUps(projectName: string | undefined, asked: string[]): string[] {
  const candidates = projectName
    ? [
        `What was the hardest part of ${projectName}?`,
        `Which stack did ${projectName} use?`,
        'Show me a different project',
      ]
    : [
        'What is your most complex AI project?',
        'How deep is your LangGraph and MCP experience?',
        'Are you available for hire?',
      ];
  const seen = new Set(asked.map((q) => q.trim().toLowerCase()));
  return candidates.filter((q) => !seen.has(q.toLowerCase()));
}
