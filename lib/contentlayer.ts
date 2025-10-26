import { allProjects } from 'contentlayer/generated';
import type { Project } from 'contentlayer/generated';

export function getProjectBySlug(slug: string): Project | undefined {
  return allProjects.find((project) => project.slug === slug);
}

export function getAllProjects(): Project[] {
  return allProjects.sort((a, b) => b.year - a.year);
}

export function getFeaturedProjects(): Project[] {
  return allProjects.filter((project) => project.featured).sort((a, b) => b.year - a.year);
}

export function getProjectsByTag(tagId: string): Project[] {
  return allProjects
    .filter((project) => project.tags?.some((tag: any) => tag.id === tagId))
    .sort((a, b) => b.year - a.year);
}

export function getAllTags() {
  const tagMap = new Map();

  allProjects.forEach((project) => {
    project.tags?.forEach((tag: any) => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, tag);
      }
    });
  });

  return Array.from(tagMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
}