'use client';

import { Download, Menu, Phone, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { NavLinkAnimation } from './animations/NavLinkAnimation';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';

/**
 * Kept deliberately short - a recruiter scans this in seconds. Experience,
 * education and certifications all live on /resume, which the CV button below
 * makes the prominent destination. Keep in sync with `data/site.json`, which
 * feeds the MCP `get_navigation` tool.
 */
const navigation = [
  { name: 'Projects', href: '/projects' },
  { name: 'Skills', href: '/skills' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const CV_FILE = '/cv/Liron-Himbert.pdf';

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8" aria-label="Global">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="relative w-10 h-10 flex items-center justify-center">
                <Image
                  src="/images/logos/LH_logo.png"
                  alt="Liron Himbert Logo"
                  width={40}
                  height={40}
                  className="transition-transform duration-300 group-hover:scale-110"
                  priority
                />
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:gap-x-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  <NavLinkAnimation isActive={isActive}>{item.name}</NavLinkAnimation>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-x-2 sm:gap-x-3 ml-4 sm:ml-8">
            {/* Primary call to action: the CV downloads straight away. */}
            <Button asChild variant="default" size="sm" className="group relative overflow-hidden">
              <a
                href={CV_FILE}
                download
                className="inline-flex items-center gap-2"
                aria-label="Download Liron Himbert's CV as PDF"
              >
                <div className="absolute inset-0 bg-linear-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Download className="h-4 w-4 relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10 font-semibold">
                  <span className="hidden sm:inline">Download </span>CV
                </span>
              </a>
            </Button>

            {/*
              Demoted to an icon so it doesn't compete with the CV button, but kept
              at every breakpoint - on a phone, tapping to call is the whole point.
            */}
            <Button asChild variant="ghost" size="icon">
              <a href="tel:+972586860673" aria-label="Call Liron Himbert">
                <Phone className="h-4 w-4" />
              </a>
            </Button>

            <ThemeToggle />
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <NavLinkAnimation isActive={isActive}>{item.name}</NavLinkAnimation>
                  </Link>
                );
              })}

              {/* The full CV page stays reachable even though it left the top bar. */}
              <Link
                href="/resume"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  pathname === '/resume'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                Full CV
              </Link>
              <a
                href={CV_FILE}
                download
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-semibold text-primary transition-colors hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
              <a
                href="tel:+972586860673"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Phone className="h-4 w-4" />
                Call me
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
