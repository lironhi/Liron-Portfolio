'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatedTitle } from '@/components/AnimatedTitle';
import { FadeIn } from '@/components/animations';
import { Badge } from '@/components/Badge';
import { Container } from '@/components/Container';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';
import { Section } from '@/components/Section';
import type { Skill } from '@/lib/data';
import { capitalizeFirst } from '@/lib/utils';

const skillLevelColors = {
  beginner:
    'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  intermediate:
    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  advanced:
    'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  expert:
    'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
};

const skillIcons: Record<string, string> = {
  Python: '/images/logos/tech-stack/python-svgrepo-com.svg',
  JavaScript: '/images/logos/tech-stack/javascript-svgrepo-com.svg',
  TypeScript: '/images/logos/tech-stack/typescript-official-svgrepo-com.svg',
  Java: '/images/logos/tech-stack/java-logo-svgrepo-com.svg',
  C: '/images/logos/tech-stack/c3-svgrepo-com.svg',
  'C++': '/images/logos/tech-stack/cpp3-svgrepo-com.svg',
  'C#': '/images/logos/tech-stack/csharp2-svgrepo-com.svg',
  CSS: '/images/logos/tech-stack/css-svgrepo-com.svg',
  React: '/images/logos/tech-stack/reactjs-svgrepo-com.svg',
  'Next.js': '/images/logos/tech-stack/nextjs-fill-svgrepo-com.svg',
  'Node.js': '/images/logos/tech-stack/node-svgrepo-com.svg',
  NestJS: '/images/logos/tech-stack/nestjs-svgrepo-com.svg',
  Django: '/images/logos/tech-stack/django-svgrepo-com.svg',
  jQuery: '/images/logos/tech-stack/jquery-1-logo-svgrepo-com.svg',
  LangGraph: '/images/logos/tech-stack/langgraph-color.svg',
  LangChain: '/images/logos/tech-stack/langgraph-color.svg',
  AI: '/images/logos/tech-stack/ai-svgrepo-com.svg',
  Docker: '/images/logos/tech-stack/docker-svgrepo-com.svg',
  Git: '/images/logos/tech-stack/git-svgrepo-com.svg',
  'Android Studio': '/images/logos/tech-stack/logo-google-android-studio-svgrepo-com.svg',
  AWS: '/images/logos/tech-stack/aws-svgrepo-com.svg',
  Firebase: '/images/logos/tech-stack/firebase-svgrepo-com.svg',
  MongoDB: '/images/logos/tech-stack/mongo-svgrepo-com.svg',
  MySQL: '/images/logos/tech-stack/mysql-svgrepo-com.svg',
  SQL: '/images/logos/tech-stack/sql-svgrepo-com.svg',
  Redis: '/images/logos/tech-stack/redis-svgrepo-com.svg',
};

interface SkillCategoryProps {
  title: string;
  skills: Skill[];
}

function SkillCategory({ title, skills }: SkillCategoryProps) {
  if (skills.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-foreground">{title}</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((skill) => {
          const iconPath = skillIcons[skill.name];

          return (
            <div
              key={skill.id}
              className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-xs p-6 shadow-e1 hover:bg-card hover:shadow-e2 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  {iconPath ? (
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <Image
                        src={iconPath}
                        alt={skill.name}
                        width={64}
                        height={64}
                        // Brand colours were the only saturated thing on a deep navy
                        // page and fought the palette. Muted at rest, full colour on hover.
                        className="object-contain grayscale opacity-60 transition-all duration-300 group-hover:scale-110 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">
                        {skill.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {skill.name}
                  </h4>
                </div>

                <div className="flex justify-center">
                  <Badge variant="outline" className={`text-xs ${skillLevelColors[skill.level]}`}>
                    {capitalizeFirst(skill.level)}
                  </Badge>
                </div>

                {skill.yearsOfExperience && (
                  <p className="font-mono text-xs text-muted-foreground text-center">
                    {skill.yearsOfExperience} year{skill.yearsOfExperience === 1 ? '' : 's'}{' '}
                    experience
                  </p>
                )}

                {skill.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3 text-center">
                    {skill.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SkillsPage() {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);

  useEffect(() => {
    async function loadData() {
      const response = await fetch('/api/data');
      const data = await response.json();
      setAllSkills(data.skills || []);
    }
    loadData();
  }, []);

  const skillsByCategory = allSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  const categoryOrder: Array<Skill['category']> = [
    'languages',
    'frameworks',
    'tools',
    'databases',
    'cloud',
    'other',
  ];

  const categoryTitles = {
    languages: 'Programming Languages',
    frameworks: 'Frameworks & Libraries',
    tools: 'Tools & Technologies',
    databases: 'Databases',
    cloud: 'Cloud & DevOps',
    other: 'Other Skills',
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Effect */}
      <FloatingOrbs />

      <Section className="relative z-10">
        <Container>
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Header - same treatment as every other page: no oversized box */}
            <FadeIn>
              <div className="text-center space-y-4">
                <AnimatedTitle
                  text="Skills"
                  as="h1"
                  className="text-3xl font-bold tracking-tight sm:text-4xl"
                />
                <p className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
                  The stack I actually work in, with how long I have used each piece.
                </p>
              </div>
            </FadeIn>

            <div className="space-y-12">
              {allSkills.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-lg text-muted-foreground">Loading skills...</p>
                </div>
              ) : (
                categoryOrder.map((category) => (
                  <SkillCategory
                    key={category}
                    title={categoryTitles[category]}
                    skills={skillsByCategory[category] || []}
                  />
                ))
              )}
            </div>

            {/* Courses now live on the CV page, alongside experience and education. */}
            <div className="border-t pt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Courses, education and full experience are on the{' '}
                <Link href="/resume" className="font-medium text-primary hover:underline">
                  CV page
                </Link>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
