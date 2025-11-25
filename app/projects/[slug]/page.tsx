import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { ProjectCaseStudy } from '@/components/ProjectCaseStudy';
import { MarkdownContent } from '@/components/MarkdownContent';
import { ProjectImageGallery } from '@/components/ProjectImageGallery';
import { data } from '@/lib/data';
import { formatDate, generateOgImageUrl } from '@/lib/utils';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Force dynamic rendering to avoid MDX parsing issues during build
export const dynamic = 'force-dynamic';

// Commented out to prevent static generation errors
// export async function generateStaticParams() {
//   const projects = await data.getProjects();
//   return projects.map((project) => ({
//     slug: project.slug,
//   }));
// }

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await data.getProjectBySlug(slug);
  const siteInfo = await data.getSiteInfo();

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  const title = `${project.title} | Projects`;
  const description = project.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${siteInfo.url}/projects/${project.slug}`,
      images: [
        {
          url: generateOgImageUrl(project.title, siteInfo.url),
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [generateOgImageUrl(project.title, siteInfo.url)],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await data.getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const repoLink = project.links?.find((link: any) => link.type === 'repo');
  const demoLink = project.links?.find((link: any) => link.type === 'demo');

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {project.title}
                  </h1>
                  <p className="text-lg text-muted-foreground">{project.summary}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{project.year}</span>
                  {project.status && project.status !== 'completed' && (
                    <>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {project.status === 'in-progress' ? 'In Progress' : 'Planning'}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {(repoLink || demoLink) && (
                <div className="flex items-center gap-2">
                  {repoLink && (
                    <Button variant="outline" asChild>
                      <a
                        href={repoLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} source code`}
                      >
                        <GitBranch className="mr-2 h-4 w-4" />
                        View Code
                      </a>
                    </Button>
                  )}
                  {demoLink && (
                    <Button asChild>
                      <a
                        href={demoLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} live demo`}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {project.highlights && project.highlights.length > 0 && (
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Key Features</h2>
                <ul className="space-y-2">
                  {project.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary shrink-0">•</span>
                      <span className="text-muted-foreground">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Image Gallery */}
            <ProjectImageGallery projectSlug={slug} />

            {/* Case Study Details */}
            <ProjectCaseStudy project={project} />

            {project.content && <MarkdownContent content={project.content} />}

            {project.updatedAt && (
              <div className="border-t pt-6 text-sm text-muted-foreground">
                Last updated: {formatDate(project.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}