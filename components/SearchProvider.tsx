'use client';

import { useEffect } from 'react';
import type { Certificate, Experience, Project, Skill } from '@/lib/data/types';
import { indexCertificates, indexExperiences, indexProjects, indexSkills } from '@/lib/search';

interface SearchProviderProps {
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
  experiences: Experience[];
  children: React.ReactNode;
}

export function SearchProvider({
  projects,
  skills,
  certificates,
  experiences,
  children,
}: SearchProviderProps) {
  useEffect(() => {
    // Index all data when component mounts
    console.log('SearchProvider indexing data:', {
      projects: projects.length,
      skills: skills.length,
      certificates: certificates.length,
      experiences: experiences.length,
    });

    indexProjects(projects);
    indexSkills(skills);
    indexCertificates(certificates);
    indexExperiences(experiences);

    console.log('SearchProvider indexing complete');
  }, [projects, skills, certificates, experiences]);

  return <>{children}</>;
}
