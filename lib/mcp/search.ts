/**
 * Keyword search helpers behind the search_portfolio tool.
 */

/** Words that say nothing about what to look for. */
const STOP_WORDS = new Set(
  'a an and any are at about by did do does for from has have he his how in is it many much of on or the there to was what which who with you your number'.split(
    ' '
  )
);

/**
 * Split a query into terms, each matched on its own. A model writes queries like
 * "students taught Codii"; matched as one string, that found nothing at all.
 * Short terms ("AI", "C#") must match a whole word, or "ai" would hit "email".
 */
export function searchTerms(query: string): Array<(text: string) => boolean> {
  const words = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#.]+/u)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
  const terms = words.length ? words : [query.toLowerCase().trim()];

  return terms.map((term) => {
    if (term.length > 3) return (text: string) => text.includes(term);
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const word = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u');
    return (text: string) => word.test(text);
  });
}

/** Items matching the most terms first; items matching none are dropped. */
export function rank<T>(
  items: T[],
  fields: (item: T) => string[],
  terms: Array<(t: string) => boolean>
) {
  return items
    .map((item) => {
      const text = fields(item).join(' \n ').toLowerCase();
      return { item, score: terms.filter((match) => match(text)).length };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/** The lines that actually matched - the evidence, not just the item's name. */
export function matchingLines(lines: string[] | undefined, terms: Array<(t: string) => boolean>) {
  return (lines ?? [])
    .filter((line) => terms.some((match) => match(line.toLowerCase())))
    .slice(0, 3);
}
