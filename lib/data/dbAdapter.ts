import type { DataProvider } from './provider';
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

export class DatabaseAdapter implements DataProvider {
  async getProjects(): Promise<Project[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getProjectBySlug(_slug: string): Promise<Project | null> {
    throw new Error('Database adapter not implemented yet');
  }

  async getFeaturedProjects(): Promise<Project[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getProjectsByTag(_tagId: string): Promise<Project[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getAllTags(): Promise<Tag[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getExperience(): Promise<Experience[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getExperienceByType(_type: Experience['type']): Promise<Experience[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getSkills(): Promise<Skill[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getSkillsByCategory(_category: Skill['category']): Promise<Skill[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getEducation(): Promise<Education[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getCertificates(): Promise<Certificate[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getActiveCertificates(): Promise<Certificate[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getPages(): Promise<Page[]> {
    throw new Error('Database adapter not implemented yet');
  }

  async getPageBySlug(_slug: string): Promise<Page | null> {
    throw new Error('Database adapter not implemented yet');
  }

  async getSiteInfo(): Promise<SiteInfo> {
    throw new Error('Database adapter not implemented yet');
  }

  async getCurrently(): Promise<Currently> {
    throw new Error('Database adapter not implemented yet');
  }

  async getCVData(): Promise<CVData> {
    throw new Error('Database adapter not implemented yet');
  }
}

export const dbAdapter = new DatabaseAdapter();
