'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, GitBranch, Linkedin, Mail, MessageCircle } from 'lucide-react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { ProjectCard } from '@/components/ProjectCard';
import { CurrentlySection } from '@/components/CurrentlySection';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import type { Project, Currently } from '@/lib/data/types';

interface HomePageClientProps {
  authorName: string;
  authorBio: string;
  authorLocation: string;
  authorEmail: string;
  authorGithub?: string;
  authorLinkedin?: string;
  featuredProjects: Project[];
  currently: Currently;
}

export function HomePageClient({
  authorName,
  authorBio,
  authorLocation,
  authorEmail,
  authorGithub,
  authorLinkedin,
  featuredProjects,
  currently,
}: HomePageClientProps) {
  const [activeAnecdote, setActiveAnecdote] = useState<number | null>(null);

  const anecdotes = [
    "Fun fact: I started coding by building a chatbot that could only respond with dad jokes. Now I build AI systems that actually work! 🤖",
    "My secret weapon? A rubber duck on my desk. Best debugging partner ever. It never judges my code... because it can't talk back! 🦆",
    "Currently exploring the fascinating world where AI meets creativity. My GitHub is like a playground where serious code meets experimental fun! 🚀"
  ];

  return (
    <>
      {/* Hero Section with Banner */}
      <Section className="py-20 sm:py-32 relative overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-background" />

        <Container>
          {/* Heading - Centered at top */}
          <FadeIn delay={0.1}>
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
              {authorName}
            </h1>
          </FadeIn>

          {/* Two Column Layout: Text Left, Image Right */}
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-16 items-center mb-16">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <FadeIn delay={0.2}>
                <p className="text-xl leading-relaxed text-muted-foreground/90">
                  <span className="text-foreground font-semibold">I build systems that <span className="text-rainbow">think</span>.</span>
                  <br />
                  As a Software Engineer specialized in backend and full-stack development, I work at the intersection of AI and engineering, designing distributed, self-improving systems using LLM agents, automation pipelines, and cloud technologies.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  My focus: <span className="text-foreground font-medium">turning complexity into clarity, and data into knowledge.</span>
                </p>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="flex items-center gap-2 text-base text-muted-foreground pt-4">
                  <Image
                    src="/images/logos/tech-stack/location-svgrepo-com.svg"
                    alt="Location"
                    width={20}
                    height={20}
                    className="flex-shrink-0"
                  />
                  <span className="font-medium">{authorLocation}</span>
                </div>
              </FadeIn>

              <StaggerContainer staggerDelay={0.1}>
                <div className="grid gap-4 pt-2">
                  <StaggerItem>
                    <div className="relative">
                      <button
                        onClick={() => setActiveAnecdote(activeAnecdote === 0 ? null : 0)}
                        className="w-full flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 hover:border-border transition-all cursor-pointer text-left hover-glow"
                      >
                        <Image
                          src="/images/logos/tech-stack/information-svgrepo-com.svg"
                          alt="Information"
                          width={24}
                          height={24}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <p className="text-base text-muted-foreground flex-1">
                          Building modern web applications
                        </p>
                      </button>
                      {activeAnecdote === 0 && (
                        <div className="absolute left-0 top-full mt-2 z-10">
                          <div className="relative bg-primary/10 border-2 border-primary/20 rounded-2xl p-4 shadow-xl max-w-sm backdrop-blur-sm animate-bubble-float">
                            {/* Bulle de pensée pointer */}
                            <div className="absolute -top-3 left-8 w-6 h-6 bg-primary/10 border-t-2 border-l-2 border-primary/20 rotate-45" />
                            <p className="text-sm text-foreground leading-relaxed">
                              {anecdotes[0]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="relative">
                      <button
                        onClick={() => setActiveAnecdote(activeAnecdote === 1 ? null : 1)}
                        className="w-full flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 hover:border-border transition-all cursor-pointer text-left hover-glow"
                      >
                        <Image
                          src="/images/logos/tech-stack/inspiration-svgrepo-com.svg"
                          alt="Inspiration"
                          width={24}
                          height={24}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <p className="text-base text-muted-foreground flex-1">
                          Passionate about clean code and user experience
                        </p>
                      </button>
                      {activeAnecdote === 1 && (
                        <div className="absolute left-0 top-full mt-2 z-10">
                          <div className="relative bg-primary/10 border-2 border-primary/20 rounded-2xl p-4 shadow-xl max-w-sm backdrop-blur-sm animate-bubble-float">
                            {/* Bulle de pensée pointer */}
                            <div className="absolute -top-3 left-8 w-6 h-6 bg-primary/10 border-t-2 border-l-2 border-primary/20 rotate-45" />
                            <p className="text-sm text-foreground leading-relaxed">
                              {anecdotes[1]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                  <StaggerItem>
                    <div className="relative">
                      <button
                        onClick={() => setActiveAnecdote(activeAnecdote === 2 ? null : 2)}
                        className="w-full flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/60 hover:border-border transition-all cursor-pointer text-left hover-glow"
                      >
                        <Image
                          src="/images/logos/tech-stack/target-svgrepo-com.svg"
                          alt="Target"
                          width={24}
                          height={24}
                          className="flex-shrink-0 mt-0.5"
                        />
                        <p className="text-base text-muted-foreground flex-1">
                          Always learning and exploring new technologies
                        </p>
                      </button>
                      {activeAnecdote === 2 && (
                        <div className="absolute left-0 top-full mt-2 z-10">
                          <div className="relative bg-primary/10 border-2 border-primary/20 rounded-2xl p-4 shadow-xl max-w-sm backdrop-blur-sm animate-bubble-float">
                            {/* Bulle de pensée pointer */}
                            <div className="absolute -top-3 left-8 w-6 h-6 bg-primary/10 border-t-2 border-l-2 border-primary/20 rotate-45" />
                            <p className="text-sm text-foreground leading-relaxed">
                              {anecdotes[2]}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                </div>
              </StaggerContainer>
            </div>

            {/* Right Column - Hero Banner Image */}
            <FadeIn delay={0.4}>
              <div className="relative aspect-square lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border/50 group">
                <Image
                  src="/images/profile/hero-banner.png"
                  alt="Hero Banner"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
              </div>
            </FadeIn>
          </div>

          {/* Social Links - Above buttons */}
          <FadeIn delay={0.6}>
            <div className="flex items-center justify-center gap-6 mb-8">
              <a
                href={`mailto:${authorEmail}`}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-md"
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
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-muted/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-md"
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
              <Button asChild size="lg" className="min-w-[180px]">
                <Link href="/projects">View Projects</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="min-w-[180px]">
                <a href="/cv/Liron-Himbert.pdf" download className="inline-flex items-center justify-center gap-2">
                  <Download className="h-4 w-4" />
                  Download CV
                </a>
              </Button>
            </div>
          </FadeIn>
        </Container>
      </Section>

      {featuredProjects.length > 0 && (
        <Section className="py-20 sm:py-32 relative overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
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
                  Some of my recent work that I'm particularly proud of. Each project showcases different skills and technologies.
                </p>
              </div>
            </FadeIn>

            {/* Projects Grid */}
            <ScrollReveal direction="up" delay={0.2}>
              <StaggerContainer staggerDelay={0.15} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Currently Section */}
      <Section className="py-20 sm:py-32 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/3 via-transparent to-background" />

        <Container>
          {/* Section Header */}
          <FadeIn delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                What I'm Up To
              </h2>
              <p className="text-lg text-muted-foreground">
                A glimpse into what I'm learning, building, and exploring right now
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
    </>
  );
}
