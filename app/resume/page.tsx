import Link from 'next/link';
import { Download, ExternalLink } from 'lucide-react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { TimelineItem } from '@/components/TimelineItem';
import { data } from '@/lib/data';
import { formatDateRange } from '@/lib/utils';

export const metadata = {
  title: 'Resume',
  description: 'View and download my professional resume and career summary.',
};

export default async function ResumePage() {
  const [siteInfo, experiences, education, skills] = await Promise.all([
    data.getSiteInfo(),
    data.getExperience(),
    data.getEducation(),
    data.getSkills(),
  ]);

  const { author } = siteInfo;

  const sortedExperiences = experiences
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5); // Show most recent 5 experiences

  const sortedEducation = education.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const topSkills = skills
    .filter((skill) => skill.level === 'expert' || skill.level === 'advanced')
    .slice(0, 12);

  return (
    <Section>
      <Container>
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {author.name}
              </h1>
              <p className="text-lg text-muted-foreground">{author.bio}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>📍 {author.location}</span>
                <span>•</span>
                <a
                  href={`mailto:${author.social.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {author.social.email}
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <a href="/cv/Liron-Himbert.pdf" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">
                  Contact Me
                </Link>
              </Button>
            </div>
          </div>

          {/* Skills Summary */}
          {topSkills.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-foreground">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {topSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {sortedExperiences.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Professional Experience</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/experience">
                    View All <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-8">
                {sortedExperiences.map((experience, index) => (
                  <TimelineItem
                    key={experience.id}
                    experience={experience}
                    isLast={index === sortedExperiences.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {sortedEducation.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Education</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/education">
                    View All <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
              
              <div className="space-y-4">
                {sortedEducation.map((edu) => (
                  <div
                    key={edu.id}
                    className="rounded-lg border bg-card p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {edu.degree} in {edu.field}
                        </h3>
                        <p className="text-primary font-medium">{edu.institution}</p>
                        {edu.gpa && (
                          <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{formatDateRange(edu.startDate, edu.endDate)}</div>
                        <div>{edu.location}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-8 text-center">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                This resume is always up-to-date. Last updated: {new Date().toLocaleDateString()}
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/projects">
                    View Projects
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/skills">
                    View All Skills
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}