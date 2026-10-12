import { describe, expect, it } from 'vitest';
import { digestCaseStudy } from '@/lib/mcp/case-study';
import { callTool, fitForModel } from '@/lib/mcp/registry';
import { matchingLines, rank, searchTerms } from '@/lib/mcp/search';

describe('digestCaseStudy', () => {
  const mdx = `# Demo Project

The overview paragraph.

## 🔑 Key Features
- Fast booking

## Getting Started
Run npm install, then log in with admin / admin.

## What I Learned
Conflict detection is hard. See [the docs](https://example.com).

\`\`\`ts
const secret = 'code samples are dropped';
\`\`\`

![screenshot](/img.png)

## Future Enhancements
- Blockchain payments

## Problem & Solution
**Problem**: salons lose bookings.
`;

  it('leads with the overview, then challenges and lessons before features', () => {
    const digest = digestCaseStudy(mdx, 3000) ?? '';
    expect(digest.startsWith('The overview paragraph.')).toBe(true);
    const order = ['What I Learned', 'Problem & Solution', 'Key Features'].map((h) =>
      digest.indexOf(h)
    );
    expect(order.every((at) => at > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('drops code, images, link targets, setup steps and the roadmap', () => {
    const digest = digestCaseStudy(mdx, 3000) ?? '';
    expect(digest).not.toMatch(/code samples|screenshot|example\.com|npm install|Blockchain/);
    expect(digest).toContain('See the docs.');
    expect(digest).toContain('Problem: salons lose bookings.');
  });

  it('stays within budget, and says nothing for an empty body', () => {
    expect((digestCaseStudy(mdx.repeat(20), 500) ?? '').length).toBeLessThanOrEqual(500);
    expect(digestCaseStudy('   ', 500)).toBeUndefined();
    expect(digestCaseStudy(undefined, 500)).toBeUndefined();
  });
});

describe('fitForModel', () => {
  it('re-serialises JSON compactly and drops empty values inside objects', () => {
    const text = `Found 1:\n\n${JSON.stringify([{ a: 1, b: null, c: '', d: [], e: [null, 2] }], null, 2)}`;
    expect(fitForModel(text, 5000)).toBe('Found 1:\n[{"a":1,"e":[null,2]}]');
  });

  it('drops per-item detail from a long list instead of cutting the list', () => {
    const items = Array.from({ length: 14 }, (_, i) => ({
      slug: `project-${i}`,
      highlights: ['x'.repeat(300)],
    }));
    const out = fitForModel(`Found 14:\n${JSON.stringify(items)}`, 2000);
    expect(out).toContain('per-item details omitted');
    expect(out).not.toContain('highlights');
    expect(out).toContain('project-13');
  });

  it('truncates visibly as a last resort, and passes plain text through', () => {
    const huge = `List:\n${JSON.stringify(Array.from({ length: 500 }, (_, i) => ({ slug: `p${i}` })))}`;
    expect(fitForModel(huge, 300)).toMatch(/\.\.\. \[truncated]$/);
    expect(fitForModel('Project "x" not found.', 300)).toBe('Project "x" not found.');
  });
});

describe('search helpers', () => {
  const jobs = [
    { name: 'Callisto', lines: ['Led a 6-person IT team', 'Built a LangGraph agent system'] },
    { name: 'Codii', lines: ['Taught Python to 100+ students', 'Built the Codii CRM'] },
    { name: 'Freelance', lines: ['Sent the client an email update'] },
  ];
  const fields = (j: (typeof jobs)[number]) => [j.name, ...j.lines];

  it('matches words separately and ranks by how many match', () => {
    // As one string, "students Codii" matched nothing at all.
    const terms = searchTerms('How many students did you teach at Codii?');
    expect(rank(jobs, fields, terms).map((j) => j.name)).toEqual(['Codii']);
  });

  it('matches short terms as whole words only', () => {
    expect(rank(jobs, fields, searchTerms('AI')).map((j) => j.name)).toEqual([]);
    expect(rank(jobs, fields, searchTerms('IT')).map((j) => j.name)).toEqual(['Callisto']);
  });

  it('returns the matching lines as evidence', () => {
    expect(matchingLines(jobs[1].lines, searchTerms('students'))).toEqual([
      'Taught Python to 100+ students',
    ]);
  });
});

describe('tools against the real content', () => {
  it('get_project_details carries the case study and fits the budget', async () => {
    const out = await callTool('get_project_details', { slug: 'eliana-beauty' }, 5000);
    expect(out.length).toBeLessThanOrEqual(5000);
    expect(out).toContain('caseStudy');
    expect(out).toMatch(/availability/i);
  });

  it('get_projects lists all fourteen projects within budget', async () => {
    const out = await callTool('get_projects', {}, 5000);
    expect(out.length).toBeLessThanOrEqual(5000);
    expect(out).toContain('Found 14 project(s)');
    expect(out).toContain('covid19-information-system'); // last in the list
  });

  it('search_portfolio finds the students figure from a multi-word query', async () => {
    const out = await callTool('search_portfolio', { query: 'students Codii' }, 5000);
    expect(out).toContain('100+ students');
  });
});
