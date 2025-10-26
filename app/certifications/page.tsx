import { Award, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { CertificateCard } from '@/components/CertificateCard';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';
import { data } from '@/lib/data';

export const metadata = {
  title: 'Certifications',
  description: 'Professional certifications and achievements in AI, cloud computing, and software development.',
};

export default async function CertificationsPage() {
  const [certificates, activeCertificates] = await Promise.all([
    data.getCertificates(),
    data.getActiveCertificates(),
  ]);

  const sortedCertificates = [...certificates].sort((a, b) => {
    return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });

  return (
    <Section>
      <Container>
        <div className="space-y-12">
          {/* Header */}
          <FadeIn>
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="h-10 w-10 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  Certifications & Achievements
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional certifications demonstrating expertise in AI, cloud computing, and modern software development.
              </p>
            </div>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-primary">{certificates.length}</div>
                <p className="text-sm text-muted-foreground mt-1">Total Certifications</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                  {activeCertificates.length}
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Active Certifications</p>
              </div>
              <div className="rounded-lg border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-primary">
                  {new Set(certificates.map(c => c.issuer)).size}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Certifying Organizations</p>
              </div>
            </div>
          </FadeIn>

          {/* Categories */}
          <FadeIn delay={0.2}>
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
          </FadeIn>

          {/* Footer Note */}
          <FadeIn delay={0.3}>
            <div className="rounded-lg border bg-muted/30 p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Continuously learning and expanding expertise. Check back for new certifications as I explore emerging technologies in AI and cloud computing.
              </p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}
