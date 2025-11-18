'use client';

import { Quote } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface QuoteSectionProps {
  quote: string;
  author?: string;
}

export function QuoteSection({ quote, author }: QuoteSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`
        relative max-w-4xl mx-auto p-12 rounded-3xl
        bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5
        border border-primary/20
        transition-all duration-1000
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
    >
      {/* Quote icon */}
      <div className="absolute -top-6 left-12">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Quote className="w-6 h-6 text-primary-foreground" />
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />

      {/* Quote text */}
      <blockquote className="relative z-10">
        <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed text-center italic">
          "{quote}"
        </p>
        {author && (
          <footer className="mt-6 text-center">
            <cite className="text-muted-foreground not-italic">— {author}</cite>
          </footer>
        )}
      </blockquote>

      {/* Floating gradient orbs */}
      <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
    </div>
  );
}
