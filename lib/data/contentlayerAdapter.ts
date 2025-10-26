import fs from 'fs';
import path from 'path';
import { allProjects } from 'contentlayer/generated';
import type { Project as ContentlayerProject } from 'contentlayer/generated';
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

class ContentlayerAdapter implements DataProvider {
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

  private convertContentlayerProject(clProject: ContentlayerProject): Project {
    return {
      slug: clProject.slug,
      title: clProject.title,
      summary: clProject.summary,
      year: clProject.year,
      tags: clProject.tags || [],
      links: clProject.links || [],
      highlights: clProject.highlights || [],
      content: clProject.body.code, // Contentlayer MDX compiled code
      coverImage: clProject.coverImage,
      featured: clProject.featured,
      status: clProject.status,
      updatedAt: clProject.updatedAt || new Date().toISOString(),
      createdAt: clProject.createdAt || new Date().toISOString(),
    };
  }

  async getProjects(): Promise<Project[]> {
    return allProjects
      .map((p) => this.convertContentlayerProject(p))
      .sort((a, b) => b.year - a.year);
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const clProject = allProjects.find((p) => p.slug === slug);
    if (!clProject) {
      return null;
    }
    return this.convertContentlayerProject(clProject);
  }

  async getFeaturedProjects(): Promise<Project[]> {
    return allProjects
      .filter((p) => p.featured)
      .map((p) => this.convertContentlayerProject(p))
      .sort((a, b) => b.year - a.year);
  }

  async getProjectsByTag(tagId: string): Promise<Project[]> {
    return allProjects
      .filter((p) => p.tags?.some((tag: any) => tag.id === tagId || tag.name === tagId))
      .map((p) => this.convertContentlayerProject(p))
      .sort((a, b) => b.year - a.year);
  }

  async getAllTags(): Promise<Tag[]> {
    const tagMap = new Map<string, Tag>();

    for (const project of allProjects) {
      if (project.tags) {
        for (const tag of project.tags as any[]) {
          if (!tagMap.has(tag.id)) {
            tagMap.set(tag.id, tag);
          }
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

export const contentlayerAdapter = new ContentlayerAdapter();
