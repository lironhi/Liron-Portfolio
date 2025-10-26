import { Badge } from './Badge';
import { formatDateRange } from '@/lib/utils';
import type { Experience } from '@/lib/data';

interface TimelineItemProps {
  experience: Experience;
  isLast?: boolean;
}

export function TimelineItem({ experience, isLast = false }: TimelineItemProps) {
  return (
    <div className="relative pb-8">
      {!isLast && <div className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border" />}
      
      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-8 ring-background">
            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
          </div>
        </div>
        
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{experience.position}</h3>
                <p className="text-base text-primary font-medium">{experience.company}</p>
              </div>
              <Badge variant="outline" className="ml-2 shrink-0">
                {experience.type}
              </Badge>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-sm text-muted-foreground">
              <span>{formatDateRange(experience.startDate, experience.endDate)}</span>
              <span className="hidden sm:inline">•</span>
              <span>{experience.location}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{experience.description}</p>

          {experience.achievements && experience.achievements.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Key Achievements:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {experience.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-primary shrink-0">•</span>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {experience.technologies && experience.technologies.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Technologies:</h4>
              <div className="flex flex-wrap gap-1">
                {experience.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}