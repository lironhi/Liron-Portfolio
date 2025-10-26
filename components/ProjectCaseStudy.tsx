import { BarChart3, Target, Lightbulb, Users, Clock, TrendingUp, Code2 } from 'lucide-react';
import type { Project } from '@/lib/data/types';
import { Badge } from './Badge';

interface ProjectCaseStudyProps {
  project: Project;
}

export function ProjectCaseStudy({ project }: ProjectCaseStudyProps) {
  const hasMetrics = project.metrics && project.metrics.length > 0;
  const hasChallenges = project.challenges && project.challenges.length > 0;
  const hasTechnologies = project.technologies && project.technologies.length > 0;

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      {project.overview && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Overview
          </h2>
          <p className="text-muted-foreground leading-relaxed">{project.overview}</p>
        </section>
      )}

      {/* Problem & Solution */}
      {(project.problem || project.solution) && (
        <section className="grid gap-6 md:grid-cols-2">
          {project.problem && (
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-orange-500" />
                Problem
              </h3>
              <p className="text-muted-foreground leading-relaxed">{project.problem}</p>
            </div>
          )}
          {project.solution && (
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Solution
              </h3>
              <p className="text-muted-foreground leading-relaxed">{project.solution}</p>
            </div>
          )}
        </section>
      )}

      {/* Project Details */}
      {(project.team || project.duration) && (
        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {project.team && (
            <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team</p>
                <p className="text-lg font-semibold">{project.team}</p>
              </div>
            </div>
          )}
          {project.duration && (
            <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold">{project.duration}</p>
              </div>
            </div>
          )}
          {project.year && (
            <div className="rounded-lg border bg-card p-4 flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Year</p>
                <p className="text-lg font-semibold">{project.year}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Technologies */}
      {hasTechnologies && (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            Technologies
          </h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies!.map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Architecture */}
      {project.architecture && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            Architecture
          </h2>
          <div className="rounded-lg border bg-muted/30 p-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.architecture}
            </p>
          </div>
        </section>
      )}

      {/* Metrics */}
      {hasMetrics && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Impact & Metrics
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.metrics!.map((metric, index) => (
              <div
                key={index}
                className="rounded-lg border bg-gradient-to-br from-primary/5 to-primary/10 p-6 space-y-2"
              >
                <p className="text-3xl font-bold text-primary">{metric.value}</p>
                <p className="text-sm font-medium text-foreground">{metric.label}</p>
                {metric.description && (
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Impact */}
      {project.impact && (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overall Impact
          </h3>
          <div className="rounded-lg border bg-card p-6">
            <p className="text-muted-foreground leading-relaxed">{project.impact}</p>
          </div>
        </section>
      )}

      {/* Challenges & Solutions */}
      {hasChallenges && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Challenges & Solutions
          </h2>
          <div className="space-y-6">
            {project.challenges!.map((challenge, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-6 space-y-4"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {index + 1}. {challenge.title}
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                      Challenge
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {challenge.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      Solution
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {challenge.solution}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
