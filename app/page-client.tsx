'use client';

import { Download, GitBranch, Mail, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedHeroTitle } from '@/components/AnimatedHeroTitle';
import { AvailabilityBadge } from '@/components/AvailabilityBadge';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { BackgroundPattern } from '@/components/BackgroundPattern';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { CurrentlySection } from '@/components/CurrentlySection';
import { FloatingParticles } from '@/components/FloatingParticles';
import { HeroChatPrompt } from '@/components/HeroChatPrompt';
import { Linkedin } from '@/components/icons/BrandIcons';
import { MobileOptimizations } from '@/components/MobileOptimizations';
import { ParallaxImage } from '@/components/ParallaxImage';
import { ProjectCard } from '@/components/ProjectCard';
import { QuoteSection } from '@/components/QuoteSection';
import { ScrollToTop } from '@/components/ScrollToTop';
import { Section } from '@/components/Section';
import { TechStackSection } from '@/components/TechStackSection';
import type { Currently, Project } from '@/lib/data/types';

interface HomePageClientProps {
  authorName: string;
  authorLocation: string;
  authorEmail: string;
  authorGithub?: string;
  authorLinkedin?: string;
  featuredProjects: Project[];
  currently: Currently;
  stats: { projects: number; technologies: number };
}

export function HomePageClient({
  authorName,
  authorLocation,
  authorEmail,
  authorGithub,
  authorLinkedin,
  featuredProjects,
  currently,
  stats,
}: HomePageClientProps) {
  // Every figure here is backed by the CV or computed from the content files.
  const proofPoints = [
    { value: '3+', label: 'years in production' },
    { value: String(stats.projects), label: 'projects shipped' },
    { value: '6', label: 'engineers led' },
  ];

  return (
    <>
      {/* Hero Section with Banner */}
      <Section className="py-8 sm:py-12 relative overflow-hidden">
        {/* Floating particles background */}
        <FloatingParticles />

        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-background to-background" />

        <Container>
          {/* Two columns, top-aligned: the old centred title block cost ~200px of
              height and pushed the AI bar below the fold on a 780px laptop. */}
          <div className="flex flex-row gap-5 lg:grid lg:grid-cols-[1.35fr_1fr] lg:gap-12 items-start mb-8">
            <div className="flex-1 space-y-4">
              <FadeIn delay={0.1}>
                <AnimatedHeroTitle name={authorName} />
              </FadeIn>

              <FadeIn delay={0.2}>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-foreground">
                  I build systems that <span className="text-rainbow">think</span>.
                </h1>
              </FadeIn>

              {/* The CV says he is looking for a role - nothing on the site said so. */}
              <FadeIn delay={0.25}>
                <AvailabilityBadge />
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Full-stack developer with 3+ years shipping production systems, now building AI
                  into them. I lead a 6-person IT team at Callisto across six international
                  branches, where I ship multi-agent automation with LangGraph and MCP.
                </p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Image
                    src="/images/logos/tech-stack/location-svgrepo-com.svg"
                    alt=""
                    width={16}
                    height={16}
                    className="shrink-0"
                  />
                  <span className="font-medium">{authorLocation}</span>
                </div>
              </FadeIn>
            </div>

            {/* Smaller than before: it was the second tallest element on the page. */}
            <FadeIn delay={0.35} className="w-28 sm:w-36 lg:w-full lg:max-w-[280px] shrink-0">
              <ParallaxImage src="/images/profile/hero-banner.png" alt="Hero Banner" />
            </FadeIn>
          </div>

          {/* Proof strip - figures come from the real content files */}
          <FadeIn delay={0.4}>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-border/60 py-4">
              {proofPoints.map((point) => (
                <div key={point.label} className="flex items-baseline gap-1.5">
                  <span className="font-mono text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                    {point.value}
                  </span>
                  <span className="text-xs lg:text-sm text-muted-foreground">{point.label}</span>
                </div>
              ))}
              <span className="text-xs lg:text-sm text-muted-foreground">
                <span className="font-medium text-foreground">B.Sc. Software Engineering</span> —
                SCE
              </span>
            </div>
          </FadeIn>

          {/* Primary call to action: ask the AI assistant */}
          <FadeIn delay={0.5}>
            <div className="mb-10 flex justify-center">
              <HeroChatPrompt />
            </div>
          </FadeIn>

          {/* Social Links - Above buttons */}
          <FadeIn delay={0.6}>
            <div className="flex items-center justify-center gap-6 mb-8">
              <a
                href={`mailto:${authorEmail}`}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 text-muted-foreground hover:bg-red-500 hover:text-white transition-all hover:scale-110 shadow-md"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/972586860673"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 text-muted-foreground hover:bg-[#25D366] hover:text-white transition-all hover:scale-110 shadow-md"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              {authorGithub && (
                <a
                  href={authorGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 text-muted-foreground hover:bg-gray-800 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all hover:scale-110 shadow-md"
                  aria-label="GitHub"
                >
                  <GitBranch className="h-5 w-5" />
                </a>
              )}
              {authorLinkedin && (
                <a
                  href={authorLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-md"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
            </div>
          </FadeIn>

          {/* Buttons - Centered at bottom */}
          <FadeIn delay={0.7}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="min-w-[180px] relative overflow-hidden group">
                <Link href="/projects">
                  <span className="relative z-10">View Projects</span>
                  <div className="absolute inset-0 shimmer" />
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="min-w-[180px] group hover:scale-105 transition-transform"
              >
                <a
                  href="/cv/Liron-Himbert.pdf"
                  download
                  className="inline-flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4 group-hover:animate-bounce" />
                  Download CV
                </a>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {/* Tech Stack Section */}
      <Section className="py-12 sm:py-20 relative overflow-hidden">
        <BackgroundPattern variant="dots" />
        <Container>
          <ScrollReveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                Tech Stack
              </h2>
              <p className="text-lg text-muted-foreground">
                Technologies and tools I work with to bring ideas to life
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <TechStackSection />
          </ScrollReveal>
        </Container>
      </Section>

      {featuredProjects.length > 0 && (
        <Section className="py-12 sm:py-20 relative overflow-hidden bg-linear-to-b from-background via-muted/20 to-background">
          {/* Decorative elements */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>

          <Container>
            {/* Section Header */}
            <FadeIn delay={0.1}>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                  Featured Projects
                </h2>
                <p className="text-lg text-muted-foreground">
                  Some of my recent work that I'm particularly proud of. Each project showcases
                  different skills and technologies.
                </p>
              </div>
            </FadeIn>

            {/* Projects Grid */}
            <ScrollReveal direction="up" delay={0.2}>
              <StaggerContainer
                staggerDelay={0.15}
                className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {featuredProjects.slice(0, 3).map((project) => (
                  <StaggerItem key={project.slug}>
                    <ProjectCard project={project} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </ScrollReveal>

            {/* View All Button */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="mt-16 text-center">
                <Button asChild size="lg" className="group">
                  <Link href="/projects">
                    View All Projects
                    <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </Button>
              </div>
            </ScrollReveal>
          </Container>
        </Section>
      )}

      {/* Inspirational Quote Section */}
      <Section className="py-12 sm:py-20 relative overflow-hidden">
        <BackgroundPattern variant="grid" />
        <Container>
          <ScrollReveal direction="up">
            <QuoteSection
              quote="The best way to predict the future is to build it"
              author="Liron Himbert"
            />
          </ScrollReveal>
        </Container>
      </Section>

      {/* Currently Section */}
      <Section className="py-12 sm:py-20 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/3 via-transparent to-background" />
        <BackgroundPattern variant="waves" />

        <Container>
          {/* Section Header */}
          <FadeIn delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                What I'm Up To
              </h2>
              <p className="text-lg text-muted-foreground">
                What I'm shipping at work, building on the side, and just finished
              </p>
            </div>
          </FadeIn>

          {/* Currently Content */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="max-w-5xl mx-auto">
              <CurrentlySection data={currently} />
            </div>
          </ScrollReveal>
        </Container>
      </Section>

      {/* Mobile Optimizations */}
      <MobileOptimizations />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}
