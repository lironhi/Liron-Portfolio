import { data } from '@/lib/data';
import { HomePageClient } from './page-client';

export default async function HomePage() {
  const [siteInfo, featuredProjects, currently, projects, skills] = await Promise.all([
    data.getSiteInfo(),
    data.getFeaturedProjects(),
    data.getCurrently(),
    data.getProjects(),
    data.getSkills(),
  ]);

  const { author } = siteInfo;

  // Derived from the real content files, so the hero figures can never go stale.
  const stats = {
    projects: projects.length,
    technologies: skills.length,
  };

  return (
    <HomePageClient
      authorName={author.name}
      authorLocation={author.location}
      authorEmail={author.social.email}
      authorGithub={author.social.github}
      authorLinkedin={author.social.linkedin}
      featuredProjects={featuredProjects}
      currently={currently}
      stats={stats}
    />
  );
}
