'use client';

import { useEffect, useState } from 'react';

interface AnimatedHeroTitleProps {
  name: string;
}

/**
 * The name is a kicker, not the headline. A recruiter scans for what you do
 * before who you are, so the value proposition carries the h1 - which also
 * makes the h1 descriptive for search engines.
 */
export function AnimatedHeroTitle({ name }: AnimatedHeroTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < name.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + name[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 70);
      return () => clearTimeout(timeout);
    }
    setIsComplete(true);
  }, [currentIndex, name]);

  return (
    <p className="text-2xl sm:text-3xl font-bold tracking-tight">
      <span className="inline-block bg-clip-text text-transparent bg-linear-to-r from-foreground via-primary to-foreground animate-gradient-x">
        {displayedText}
      </span>
      {!isComplete && (
        <span className="inline-block w-0.5 h-[0.9em] bg-primary ml-1 animate-blink" />
      )}
    </p>
  );
}
