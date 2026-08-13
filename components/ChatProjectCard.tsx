'use client';

import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/** Compact card sized for the 400px chat panel - the full ProjectCard is too heavy here. */
export interface ChatProject {
  slug: string;
  title: string;
  summary: string;
  year: number;
  image: string | null;
  tags: string[];
}

export function ChatProjectCard({
  project,
  onNavigate,
}: {
  project: ChatProject;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      onClick={onNavigate}
      className="group flex gap-3 rounded-xl border border-border bg-background p-2.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      {project.image ? (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={project.image}
            alt=""
            fill
            sizes="56px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          {project.year}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{project.title}</p>
          <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">{project.summary}</p>
        {project.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
