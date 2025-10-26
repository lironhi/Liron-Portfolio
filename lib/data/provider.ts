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

export interface DataProvider {
  // Projects
  getProjects(): Promise<Project[]>;
  getProjectBySlug(slug: string): Promise<Project | null>;
  getFeaturedProjects(): Promise<Project[]>;
  getProjectsByTag(tagId: string): Promise<Project[]>;
  getAllTags(): Promise<Tag[]>;

  // Experience
  getExperience(): Promise<Experience[]>;
  getExperienceByType(type: Experience['type']): Promise<Experience[]>;

  // Skills
  getSkills(): Promise<Skill[]>;
  getSkillsByCategory(category: Skill['category']): Promise<Skill[]>;

  // Education
  getEducation(): Promise<Education[]>;

  // Certificates
  getCertificates(): Promise<Certificate[]>;
  getActiveCertificates(): Promise<Certificate[]>;

  // Pages
  getPages(): Promise<Page[]>;
  getPageBySlug(slug: string): Promise<Page | null>;

  // Site Information
  getSiteInfo(): Promise<SiteInfo>;

  // Currently
  getCurrently(): Promise<Currently>;

  // CV
  getCVData(): Promise<CVData>;
}