'use client';

import { useEffect } from 'react';
import {
  indexProjects,
  indexSkills,
  indexCertificates,
  indexExperiences,
} from '@/lib/search';
import type { Project, Skill, Certificate, Experience } from '@/lib/data/types';

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
