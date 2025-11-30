'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { AnimatedTitle } from '@/components/AnimatedTitle';
import { FadeIn, TabContent } from '@/components/animations';
import { Code2, Sparkles, Heart, Rocket, User, Briefcase, Globe } from 'lucide-react';
import { DNAHelix } from '@/components/effects/DNAHelix';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('journey');

  const tabs = [
    { id: 'journey', label: 'My Journey', icon: Code2 },
    { id: 'work', label: 'What I Do', icon: Briefcase },
    { id: 'beyond', label: 'Beyond Code', icon: Heart },
    { id: 'info', label: 'Quick Info', icon: User },
  ];

  const journeyMilestones = [
    { year: '9 years old', title: 'First PC Build', description: 'Inspired by my grandfather, built my first PC' },
    { year: '12 years old', title: 'Started Coding', description: 'Began coding with VB.NET, CMD, and C++' },
    { year: 'University', title: 'Software Engineering', description: 'Pursued B.Sc. in Software Engineering at SCE' },
    { year: 'Present', title: 'AI & Backend Focus', description: 'Building intelligent systems with AI agents' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Background Effect */}
      <DNAHelix />

      <Section className="relative z-10">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-12 border border-border/50">
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />

              {/* Photo hero en haut à droite */}
              <div className="absolute top-8 right-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl">
                <Image
                  src="/images/profile/hero-banner.png"
                  alt="Profile"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="relative space-y-4 text-center pr-0 sm:pr-44">
                <AnimatedTitle
                  text="About Me"
                  as="h1"
                  className="text-4xl font-bold tracking-tight sm:text-5xl"
                />
                <p className="text-xl leading-8 text-muted-foreground max-w-2xl mx-auto">
                  A passionate software engineer building intelligent systems at the intersection of AI and engineering.
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
            {/* My Journey Tab */}
            {activeTab === 'journey' && (
              <TabContent key="journey">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Code2 className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">My Journey</h2>
                  </div>

                  <div className="prose prose-lg max-w-none text-muted-foreground">
                    <p className="text-lg leading-relaxed">
                      My passion for technology began early, inspired by my grandfather, an electronics engineer. At the age of nine, I built my first PC, fascinated by how every component worked together.
                      By twelve, I realized creation wasn't limited to physical things, I could also build infinitely in the digital world. I started coding small programs in VB.NET, CMD, and C++ from my bedroom, just to see how far I could push my imagination.
                    </p>
                    <p className="text-lg leading-relaxed mt-4">
                      Years later, I decided to turn that fascination into a profession and pursued a degree in Software Engineering. This path allowed me to deepen my technical expertise while keeping my creative spirit alive, combining logic, design, and innovation in every project I take on.
                    </p>
                  </div>

                  {/* Timeline */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
                    {journeyMilestones.map((milestone, index) => (
                      <div
                        key={index}
                        className="relative rounded-xl bg-muted/40 p-6 border border-border/50 hover:bg-muted/60 hover:border-primary/50 transition-all group"
                      >
                        <div className="absolute top-4 right-4 text-4xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                          {index + 1}
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-primary uppercase tracking-wide">
                            {milestone.year}
                          </div>
                          <h3 className="text-base font-semibold text-foreground">
                            {milestone.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabContent>
            )}

            {/* What I Do Tab */}
            {activeTab === 'work' && (
              <TabContent key="work">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">What I Do</h2>
                  </div>

                  <div className="space-y-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-8 border border-border/50">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        I focus on backend and full-stack development with a strong emphasis on AI and automation.
                        I design and implement distributed architectures, microservices, and LLM-based agentic systems using Python, Node.js, and cloud-native technologies.
                        My mission is to leverage AI Agents to enhance cybersecurity, optimize processes, and build systems that learn, adapt, and scale efficiently.
                      </p>
                    </div>
                  </div>

                  {/* Tech Focus Grid */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-2xl">🎯</span> Current Focus
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🤖</span> LangGraph & AI Agents
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🔒</span> Cybersecurity & Log Analysis
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🐍</span> Python Backend Development
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">☁️</span> Distributed Systems & APIs
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-xl transition-shadow">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-2xl">❤️</span> Interests
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🧠</span> AI & Machine Learning
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🔐</span> Security & Privacy
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">📚</span> Teaching & Mentoring
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🌍</span> Open Source Contribution
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabContent>
            )}

            {/* Beyond Code Tab */}
            {activeTab === 'beyond' && (
              <TabContent key="beyond">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Heart className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">Beyond Code</h2>
                  </div>

                  <div className="space-y-6 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-8 border border-border/50">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        Technology for me is an art form. I've always loved drawing and inventing things, skills that now influence how I approach problem-solving and software design.
                        When I'm not coding, I enjoy exploring new frameworks, contributing to open-source projects, and sharing insights with other developers. Continuous learning and creative experimentation are at the heart of everything I do.
                      </p>
                    </div>
                  </div>

                  {/* Let's Connect - CTA */}
                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-10 border border-primary/20">
                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative space-y-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Rocket className="h-8 w-8 text-primary" />
                        <h2 className="text-3xl font-bold text-foreground">Let's Connect</h2>
                      </div>
                      <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                        I'm always open to new challenges, collaborations, and opportunities to build something meaningful.
                        If you're looking for a developer who combines technical depth with creative thinking, let's talk!
                      </p>
                      <div className="pt-4">
                        <a
                          href="/contact"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                        >
                          Get in Touch
                          <Rocket className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </TabContent>
            )}

            {/* Quick Info Tab */}
            {activeTab === 'info' && (
              <TabContent key="info">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-primary" />
                    <h2 className="text-3xl font-bold text-foreground">Quick Info</h2>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-xl transition-shadow backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span> Quick Facts
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">📍</span> Based in Ashkelon, Israel
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">💼</span> Open to new opportunities
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🌍</span> Open to remote work & relocation
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🎓</span> B.Sc. Software Engineering (SCE)
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🎖️</span> Former IDF Fighter & Team Leader
                        </li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border bg-gradient-to-br from-card to-card/50 p-6 hover:shadow-xl transition-shadow backdrop-blur-sm">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-2xl">🗣️</span> Languages
                      </h3>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🇫🇷</span> French - Native
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🇮🇱</span> Hebrew - Native
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🇬🇧</span> English - Fluent
                        </li>
                        <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                          <span className="text-base">🇪🇸</span> Spanish - Intermediate
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Stats or Highlights */}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-border/50">
                      <div className="text-3xl font-bold text-foreground">5+</div>
                      <div className="text-sm text-muted-foreground mt-1">Years Coding</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-border/50">
                      <div className="text-3xl font-bold text-foreground">10+</div>
                      <div className="text-sm text-muted-foreground mt-1">Projects Built</div>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-border/50">
                      <div className="text-3xl font-bold text-foreground">4</div>
                      <div className="text-sm text-muted-foreground mt-1">Languages Spoken</div>
                    </div>
                  </div>
                </div>
              </TabContent>
            )}
          </div>
        </div>
      </Container>
    </Section>
    </div>
  );
}
