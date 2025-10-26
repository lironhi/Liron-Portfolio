import { data } from '@/lib/data';
import { HomePageClient } from './page-client';

export default async function HomePage() {
  const [siteInfo, featuredProjects, currently] = await Promise.all([
    data.getSiteInfo(),
    data.getFeaturedProjects(),
    data.getCurrently(),
  ]);

  const { author } = siteInfo;

  return (
    <HomePageClient
      authorName={author.name}
      authorBio={author.bio}
      authorLocation={author.location}
      authorEmail={author.social.email}
      authorGithub={author.social.github}
      authorLinkedin={author.social.linkedin}
      featuredProjects={featuredProjects}
      currently={currently}
    />
  );
}