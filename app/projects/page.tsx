import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { ProjectsClient } from './ProjectsClient';
import { data } from '@/lib/data';
import { TwinklingStars } from '@/components/effects/TwinklingStars';

export const metadata = {
  title: 'Projects',
  description: 'A collection of projects I\'ve worked on, from web applications to AI systems.',
};

export default async function ProjectsPage() {
  const [projects, tags] = await Promise.all([
    data.getProjects(),
    data.getAllTags(),
  ]);

  return (
    <div className="relative min-h-screen">
      {/* Background Effect */}
      <TwinklingStars />

      <Section
        title="Projects"
        description="A collection of projects I've worked on, from web applications to open-source contributions"
        className="relative z-10"
      >
        <Container>
          <ProjectsClient projects={projects} tags={tags} />
        </Container>
      </Section>
    </div>
  );
}