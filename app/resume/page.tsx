import { Download } from 'lucide-react';
import Link from 'next/link';
import { AnimatedTitle } from '@/components/AnimatedTitle';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';
import { Section } from '@/components/Section';
import { TimelineItem } from '@/components/TimelineItem';
import { data } from '@/lib/data';
import { formatDateRange } from '@/lib/utils';

export const metadata = {
  title: 'Resume',
  description: 'View and download my professional resume and career summary.',
};

export default async function ResumePage() {
  const [siteInfo, experiences, education, skills, certificates] = await Promise.all([
    data.getSiteInfo(),
    data.getExperience(),
    data.getEducation(),
    data.getSkills(),
    data.getCertificates(),
  ]);

  const { author } = siteInfo;

  const sortedExperiences = experiences
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, 5); // Show most recent 5 experiences

  const sortedEducation = education.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  /**
   * A flat row of a dozen identical pills tells a reader nothing. Grouping by
   * category gives the eye a structure to scan, and keeping only expert/advanced
   * keeps it a summary rather than a second Skills page.
   */
  const CATEGORY_LABELS: Record<string, string> = {
    languages: 'Languages',
    frameworks: 'Frameworks',
    databases: 'Data',
    cloud: 'Cloud',
    tools: 'Tooling',
    other: 'Engineering',
  };

  const skillGroups = Object.entries(
    skills
      .filter((skill) => skill.level === 'expert' || skill.level === 'advanced')
      .reduce<Record<string, typeof skills>>((acc, skill) => {
        (acc[skill.category] ??= []).push(skill);
        return acc;
      }, {})
  ).sort(
    ([a], [b]) => Object.keys(CATEGORY_LABELS).indexOf(a) - Object.keys(CATEGORY_LABELS).indexOf(b)
  );

  return (
    <div className="relative min-h-screen">
      {/* Background Effect */}
      <FloatingOrbs />

      <Section className="relative z-10">
        <Container>
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <AnimatedTitle
                  text={author.name}
                  as="h1"
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                />
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
                  <a href="/cv/Liron-Himbert.pdf" download className="inline-flex items-center">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Me</Link>
                </Button>
              </div>
            </div>

            {/* Skills Summary */}
            {skillGroups.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Core Skills</h2>
                <dl className="space-y-4">
                  {skillGroups.map(([category, group]) => (
                    <div
                      key={category}
                      className="grid gap-2 sm:grid-cols-[9rem_1fr] sm:items-baseline"
                    >
                      <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        {CATEGORY_LABELS[category] ?? category}
                      </dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {group.map((skill) => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Experience */}
            {sortedExperiences.length > 0 && (
              <div className="space-y-8">
                {/* No "View All" link: /experience now redirects back here. */}
                <h2 className="text-2xl font-semibold text-foreground">Professional Experience</h2>

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
                <h2 className="text-2xl font-semibold text-foreground">Education</h2>

                <div className="space-y-4">
                  {sortedEducation.map((edu) => (
                    <div key={edu.id} className="rounded-lg border bg-card p-4">
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
                        <div className="font-mono text-right text-sm text-muted-foreground">
                          <div>{formatDateRange(edu.startDate, edu.endDate)}</div>
                          <div>{edu.location}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses & certifications - folded in from the old /certifications page */}
            {certificates.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Courses & Certifications</h2>
                <div className="space-y-4">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="rounded-lg border bg-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground">{cert.name}</h3>
                          <p className="font-medium text-primary">{cert.issuer}</p>
                          {cert.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{cert.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right text-sm text-muted-foreground">
                          {new Date(cert.issueDate).getFullYear()}
                        </div>
                      </div>
                      {cert.skills && cert.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {cert.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
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
                    <Link href="/projects">View Projects</Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/skills">View All Skills</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
