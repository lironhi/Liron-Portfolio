export interface Link {
  label: string;
  url: string;
  type?: 'repo' | 'demo' | 'external';
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  description?: string;
}

export interface ProjectChallenge {
  title: string;
  description: string;
  solution: string;
}

export interface Project {
  slug: string;
  title: string;
  summary: string;
  year: number;
  tags: Tag[];
  links: Link[];
  highlights: string[];
  content?: string;
  coverImage?: string;
  image?: string; // Alias for coverImage
  video?: string; // Path to video file (e.g., /projects/slug/demo.mp4)
  featured?: boolean;
  status?: 'completed' | 'in-progress' | 'planning';
  updatedAt?: string;
  createdAt?: string;
  // Case Study fields
  overview?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  metrics?: ProjectMetric[];
  challenges?: ProjectChallenge[];
  technologies?: string[];
  team?: string;
  duration?: string;
  impact?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  type: 'work' | 'internship' | 'freelance' | 'volunteer';
}

export interface Skill {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'tools' | 'databases' | 'cloud' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  description?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  location: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
  description?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
  skills?: string[];
}

export interface Page {
  slug: string;
  title: string;
  description: string;
  content: string;
  updatedAt: string;
  published: boolean;
}

export interface SiteInfo {
  name: string;
  title: string;
  description: string;
  url: string;
  author: {
    name: string;
    email: string;
    bio: string;
    location: string;
    avatar?: string;
    social: {
      github?: string;
      linkedin?: string;
      twitter?: string;
      email: string;
    };
  };
  navigation: {
    label: string;
    href: string;
    external?: boolean;
  }[];
  seo: {
    keywords: string[];
    ogImage?: string;
  };
}

/**
 * A thing being built, at work or on the side.
 *
 * Deliberately no `progress` percentage: "MCP, 60%" is unverifiable, and for
 * someone who already ships this in production it reads as catching up rather
 * than as delivering.
 */
export interface CurrentlyItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Where the work happens - shown as a small label on the card. */
  context?: string;
  technologies?: string[];
  link?: string;
}

export interface ShippedItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Year or month it went live. */
  when: string;
  link?: string;
}

export interface ExploringItem {
  id: string;
  title: string;
  icon: string;
}

export interface Currently {
  /** Paid work in flight right now. */
  shipping: CurrentlyItem[];
  /** Personal projects - the ones that show curiosity beyond the day job. */
  building: CurrentlyItem[];
  /** Done and live. Proof of velocity rather than intent. */
  shipped: ShippedItem[];
  exploring: ExploringItem[];
  lastUpdated: string;
}

export interface CVFile {
  language: 'en' | 'fr' | 'he';
  label: string;
  filename: string;
  url: string;
  lastUpdated: string;
}

export interface CVData {
  files: CVFile[];
  defaultLanguage: 'en' | 'fr' | 'he';
}
