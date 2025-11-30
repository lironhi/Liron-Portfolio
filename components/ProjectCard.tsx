'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, GitBranch, ImageIcon } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { HoverCard } from './animations/HoverCard';
import type { Project } from '@/lib/data';
import { useState } from 'react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const repoLink = project.links.find((link) => link.type === 'repo');
  const demoLink = project.links.find((link) => link.type === 'demo');
  const [imageError, setImageError] = useState(false);

  // Try to get project image - only from metadata
  const getProjectImage = () => {
    if (project.image) return project.image;
    if (project.coverImage) return project.coverImage;
    // Don't try default paths - let it fallback to video instead
    return null;
  };

  // Try to get project video - first from metadata, then use default fallback video
  const getProjectVideo = () => {
    if (project.video) return project.video;
    // Use a single default video for all projects without images
    return `/videos/project-default.mp4`;
  };

  const projectImage = getProjectImage();
  const projectVideo = getProjectVideo();
  const hasMedia = projectImage || projectVideo;

  return (
    <HoverCard className="h-full" scale={1.03} lift={true} glow={true}>
      <div className="group relative overflow-hidden rounded-lg border bg-card h-full flex flex-col shadow-md transition-all duration-300 hover:shadow-xl hover:border-primary/50">
        {/* Project Video (priority over image if no image or image error) */}
        {projectVideo && (!projectImage || imageError) && (
          <div className="relative w-full aspect-video overflow-hidden bg-muted">
            <video
              src={projectVideo}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Project Image */}
        {projectImage && !imageError && (
          <div className="relative w-full aspect-video overflow-hidden bg-muted">
            <Image
              src={projectImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        )}

        {/* Fallback icon if no image and no video */}
        {!hasMedia && (
          <div className="relative w-full aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Animated corner accent */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500 ease-out" />

          <div className="space-y-4 relative z-10 flex-1 flex flex-col">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group-hover:text-primary transition-colors duration-300"
                >
                  <h3 className="text-xl font-semibold leading-none tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                    {project.title}
                  </h3>
                </Link>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{project.year}</span>
              </div>

              {project.status && project.status !== 'completed' && (
                <Badge variant="outline" className="text-xs">
                  {project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">{project.summary}</p>

            {project.highlights && project.highlights.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium">Key Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {project.highlights.slice(0, 3).map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 mt-auto">
            {repoLink && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={repoLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} source code`}
                  className="inline-flex items-center"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Code
                </a>
              </Button>
            )}
            {demoLink && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={demoLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} live demo`}
                  className="inline-flex items-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Demo
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild className="ml-auto group/button">
              <Link href={`/projects/${project.slug}`} className="relative overflow-hidden">
                <span className="relative z-10 group-hover/button:translate-x-1 transition-transform duration-300 inline-flex items-center gap-1">
                  Learn more
                  <span className="group-hover/button:translate-x-1 transition-transform duration-300">→</span>
                </span>
              </Link>
            </Button>
          </div>
          </div>
        </div>
      </div>
    </HoverCard>
  );
}
