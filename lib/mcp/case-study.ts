/**
 * Turns a project's MDX body into a compact digest a model can afford to read.
 */

/** Case-study sections worth a model's limited context, best first. */
const CASE_STUDY_PRIORITY = [
  /challenge|hardest|lesson|learn/i,
  /problem|goal|why/i,
  /result|impact|benefit|outcome/i,
  /architecture|stack|technical|implementation/i,
  /feature|capabilit/i,
];

/**
 * Setup material answers no visitor's question, and a roadmap is worse than
 * useless: a model reading it tends to present unbuilt features as shipped ones.
 */
const CASE_STUDY_SKIP =
  /getting started|install|prerequisite|credential|project structure|usage example|deployment requirement|setup|future|roadmap/i;

/**
 * The MDX body is the real case study, but it runs 5-22k characters and is mostly
 * code samples. Keep the prose, and spend the budget on the sections that answer
 * interview-style questions ("what was the hardest part?") before the feature lists.
 */
export function digestCaseStudy(mdx: string | undefined, maxChars: number): string | undefined {
  if (!mdx?.trim()) return undefined;

  const prose = mdx
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*|__|`/g, '');

  // Split on h2: the intro sits before the first one, h3s stay inside their section.
  const [intro, ...sections] = prose.split(/^## /m);
  const squash = (text: string) => text.replace(/\n\s*\n+/g, '\n').trim();

  const ranked = sections
    .map((section) => {
      const heading = section.slice(0, section.indexOf('\n')).trim();
      const rank = CASE_STUDY_PRIORITY.findIndex((re) => re.test(heading));
      return { heading, body: squash(section.slice(heading.length)), rank };
    })
    .filter((s) => s.body && !CASE_STUDY_SKIP.test(s.heading))
    .sort(
      (a, b) =>
        (a.rank === -1 ? CASE_STUDY_PRIORITY.length : a.rank) -
        (b.rank === -1 ? CASE_STUDY_PRIORITY.length : b.rank)
    );

  // The h1 repeats the title; the paragraph under it is the overview.
  let digest = squash(intro.replace(/^# .*$/m, '')).slice(0, 600);
  for (const { heading, body } of ranked) {
    const room = maxChars - digest.length;
    if (room < 200) break;
    digest += `\n## ${heading}\n${body.slice(0, room - heading.length - 5)}`;
  }
  return digest.trim();
}
