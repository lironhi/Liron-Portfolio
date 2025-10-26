import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { TimelineItem } from '@/components/TimelineItem';
import { data } from '@/lib/data';

export const metadata = {
  title: 'Experience',
  description: 'My professional experience and work history in software development.',
};

export default async function ExperiencePage() {
  const experiences = await data.getExperience();

  const sortedExperiences = experiences.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Section
      title="Experience"
      description="My professional journey in software development and technology"
    >
      <Container>
        <div className="space-y-8">
          {sortedExperiences.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No experience data available.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedExperiences.map((experience, index) => (
                <TimelineItem
                  key={experience.id}
                  experience={experience}
                  isLast={index === sortedExperiences.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}