'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';
import { NavLinkAnimation } from './animations/NavLinkAnimation';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Experience', href: '/experience' },
  { name: 'Skills', href: '/skills' },
  { name: 'CV', href: '/cv' },
  { name: 'Education', href: '/education' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                  <NavLinkAnimation isActive={isActive}>
                    {item.name}
                  </NavLinkAnimation>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-x-4 ml-8">
            <Button asChild variant="default" size="sm" className="group relative overflow-hidden">
              <a href="tel:+972586860673" className="inline-flex items-center gap-2">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Phone className="h-4 w-4 relative z-10 group-hover:animate-bounce" />
                <span className="hidden sm:inline relative z-10 font-semibold">Call Me</span>
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
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
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
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <NavLinkAnimation isActive={isActive}>
                      {item.name}
                    </NavLinkAnimation>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}