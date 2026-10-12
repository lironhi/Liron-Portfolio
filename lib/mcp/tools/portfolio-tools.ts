/**
 * Portfolio MCP Tools
 * Provides dynamic access to projects, skills, and experience data
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { data } from '@/lib/data';

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
function digestCaseStudy(mdx: string | undefined, maxChars: number): string | undefined {
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

/**
 * Register all portfolio-related tools with the MCP server
 */
export function registerPortfolioTools(server: McpServer) {
  // ==========================================
  // PROJECT TOOLS
  // ==========================================

  /**
   * Get all projects with optional filtering
   */
  server.tool(
    'get_projects',
    'Retrieve all portfolio projects with optional filtering by featured status or tags',
    {
      featured: z.boolean().optional().describe('Filter for featured projects only'),
      tag: z
        .string()
        .optional()
        .describe('Filter projects by tag name (e.g., "React", "Python", "AI")'),
      limit: z.number().optional().describe('Limit number of results'),
    },
    async ({ featured, tag, limit }) => {
      try {
        let projects = await data.getProjects();

        // Filter by featured
        if (featured !== undefined) {
          projects = projects.filter((p) => p.featured === featured);
        }

        // Filter by tag
        if (tag) {
          projects = projects.filter((p) =>
            p.tags.some((t) => t.name.toLowerCase().includes(tag.toLowerCase()))
          );
        }

        // Limit results
        if (limit) {
          projects = projects.slice(0, limit);
        }

        // Format response with key information
        const projectSummaries = projects.map((p) => ({
          title: p.title,
          slug: p.slug,
          summary: p.summary,
          year: p.year,
          status: p.status,
          tags: p.tags.map((t) => t.name),
          technologies: p.technologies || [],
          highlights: p.highlights,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${projectSummaries.length} project(s):\n\n${JSON.stringify(projectSummaries, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Get detailed information about a specific project
   */
  server.tool(
    'get_project_details',
    'Get one project in depth: summary, stack, highlights, links, and its written case study (overview, challenges, what was learned, architecture). Use it for any question about a specific project.',
    {
      slug: z.string().describe('Project slug identifier (e.g., "covid19-information-system")'),
    },
    async ({ slug }) => {
      try {
        const project = await data.getProjectBySlug(slug);

        if (!project) {
          return {
            content: [
              {
                type: 'text',
                text: `Project "${slug}" not found. Please check the slug and try again.`,
              },
            ],
            isError: true,
          };
        }

        // Comprehensive project details
        const details = {
          title: project.title,
          summary: project.summary,
          year: project.year,
          status: project.status,
          overview: project.overview,
          problem: project.problem,
          solution: project.solution,
          architecture: project.architecture,
          technologies: project.technologies || [],
          tags: project.tags.map((t) => t.name),
          highlights: project.highlights,
          metrics: project.metrics,
          challenges: project.challenges,
          links: project.links,
          team: project.team,
          duration: project.duration,
          impact: project.impact,
          caseStudy: digestCaseStudy(project.content, 3000),
        };

        return {
          content: [
            {
              type: 'text',
              text: `Project Details for "${project.title}":\n\n${JSON.stringify(details, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching project details: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // SKILL TOOLS
  // ==========================================

  /**
   * Search and retrieve skills information
   */
  server.tool(
    'get_skills',
    'Retrieve skills with optional filtering by category, level, or search term',
    {
      category: z
        .enum(['languages', 'frameworks', 'tools', 'databases', 'cloud', 'other'])
        .optional()
        .describe('Filter by skill category'),
      level: z
        .enum(['beginner', 'intermediate', 'advanced', 'expert'])
        .optional()
        .describe('Filter by proficiency level'),
      search: z.string().optional().describe('Search skills by name'),
    },
    async ({ category, level, search }) => {
      try {
        let skills = await data.getSkills();

        // Filter by category
        if (category) {
          skills = skills.filter((s) => s.category === category);
        }

        // Filter by level
        if (level) {
          skills = skills.filter((s) => s.level === level);
        }

        // Search by name
        if (search) {
          skills = skills.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));
        }

        const skillSummaries = skills.map((s) => ({
          name: s.name,
          category: s.category,
          level: s.level,
          yearsOfExperience: s.yearsOfExperience,
          description: s.description,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${skillSummaries.length} skill(s):\n\n${JSON.stringify(skillSummaries, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching skills: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // EXPERIENCE TOOLS
  // ==========================================

  /**
   * Get work experience and professional background
   */
  server.tool(
    'get_experience',
    'Retrieve work history - roles, dates, and achievements with their figures (team size, students taught, time saved) - optionally filtered by company or type',
    {
      type: z
        .enum(['work', 'internship', 'freelance', 'volunteer'])
        .optional()
        .describe('Filter by experience type'),
      company: z.string().optional().describe('Filter by company name'),
    },
    async ({ type, company }) => {
      try {
        let experiences = await data.getExperience();

        // Filter by type
        if (type) {
          experiences = experiences.filter((e) => e.type === type);
        }

        // Filter by company
        if (company) {
          experiences = experiences.filter((e) =>
            e.company.toLowerCase().includes(company.toLowerCase())
          );
        }

        const experienceSummaries = experiences.map((e) => ({
          company: e.company,
          position: e.position,
          startDate: e.startDate,
          endDate: e.endDate || 'Present',
          location: e.location,
          type: e.type,
          description: e.description,
          achievements: e.achievements,
          technologies: e.technologies,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Found ${experienceSummaries.length} experience(s):\n\n${JSON.stringify(experienceSummaries, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching experience: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // EDUCATION & CERTIFICATES TOOLS
  // ==========================================

  /**
   * Get education background
   */
  server.tool(
    'get_education',
    'Retrieve educational background and academic achievements',
    {},
    async () => {
      try {
        const education = await data.getEducation();

        const educationDetails = education.map((e) => ({
          institution: e.institution,
          degree: e.degree,
          field: e.field,
          startDate: e.startDate,
          endDate: e.endDate || 'Present',
          location: e.location,
          gpa: e.gpa,
          honors: e.honors,
          coursework: e.coursework,
          description: e.description,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Education:\n\n${JSON.stringify(educationDetails, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching education: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  /**
   * Get certifications
   */
  server.tool(
    'get_certificates',
    'Retrieve professional certifications and credentials',
    {
      activeOnly: z.boolean().optional().describe('Show only active (non-expired) certificates'),
    },
    async ({ activeOnly }) => {
      try {
        const certificates = activeOnly
          ? await data.getActiveCertificates()
          : await data.getCertificates();

        const certDetails = certificates.map((c) => ({
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate,
          credentialUrl: c.credentialUrl,
          description: c.description,
          skills: c.skills,
        }));

        return {
          content: [
            {
              type: 'text',
              text: `Certificates (${activeOnly ? 'Active only' : 'All'}):\n\n${JSON.stringify(certDetails, null, 2)}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching certificates: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // ==========================================
  // CURRENTLY SECTION TOOL
  // ==========================================

  /**
   * Get current activities (learning, working on, reading, exploring)
   */
  server.tool(
    'get_currently',
    'Get what Liron is currently shipping at work, building on the side, has recently shipped, or is exploring',
    {},
    async () => {
      try {
        const currently = await data.getCurrently();

        return {
          content: [
            {
              type: 'text',
              text: `Currently (Last updated: ${currently.lastUpdated}):\n\n${JSON.stringify(
                {
                  shipping: currently.shipping,
                  building: currently.building,
                  shipped: currently.shipped,
                  exploring: currently.exploring,
                },
                null,
                2
              )}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error fetching currently data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
