'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Badge } from '@/components/Badge';
import { CertificateCard } from '@/components/CertificateCard';
import { AnimatedTitle } from '@/components/AnimatedTitle';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { Award, Code2, ShieldCheck } from 'lucide-react';
import { capitalizeFirst } from '@/lib/utils';
import type { Skill, Certificate } from '@/lib/data';

const skillLevelColors = {
  beginner: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
  intermediate: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
  advanced: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
  expert: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
};

const skillIcons: Record<string, string> = {
  'Python': '/images/logos/tech-stack/python-svgrepo-com.svg',
  'JavaScript': '/images/logos/tech-stack/javascript-svgrepo-com.svg',
  'TypeScript': '/images/logos/tech-stack/typescript-official-svgrepo-com.svg',
  'Java': '/images/logos/tech-stack/java-logo-svgrepo-com.svg',
  'C': '/images/logos/tech-stack/c3-svgrepo-com.svg',
  'C++': '/images/logos/tech-stack/cpp3-svgrepo-com.svg',
  'C#': '/images/logos/tech-stack/csharp2-svgrepo-com.svg',
  'CSS': '/images/logos/tech-stack/css-svgrepo-com.svg',
  'React': '/images/logos/tech-stack/reactjs-svgrepo-com.svg',
  'Next.js': '/images/logos/tech-stack/nextjs-fill-svgrepo-com.svg',
  'Node.js': '/images/logos/tech-stack/node-svgrepo-com.svg',
  'NestJS': '/images/logos/tech-stack/nestjs-svgrepo-com.svg',
  'Django': '/images/logos/tech-stack/django-svgrepo-com.svg',
  'jQuery': '/images/logos/tech-stack/jquery-1-logo-svgrepo-com.svg',
  'LangGraph': '/images/logos/tech-stack/langgraph-color.svg',
  'LangChain': '/images/logos/tech-stack/langgraph-color.svg',
  'AI': '/images/logos/tech-stack/ai-svgrepo-com.svg',
  'Docker': '/images/logos/tech-stack/docker-svgrepo-com.svg',
  'Git': '/images/logos/tech-stack/git-svgrepo-com.svg',
  'Android Studio': '/images/logos/tech-stack/logo-google-android-studio-svgrepo-com.svg',
  'AWS': '/images/logos/tech-stack/aws-svgrepo-com.svg',
  'Firebase': '/images/logos/tech-stack/firebase-svgrepo-com.svg',
  'MongoDB': '/images/logos/tech-stack/mongo-svgrepo-com.svg',
  'MySQL': '/images/logos/tech-stack/mysql-svgrepo-com.svg',
  'SQL': '/images/logos/tech-stack/sql-svgrepo-com.svg',
  'Redis': '/images/logos/tech-stack/redis-svgrepo-com.svg',
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
              className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm p-6 hover:bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
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
                  <Badge
                    variant="outline"
                    className={`text-xs ${skillLevelColors[skill.level]}`}
                  >
                    {capitalizeFirst(skill.level)}
                  </Badge>
                </div>

                {skill.yearsOfExperience && (
                  <p className="text-xs text-muted-foreground text-center">
                    {skill.yearsOfExperience} year{skill.yearsOfExperience === 1 ? '' : 's'} experience
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
  const [activeTab, setActiveTab] = useState('skills');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeCertificates, setActiveCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    async function loadData() {
      const response = await fetch('/api/data');
      const data = await response.json();
      setAllSkills(data.skills || []);
      setCertificates(data.certificates || []);
      setActiveCertificates(data.activeCertificates || []);
    }
    loadData();
  }, []);

  const skillsByCategory = allSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

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

  const sortedCertificates = [...certificates].sort((a, b) => {
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });

  const tabs = [
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'certifications', label: 'Certifications', icon: Award },
  ];

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Header */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 border border-border/50">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
              <div className="relative space-y-4 text-center">
                <AnimatedTitle
                  text="Skills & Certifications"
                  as="h1"
                  className="text-4xl font-bold tracking-tight sm:text-5xl"
                />
                <p className="text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
                  Technical expertise and professional certifications showcasing continuous learning and growth
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Tabs Navigation */}
          <div className="flex flex-wrap gap-2 justify-center border-b border-border pb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <FadeIn key="skills">
                <div className="space-y-12">
                  {allSkills.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-lg text-muted-foreground">
                        Loading skills...
                      </p>
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
              </FadeIn>
            )}

            {/* Certifications Tab */}
            {activeTab === 'certifications' && (
              <FadeIn key="certifications">
                <div className="space-y-8">
                  {/* Stats */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-bold text-primary">{certificates.length}</div>
                      <p className="text-sm text-muted-foreground mt-1">Total Certifications</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                        {activeCertificates.length}
                        <ShieldCheck className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Active Certifications</p>
                    </div>
                    <div className="rounded-lg border bg-card p-6 text-center hover:shadow-lg transition-shadow">
                      <div className="text-3xl font-bold text-primary">
                        {new Set(certificates.map(c => c.issuer)).size}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Certifying Organizations</p>
                    </div>
                  </div>

                  {/* Certifications List */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-semibold text-foreground">All Certifications</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span>= Active</span>
                      </div>
                    </div>

                    <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {sortedCertificates.map((certificate) => (
                        <StaggerItem key={certificate.id}>
                          <CertificateCard certificate={certificate} />
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>

                  {/* Footer Note */}
                  <div className="rounded-lg border bg-muted/30 p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Continuously learning and expanding expertise. Check back for new certifications as I explore emerging technologies in AI and cloud computing.
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
