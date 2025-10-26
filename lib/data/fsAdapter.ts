import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  Certificate,
  Currently,
  CVData,
  Education,
  Experience,
  Page,
  Project,
  SiteInfo,
  Skill,
  Tag,
} from './types';
import type { DataProvider } from './provider';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_DIR = path.join(process.cwd(), 'content');

class FileSystemAdapter implements DataProvider {
  private async readJsonFile<T>(filename: string): Promise<T> {
    try {
      const filePath = path.join(DATA_DIR, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContents) as T;
    } catch (error) {
      console.error(`Error reading ${filename}:`, error);
      throw new Error(`Failed to read ${filename}`);
    }
  }

  private async readMdxFile(slug: string): Promise<{ content: string; frontmatter: any } | null> {
    try {
      const filePath = path.join(CONTENT_DIR, 'projects', `${slug}.mdx`);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      return { content, frontmatter: data };
    } catch (error) {
      console.error(`Error reading MDX file ${slug}:`, error);
      return null;
    }
  }

  private getAllMdxFiles(): string[] {
    try {
      const projectsDir = path.join(CONTENT_DIR, 'projects');
      if (!fs.existsSync(projectsDir)) {
        return [];
      }
      return fs
        .readdirSync(projectsDir)
        .filter((file) => file.endsWith('.mdx'))
        .map((file) => file.replace('.mdx', ''));
    } catch (error) {
      console.error('Error reading MDX files:', error);
      return [];
    }
  }

  async getProjects(): Promise<Project[]> {
    const slugs = this.getAllMdxFiles();
    const projects: Project[] = [];

    for (const slug of slugs) {
      const mdxData = await this.readMdxFile(slug);
      if (mdxData) {
        const { frontmatter, content } = mdxData;
        projects.push({
          slug,
          title: frontmatter.title || slug,
          summary: frontmatter.summary || '',
          year: frontmatter.year || new Date().getFullYear(),
          tags: frontmatter.tags || [],
          links: frontmatter.links || [],
          highlights: frontmatter.highlights || [],
          content,
          coverImage: frontmatter.coverImage,
          featured: frontmatter.featured || false,
          status: frontmatter.status || 'completed',
          updatedAt: frontmatter.updatedAt || new Date().toISOString(),
          createdAt: frontmatter.createdAt || new Date().toISOString(),
        });
      }
    }

    return projects.sort((a, b) => b.year - a.year);
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const mdxData = await this.readMdxFile(slug);
    if (!mdxData) {
      return null;
    }

    const { frontmatter, content } = mdxData;
    return {
      slug,
      title: frontmatter.title || slug,
      summary: frontmatter.summary || '',
      year: frontmatter.year || new Date().getFullYear(),
      tags: frontmatter.tags || [],
      links: frontmatter.links || [],
      highlights: frontmatter.highlights || [],
      content,
      coverImage: frontmatter.coverImage,
      featured: frontmatter.featured || false,
      status: frontmatter.status || 'completed',
      updatedAt: frontmatter.updatedAt || new Date().toISOString(),
      createdAt: frontmatter.createdAt || new Date().toISOString(),
    };
  }

  async getFeaturedProjects(): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter((project) => project.featured);
  }

  async getProjectsByTag(tagId: string): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects.filter((project) =>
      project.tags.some((tag) => tag.id === tagId || tag.name === tagId)
    );
  }

  async getAllTags(): Promise<Tag[]> {
    const projects = await this.getProjects();
    const tagMap = new Map<string, Tag>();

    for (const project of projects) {
      for (const tag of project.tags) {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      }
    }

    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  async getExperience(): Promise<Experience[]> {
    return this.readJsonFile<Experience[]>('experience.json');
  }

  async getExperienceByType(type: Experience['type']): Promise<Experience[]> {
    const experience = await this.getExperience();
    return experience.filter((exp) => exp.type === type);
  }

  async getSkills(): Promise<Skill[]> {
    return this.readJsonFile<Skill[]>('skills.json');
  }

  async getSkillsByCategory(category: Skill['category']): Promise<Skill[]> {
    const skills = await this.getSkills();
    return skills.filter((skill) => skill.category === category);
  }

  async getEducation(): Promise<Education[]> {
    return this.readJsonFile<Education[]>('education.json');
  }

  async getCertificates(): Promise<Certificate[]> {
    return this.readJsonFile<Certificate[]>('certificates.json');
  }

  async getActiveCertificates(): Promise<Certificate[]> {
    const certificates = await this.getCertificates();
    const now = new Date();
    return certificates.filter((cert) => {
      if (!cert.expiryDate) return true;
      return new Date(cert.expiryDate) > now;
    });
  }

  async getPages(): Promise<Page[]> {
    return this.readJsonFile<Page[]>('pages.json');
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    const pages = await this.getPages();
    return pages.find((page) => page.slug === slug) || null;
  }

  async getSiteInfo(): Promise<SiteInfo> {
    return this.readJsonFile<SiteInfo>('site.json');
  }

  async getCurrently(): Promise<Currently> {
    return this.readJsonFile<Currently>('currently.json');
  }

  async getCVData(): Promise<CVData> {
    return this.readJsonFile<CVData>('cv.json');
  }
}

export const fsAdapter = new FileSystemAdapter();