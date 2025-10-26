import Link from 'next/link';
import { ExternalLink, GitBranch } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';
import { HoverCard } from './animations/HoverCard';
import type { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const repoLink = project.links.find((link) => link.type === 'repo');
  const demoLink = project.links.find((link) => link.type === 'demo');

  return (
    <HoverCard className="h-full" scale={1.03} lift={true} glow={true}>
      <div className="group relative overflow-hidden rounded-lg border bg-card p-6 h-full flex flex-col shadow-md transition-shadow duration-300 hover:shadow-xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <Link
                href={`/projects/${project.slug}`}
                className="group-hover:text-primary transition-colors"
              >
                <h3 className="text-xl font-semibold leading-none tracking-tight">
                  {project.title}
                </h3>
              </Link>
              <span className="text-sm text-muted-foreground">{project.year}</span>
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

          <div className="flex items-center gap-2 pt-2">
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
            <Button variant="ghost" size="sm" asChild className="ml-auto">
              <Link href={`/projects/${project.slug}`}>
                Learn more →
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </HoverCard>
  );
}
