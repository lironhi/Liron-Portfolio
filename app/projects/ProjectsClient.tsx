'use client';

import { useState, useMemo } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { TagFilter } from '@/components/TagFilter';
import { StaggerGrid } from '@/components/animations/StaggerGrid';
import type { Project, Tag } from '@/lib/data';

interface ProjectsClientProps {
  projects: Project[];
  tags: Tag[];
}

export function ProjectsClient({ projects, tags }: ProjectsClientProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) {
      return projects;
    }

    return projects.filter((project) =>
      selectedTags.some((tagId) => project.tags.some((tag) => tag.id === tagId))
    );
  }, [projects, selectedTags]);

  return (
    <div className="space-y-8">
      <TagFilter tags={tags} selectedTags={selectedTags} onTagsChange={setSelectedTags} />

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {selectedTags.length > 0
              ? 'No projects found with the selected filters.'
              : 'No projects found.'}
          </p>
        </div>
      ) : (
        <>
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.1} initialDelay={0.1}>
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </StaggerGrid>

          <div className="text-center text-sm text-muted-foreground mt-8">
            Showing {filteredProjects.length} of {projects.length} project
            {projects.length === 1 ? '' : 's'}
            {selectedTags.length > 0 && ' (filtered)'}
          </div>
        </>
      )}
    </div>
  );
}