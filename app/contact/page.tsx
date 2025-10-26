import { Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { ContactForm } from '@/components/ContactForm';
import { FadeIn } from '@/components/animations';
import { data } from '@/lib/data';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with me for opportunities, collaborations, or just to say hello.',
};

export default async function ContactPage() {
  const siteInfo = await data.getSiteInfo();
  const { author } = siteInfo;

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl space-y-12">
          <FadeIn>
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Get In Touch
              </h1>
              <p className="text-lg text-muted-foreground">
                I'm always interested in new opportunities and collaborations.
                Let's discuss how we can work together!
              </p>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn delay={0.2}>
            <div className="rounded-lg border bg-card p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">Send Me a Message</h2>
                <p className="text-muted-foreground">
                  Fill out the form below or click "Open in Gmail" to use your email client.
                </p>
              </div>
              <ContactForm recipientEmail={author.social.email} />
            </div>
          </FadeIn>

          {/* Contact Info & Social */}
          <FadeIn delay={0.3}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Email</p>
                      <a
                        href={`mailto:${author.social.email}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {author.social.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">{author.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Find Me Online</h2>

                <div className="space-y-3">
                  {author.social.github && (
                    <a
                      href={author.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-all hover:translate-x-1"
                    >
                      <Github className="h-5 w-5" />
                      <span>GitHub</span>
                    </a>
                  )}

                  {author.social.linkedin && (
                    <a
                      href={author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-all hover:translate-x-1"
                    >
                      <Linkedin className="h-5 w-5" />
                      <span>LinkedIn</span>
                    </a>
                  )}

                  {author.social.twitter && (
                    <a
                      href={author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-foreground transition-all hover:translate-x-1"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span>Twitter</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Response Time */}
          <FadeIn delay={0.4}>
            <div className="rounded-lg border bg-muted/30 p-6 text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Response Time</h3>
              <p className="text-sm text-muted-foreground">
                I typically respond to emails within 24-48 hours.
                For urgent matters, feel free to reach out via LinkedIn.
              </p>
            </div>
          </FadeIn>
        </div>
      </Container>
    </Section>
  );
}