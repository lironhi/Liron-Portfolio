import { describe, expect, it } from 'vitest';
import { buildSystemPrompt } from '@/lib/chatbot/knowledge-base';
import { data } from '@/lib/data';

describe('buildSystemPrompt', async () => {
  const projects = await data.getProjects();
  const prompt = await buildSystemPrompt(projects);
  const site = await data.getSiteInfo();

  it('reads identity and contact facts from the data files', () => {
    expect(prompt).toContain(site.author.email);
    expect(prompt).toContain(site.author.bio);
    expect(prompt).toMatch(/French.*Hebrew.*English.*Spanish/);
  });

  it('lists every job with its headline and dates', async () => {
    for (const job of await data.getExperience()) {
      expect(prompt).toContain(job.company);
      expect(prompt).toContain(job.achievements[0]);
    }
    expect(prompt).toMatch(/Callisto \(Aug 2024 – present\)/);
  });

  it('states the education and the exact certificate list', () => {
    expect(prompt).toContain('SCE - Sami Shamoon College of Engineering');
    expect(prompt).toMatch(/online course, Udemy, 2022/);
    // Only course platforms in the data: the rule must lead with "none".
    expect(prompt).toMatch(/say first that he holds no professional certification/);
  });

  it('gives the model every real slug', () => {
    for (const p of projects) expect(prompt).toContain(`- ${p.slug}: `);
  });

  it('carries no stale hand-written copy of the CV', () => {
    expect(prompt).not.toMatch(/058-?686/); // the phone number lived here, unused
  });

  it('names the AI stack without listing every skill', () => {
    expect(prompt).toMatch(/LangGraph/);
    expect(prompt).toMatch(/MCP/);
    expect(prompt).not.toMatch(/\bJira\b/); // a tool, one get_skills call away
  });

  it('stays small - it is re-sent on every Groq call, against 8k tokens a minute', () => {
    // ~4 characters per token. Measured at ~5.3k when written: a jump means
    // something big started being inlined.
    expect(prompt.length).toBeLessThan(6000);
  });
});
