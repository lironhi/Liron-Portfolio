/**
 * Action MCP Tools
 * Provides actionable tools for contact, navigation, and user interactions
 */

import { z } from 'zod';
import type { McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import { data } from '@/lib/data';

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
            { label: 'Currently', href: '/currently', description: 'Current activities and interests' },
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
    'Search across projects, skills, and experience for specific keywords',
    {
      query: z.string().describe('Search query'),
    },
    async ({ query }) => {
      try {
        const [projects, skills, experience] = await Promise.all([
          data.getProjects(),
          data.getSkills(),
          data.getExperience(),
        ]);

        const searchLower = query.toLowerCase();

        // Search projects
        const matchingProjects = projects.filter(
          (p) =>
            p.title.toLowerCase().includes(searchLower) ||
            p.summary.toLowerCase().includes(searchLower) ||
            p.tags.some((t) => t.name.toLowerCase().includes(searchLower)) ||
            (p.technologies &&
              p.technologies.some((tech) => tech.toLowerCase().includes(searchLower)))
        );

        // Search skills
        const matchingSkills = skills.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            (s.description && s.description.toLowerCase().includes(searchLower))
        );

        // Search experience
        const matchingExperience = experience.filter(
          (e) =>
            e.company.toLowerCase().includes(searchLower) ||
            e.position.toLowerCase().includes(searchLower) ||
            e.description.toLowerCase().includes(searchLower) ||
            e.technologies.some((tech) => tech.toLowerCase().includes(searchLower))
        );

        const results = {
          query,
          totalResults:
            matchingProjects.length + matchingSkills.length + matchingExperience.length,
          projects: matchingProjects.map((p) => ({
            title: p.title,
            slug: p.slug,
            summary: p.summary,
          })),
          skills: matchingSkills.map((s) => ({
            name: s.name,
            category: s.category,
            level: s.level,
          })),
          experience: matchingExperience.map((e) => ({
            company: e.company,
            position: e.position,
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
            if (
              p.technologies &&
              p.technologies.some((tech) => tech.toLowerCase().includes(interestLower))
            )
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
