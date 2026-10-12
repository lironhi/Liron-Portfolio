/**
 * Action MCP Tools
 * Provides actionable tools for contact, navigation, and user interactions
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { data } from '@/lib/data';

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
function searchTerms(query: string): Array<(text: string) => boolean> {
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
function rank<T>(items: T[], fields: (item: T) => string[], terms: Array<(t: string) => boolean>) {
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
function matchingLines(lines: string[] | undefined, terms: Array<(t: string) => boolean>) {
  return (lines ?? [])
    .filter((line) => terms.some((match) => match(line.toLowerCase())))
    .slice(0, 3);
}

/**
 * Register all action-related tools with the MCP server
 */
export function registerActionTools(server: McpServer) {
  // ==========================================
  // CONTACT TOOLS
  // ==========================================

  /**
   * Prepare contact form with pre-filled information
   */
  server.tool(
    'prepare_contact',
    'Generate a pre-filled contact form URL for the user to easily reach out',
    {
      subject: z.string().optional().describe('Email subject or inquiry topic'),
      message: z.string().optional().describe('Pre-filled message content'),
    },
    async ({ subject, message }) => {
      try {
        const siteInfo = await data.getSiteInfo();
        const params = new URLSearchParams();

        if (subject) params.set('subject', subject);
        if (message) params.set('message', message);

        const contactUrl = `/contact${params.toString() ? `?${params.toString()}` : ''}`;

        return {
          content: [
            {
              type: 'text',
              text: `To get in touch with Liron, visit: ${contactUrl}\n\nYou can also reach out directly:\n- Email: ${siteInfo.author.email}\n- LinkedIn: ${siteInfo.author.social.linkedin}\n- GitHub: ${siteInfo.author.social.github}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error preparing contact: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Get contact information
   */
  server.tool(
    'get_contact_info',
    'Retrieve contact information and social media links',
    {},
    async () => {
      try {
        const siteInfo = await data.getSiteInfo();

        const contactInfo = {
          name: siteInfo.author.name,
          email: siteInfo.author.email,
          location: siteInfo.author.location,
          social: {
            github: siteInfo.author.social.github,
            linkedin: siteInfo.author.social.linkedin,
            twitter: siteInfo.author.social.twitter,
          },
          bio: siteInfo.author.bio,
        };

        return {
          content: [
            {
              type: 'text',
              text: `Contact Information:\n\n${JSON.stringify(contactInfo, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching contact info: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // CV/RESUME TOOLS
  // ==========================================

  /**
   * Get CV download links
   */
  server.tool(
    'get_cv_download',
    'Get download links for CV/Resume in different languages',
    {
      language: z.enum(['en', 'fr', 'he']).optional().describe('Preferred language for CV'),
    },
    async ({ language }) => {
      try {
        const cvData = await data.getCVData();

        // If specific language requested
        if (language) {
          const cvFile = cvData.files.find((f) => f.language === language);
          if (!cvFile) {
            return {
              content: [
                {
                  type: 'text',
                  text: `CV in "${language}" language not available. Available languages: ${cvData.files.map((f) => f.language).join(', ')}`,
                },
              ],
            };
          }

          return {
            content: [
              {
                type: 'text',
                text: `Download CV (${cvFile.label}):\n${cvFile.url}\n\nLast updated: ${cvFile.lastUpdated}`,
              },
            ],
          };
        }

        // Return all available CVs
        const cvLinks = cvData.files.map((f) => ({
          language: f.language,
          label: f.label,
          url: f.url,
          lastUpdated: f.lastUpdated,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Available CV Downloads:\n\n${JSON.stringify(cvLinks, null, 2)}\n\nDefault language: ${cvData.defaultLanguage}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching CV data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // NAVIGATION TOOLS
  // ==========================================

  /**
   * Get navigation structure and available pages
   */
  server.tool(
    'get_navigation',
    'Get website navigation structure and available pages',
    {},
    async () => {
      try {
        const siteInfo = await data.getSiteInfo();

        const navigation = {
          mainNav: siteInfo.navigation.map((n) => ({
            label: n.label,
            href: n.href,
            external: n.external,
          })),
          pages: [
            { label: 'Home', href: '/', description: 'Landing page and introduction' },
            { label: 'About', href: '/about', description: 'Personal background and story' },
            { label: 'Projects', href: '/projects', description: 'Portfolio projects showcase' },
            { label: 'Experience', href: '/experience', description: 'Work experience and career' },
            { label: 'Skills', href: '/skills', description: 'Technical skills and expertise' },
            { label: 'Resume', href: '/resume', description: 'Professional resume/CV' },
            { label: 'Contact', href: '/contact', description: 'Get in touch' },
            {
              label: 'Currently',
              href: '/currently',
              description: 'Current activities and interests',
            },
          ],
        };

        return {
          content: [
            {
              type: 'text',
              text: `Website Navigation:\n\n${JSON.stringify(navigation, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching navigation: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // SEARCH & DISCOVERY TOOLS
  // ==========================================

  /**
   * Search across all portfolio content
   */
  server.tool(
    'search_portfolio',
    'Search projects, skills and work experience (including achievements and metrics) by keywords. Returns the matching lines themselves.',
    {
      query: z.string().describe('Keywords, e.g. "LangGraph" or "students Codii"'),
    },
    async ({ query }) => {
      try {
        const [projects, skills, experience] = await Promise.all([
          data.getProjects(),
          data.getSkills(),
          data.getExperience(),
        ]);

        const terms = searchTerms(query);

        const matchingProjects = rank(
          projects,
          (p) => [
            p.title,
            p.summary,
            ...p.tags.map((t) => t.name),
            ...(p.technologies ?? []),
            ...p.highlights,
          ],
          terms
        ).slice(0, 6);

        const matchingSkills = rank(skills, (s) => [s.name, s.description ?? ''], terms).slice(
          0,
          6
        );

        // Achievements carry the figures (team size, students, time saved), and
        // they were not searched at all - "how many students?" came back empty.
        const matchingExperience = rank(
          experience,
          (e) => [e.company, e.position, e.description, ...e.technologies, ...e.achievements],
          terms
        ).slice(0, 3);

        const results = {
          query,
          totalResults: matchingProjects.length + matchingSkills.length + matchingExperience.length,
          projects: matchingProjects.map((p) => ({
            title: p.title,
            slug: p.slug,
            summary: p.summary,
            matches: matchingLines(p.highlights, terms),
          })),
          skills: matchingSkills.map((s) => ({
            name: s.name,
            category: s.category,
            level: s.level,
            yearsOfExperience: s.yearsOfExperience,
            description: s.description,
          })),
          experience: matchingExperience.map((e) => ({
            company: e.company,
            position: e.position,
            startDate: e.startDate,
            endDate: e.endDate || 'Present',
            matches: matchingLines([e.description, ...e.achievements], terms),
          })),
        };

        return {
          content: [
            {
              type: 'text',
              text: `Search results for "${query}":\n\n${JSON.stringify(results, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error searching portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Get recommended projects based on interest
   */
  server.tool(
    'recommend_projects',
    'Get project recommendations based on user interests or technologies',
    {
      interest: z
        .string()
        .describe('Area of interest (e.g., "AI", "web development", "automation")'),
    },
    async ({ interest }) => {
      try {
        const projects = await data.getProjects();
        const interestLower = interest.toLowerCase();

        // Score projects based on relevance
        const scoredProjects = projects
          .map((p) => {
            let score = 0;

            // Check title and summary
            if (p.title.toLowerCase().includes(interestLower)) score += 3;
            if (p.summary.toLowerCase().includes(interestLower)) score += 2;

            // Check tags
            if (p.tags.some((t) => t.name.toLowerCase().includes(interestLower))) score += 2;

            // Check technologies
            if (p.technologies?.some((tech) => tech.toLowerCase().includes(interestLower)))
              score += 2;

            // Boost featured projects slightly
            if (p.featured) score += 0.5;

            return { project: p, score };
          })
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        const recommendations = scoredProjects.map(({ project, score }) => ({
          title: project.title,
          slug: project.slug,
          summary: project.summary,
          relevanceScore: score,
          tags: project.tags.map((t) => t.name),
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Recommended projects for "${interest}":\n\n${JSON.stringify(recommendations, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
