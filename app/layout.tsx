import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SearchProvider } from '@/components/SearchProvider';
import { ProgressBar } from '@/components/ProgressBar';
import { ChatBot } from '@/components/ChatBot';
import { PageLoader } from '@/components/PageLoader';
import { data } from '@/lib/data';
import { generateOgImageUrl } from '@/lib/utils';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <link rel="icon" href="/icons/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/favicon.ico" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
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
            <PageLoader />
            <ProgressBar />
            <div className="relative flex min-h-screen flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ChatBot />
          </SearchProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}