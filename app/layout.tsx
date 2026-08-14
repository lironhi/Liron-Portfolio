import { Analytics } from '@vercel/analytics/react';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { ChatBot } from '@/components/ChatBot';
import { ChatProvider } from '@/components/ChatProvider';
import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { ProgressBar } from '@/components/ProgressBar';
import { SearchProvider } from '@/components/SearchProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { data } from '@/lib/data';
import { generateOgImageUrl } from '@/lib/utils';
import './globals.css';

/**
 * Three roles, three faces:
 * - Inter carries body copy, where neutrality is a virtue.
 * - Space Grotesk carries headings; its geometric quirks are what stop the site
 *   reading like every other Inter-only template.
 * - JetBrains Mono carries data - years, levels, counts, tags - which is where
 *   an engineering portfolio earns its texture.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['SFMono-Regular', 'Consolas', 'monospace'],
});

export async function generateMetadata() {
  const siteInfo = await data.getSiteInfo();

  return {
    title: {
      default: siteInfo.title,
      template: `%s | ${siteInfo.author.name}`,
    },
    description: siteInfo.description,
    keywords: siteInfo.seo.keywords,
    authors: [{ name: siteInfo.author.name, url: siteInfo.url }],
    creator: siteInfo.author.name,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteInfo.url,
      title: siteInfo.title,
      description: siteInfo.description,
      siteName: siteInfo.name,
      images: [
        {
          url: generateOgImageUrl(siteInfo.title, siteInfo.url),
          width: 1200,
          height: 630,
          alt: siteInfo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteInfo.title,
      description: siteInfo.description,
      images: [generateOgImageUrl(siteInfo.title, siteInfo.url)],
      creator: siteInfo.author.social.twitter,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Load all data for search indexing
  const [projects, skills, certificates, experiences] = await Promise.all([
    data.getProjects(),
    data.getSkills(),
    data.getCertificates(),
    data.getExperience(),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          This site ships its own light/dark theme (next-themes + `color-scheme`).
          The lock tells Dark Reader to stand down instead of rewriting our inline
          styles before React hydrates, which otherwise produces hydration mismatches
          and repaints the brand colours.
        */}
        <meta name="darkreader-lock" />
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SearchProvider
            projects={projects}
            skills={skills}
            certificates={certificates}
            experiences={experiences}
          >
            <ChatProvider>
              <ProgressBar />
              <div className="relative flex min-h-screen flex-col">
                <Nav />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <ChatBot />
            </ChatProvider>
          </SearchProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
