'use client';

import { ExternalLink, BookOpen, Code, Hammer, Compass, TrendingUp, Clock, Zap } from 'lucide-react';
import { Badge } from './Badge';
import { FadeIn, StaggerContainer, StaggerItem } from './animations';
import type { Currently } from '@/lib/data/types';

interface CurrentlySectionProps {
  data: Currently;
}

// Calculate stats
const calculateStats = (data: Currently) => {
  const totalItems = data.learning.length + data.working.length + data.reading.length + data.exploring.length;
  const avgProgress = data.learning.length > 0
    ? Math.round(data.learning.reduce((acc, item) => acc + item.progress, 0) / data.learning.length)
    : 0;
  const inProgressProjects = data.working.filter(item => item.status === 'in-progress').length;

  return { totalItems, avgProgress, inProgressProjects };
};

export function CurrentlySection({ data }: CurrentlySectionProps) {
  const stats = calculateStats(data);

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Items</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground mt-1">Things I'm working on</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Progress</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.avgProgress}%</p>
              <p className="text-xs text-muted-foreground mt-1">Learning completion</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In Progress</p>
              </div>
              <p className="text-3xl font-bold text-foreground">{stats.inProgressProjects}</p>
              <p className="text-xs text-muted-foreground mt-1">Active projects</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Categories Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
      {/* Learning */}
      {data.learning.length > 0 && (
        <FadeIn>
          <div className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Learning</h3>
                <p className="text-xs text-muted-foreground">{data.learning.length} active</p>
              </div>
            </div>

            {/* Items */}
            <StaggerContainer className="space-y-3">
              {data.learning.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-4 hover:bg-card hover:shadow-lg hover:border-blue-500/30 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground group-hover:text-blue-500 transition-colors text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-blue-500 transition-colors flex-shrink-0"
                            aria-label={`Learn more about ${item.title}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="text-blue-500 font-semibold">{item.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}

      {/* Working On */}
      {data.working.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <Hammer className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Building</h3>
                <p className="text-xs text-muted-foreground">{data.working.length} projects</p>
              </div>
            </div>

            {/* Items */}
            <StaggerContainer className="space-y-3">
              {data.working.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-4 hover:bg-card hover:shadow-lg hover:border-green-500/30 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-foreground group-hover:text-green-500 transition-colors text-sm">
                              {item.title}
                            </h4>
                            <Badge
                              variant={item.status === 'in-progress' ? 'default' : 'outline'}
                              className={`text-xs flex-shrink-0 ${
                                item.status === 'in-progress'
                                  ? 'bg-green-500/10 text-green-500 border-green-500/30'
                                  : ''
                              }`}
                            >
                              {item.status === 'in-progress' ? 'In Progress' : item.status === 'planning' ? 'Planning' : 'Paused'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {item.technologies.map((tech) => (
                              <Badge key={tech} variant="secondary" className="text-xs px-2 py-0.5">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}

      {/* Reading */}
      {data.reading.length > 0 && (
        <FadeIn delay={0.2}>
          <div className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20">
              <div className="p-3 rounded-lg bg-purple-500/10 text-purple-500">
                <Code className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Reading</h3>
                <p className="text-xs text-muted-foreground">{data.reading.length} books</p>
              </div>
            </div>

            {/* Items */}
            <StaggerContainer className="space-y-3">
              {data.reading.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-4 hover:bg-card hover:shadow-lg hover:border-purple-500/30 transition-all duration-300">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl flex-shrink-0">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground group-hover:text-purple-500 transition-colors text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">by {item.author}</p>
                          </div>
                        </div>
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-purple-500 transition-colors flex-shrink-0"
                            aria-label={`View ${item.title}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="text-purple-500 font-semibold">{item.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}

      {/* Exploring */}
      {data.exploring.length > 0 && (
        <FadeIn delay={0.3}>
          <div className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20">
              <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Exploring</h3>
                <p className="text-xs text-muted-foreground">{data.exploring.length} topics</p>
              </div>
            </div>

            {/* Items */}
            <StaggerContainer className="space-y-3">
              {data.exploring.map((item) => (
                <StaggerItem key={item.id}>
                  <div className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-4 hover:bg-card hover:shadow-lg hover:border-orange-500/30 transition-all duration-300">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground group-hover:text-orange-500 transition-colors text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </FadeIn>
      )}

      {/* Last Updated */}
      <FadeIn delay={0.4}>
        <div className="lg:col-span-3 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(data.lastUpdated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </FadeIn>
      </div>
    </div>
  );
}
