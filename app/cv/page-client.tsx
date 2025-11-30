'use client';

import dynamic from 'next/dynamic';
import { FileText, Download, Globe } from 'lucide-react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import type { CVData } from '@/lib/data/types';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';

// Dynamically import PDFViewer to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import('@/components/PDFViewer').then(mod => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center rounded-lg border bg-muted/30 p-4 min-h-[600px]">
      <span className="text-muted-foreground">Loading PDF viewer...</span>
    </div>
  ),
});

interface CVPageClientProps {
  cvData: CVData;
}

export function CVPageClient({ cvData }: CVPageClientProps) {
  const defaultCV = cvData.files.find(f => f.language === cvData.defaultLanguage) || cvData.files[0];

  return (
    <div className="relative min-h-screen">
      {/* Background Effect */}
      <FloatingOrbs />

      <Section className="relative z-10">
      <Container>
        <div className="space-y-12">
          {/* Header */}
          <FadeIn>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Curriculum Vitae
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Download or view my CV in your preferred language.
              </p>
            </div>
          </FadeIn>

          {/* Language Selection */}
          <FadeIn delay={0.1}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Available Languages
              </h2>
              <StaggerContainer className="grid gap-4 sm:grid-cols-3">
                {cvData.files.map((file) => (
                  <StaggerItem key={file.language}>
                    <div className="group rounded-lg border bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground text-lg">
                              {file.label}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Last updated: {new Date(file.lastUpdated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-2xl">
                            {file.language === 'en' && '🇬🇧'}
                            {file.language === 'fr' && '🇫🇷'}
                            {file.language === 'he' && '🇮🇱'}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full"
                        >
                          <a
                            href={file.url}
                            download={file.filename}
                            aria-label={`Download ${file.label}`}
                            className="inline-flex items-center justify-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeIn>

          {/* PDF Viewer */}
          <FadeIn delay={0.2}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Preview
              </h2>
              <PDFViewer url={defaultCV.url} filename={defaultCV.filename} />
            </div>
          </FadeIn>

          {/* Additional Info */}
          <FadeIn delay={0.3}>
            <div className="rounded-lg border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                For the most up-to-date information about my experience and skills, please visit my{' '}
                <a href="/experience" className="text-primary hover:underline">
                  Experience
                </a>{' '}
                and{' '}
                <a href="/skills" className="text-primary hover:underline">
                  Skills
                </a>{' '}
                pages.
              </p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
    </div>
  );
}
