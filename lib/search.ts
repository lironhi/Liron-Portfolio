import FlexSearch from 'flexsearch';
import type { Project, Skill, Certificate, Experience } from './data/types';

export interface SearchResult {
  id: string;
  type: 'project' | 'skill' | 'certificate' | 'experience';
  title: string;
  description: string;
  url: string;
  tags?: string[];
}

// Store data separately
const projectsStore = new Map<string, Project>();
const skillsStore = new Map<string, Skill>();
const certificatesStore = new Map<string, Certificate>();
const experiencesStore = new Map<string, Experience>();

// Create simple search indexes
const projectIndex = new FlexSearch.Index({
  tokenize: 'forward',
  context: true,
});

const skillIndex = new FlexSearch.Index({
  tokenize: 'forward',
  context: true,
});

const certificateIndex = new FlexSearch.Index({
  tokenize: 'forward',
  context: true,
});

const experienceIndex = new FlexSearch.Index({
  tokenize: 'forward',
  context: true,
});

// Index data
export function indexProjects(projects: Project[]) {
  console.log('Indexing projects:', projects.length);

  projectsStore.clear();
  projects.forEach((project) => {
    projectsStore.set(project.slug, project);

    const searchText = [
      project.title,
      project.summary,
      ...project.tags.map((t) => t.name),
    ].join(' ');

    console.log('Adding project to index:', project.slug, searchText);
    projectIndex.add(project.slug, searchText);
  });

  console.log('Project indexing complete. Store size:', projectsStore.size);
}

export function indexSkills(skills: Skill[]) {
  console.log('Indexing skills:', skills.length);

  skillsStore.clear();
  skills.forEach((skill) => {
    skillsStore.set(skill.id, skill);

    const searchText = [
      skill.name,
      skill.description || '',
      skill.category,
    ].join(' ');

    skillIndex.add(skill.id, searchText);
  });

  console.log('Skill indexing complete. Store size:', skillsStore.size);
}

export function indexCertificates(certificates: Certificate[]) {
  console.log('Indexing certificates:', certificates.length);

  certificatesStore.clear();
  certificates.forEach((cert) => {
    certificatesStore.set(cert.id, cert);

    const searchText = [
      cert.name,
      cert.issuer,
      cert.description || '',
      cert.skills?.join(' ') || '',
    ].join(' ');

    certificateIndex.add(cert.id, searchText);
  });

  console.log('Certificate indexing complete. Store size:', certificatesStore.size);
}

export function indexExperiences(experiences: Experience[]) {
  console.log('Indexing experiences:', experiences.length);

  experiencesStore.clear();
  experiences.forEach((exp) => {
    experiencesStore.set(exp.id, exp);

    const searchText = [
      exp.company,
      exp.position,
      exp.description,
      exp.achievements.join(' '),
    ].join(' ');

    experienceIndex.add(exp.id, searchText);
  });

  console.log('Experience indexing complete. Store size:', experiencesStore.size);
}

// Search function
export async function search(query: string): Promise<SearchResult[]> {
  console.log('Search called with query:', query);
  if (!query || query.length < 2) return [];

  const results: SearchResult[] = [];

  // Search projects
  console.log('Searching projects... Store has', projectsStore.size, 'items');
  const projectResults = await projectIndex.search(query, { limit: 5 });
  console.log('Project search results:', projectResults);

  if (Array.isArray(projectResults)) {
    projectResults.forEach((id) => {
      const project = projectsStore.get(String(id));
      console.log('Looking up project:', id, 'Found:', !!project);
      if (project) {
        results.push({
          id: project.slug,
          type: 'project',
          title: project.title,
          description: project.summary,
          url: `/projects/${project.slug}`,
          tags: project.tags.map((t) => t.name),
        });
      }
    });
  }

  // Search skills
  console.log('Searching skills... Store has', skillsStore.size, 'items');
  const skillResults = await skillIndex.search(query, { limit: 5 });
  console.log('Skill search results:', skillResults);

  if (Array.isArray(skillResults)) {
    skillResults.forEach((id) => {
      const skill = skillsStore.get(String(id));
      console.log('Looking up skill:', id, 'Found:', !!skill);
      if (skill) {
        results.push({
          id: skill.id,
          type: 'skill',
          title: skill.name,
          description: `${skill.category} - ${skill.level}`,
          url: '/skills',
        });
      }
    });
  }

  // Search certificates
  console.log('Searching certificates... Store has', certificatesStore.size, 'items');
  const certResults = await certificateIndex.search(query, { limit: 5 });
  console.log('Certificate search results:', certResults);

  if (Array.isArray(certResults)) {
    certResults.forEach((id) => {
      const cert = certificatesStore.get(String(id));
      console.log('Looking up certificate:', id, 'Found:', !!cert);
      if (cert) {
        results.push({
          id: cert.id,
          type: 'certificate',
          title: cert.name,
          description: `Issued by ${cert.issuer}`,
          url: '/certifications',
        });
      }
    });
  }

  // Search experiences
  console.log('Searching experiences... Store has', experiencesStore.size, 'items');
  const expResults = await experienceIndex.search(query, { limit: 5 });
  console.log('Experience search results:', expResults);

  if (Array.isArray(expResults)) {
    expResults.forEach((id) => {
      const exp = experiencesStore.get(String(id));
      console.log('Looking up experience:', id, 'Found:', !!exp);
      if (exp) {
        results.push({
          id: exp.id,
          type: 'experience',
          title: `${exp.position} at ${exp.company}`,
          description: exp.description,
          url: '/experience',
        });
      }
    });
  }

  console.log('Final search results:', results);
  return results.slice(0, 10); // Limit to top 10 results
}
