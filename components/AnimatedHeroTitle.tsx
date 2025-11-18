'use client';

import { useEffect, useState } from 'react';

interface AnimatedHeroTitleProps {
  name: string;
}

export function AnimatedHeroTitle({ name }: AnimatedHeroTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < name.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + name[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, name]);

  return (
    <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-center mb-16 relative">
      <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground animate-gradient-x">
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-1 h-[0.9em] bg-primary ml-1 animate-blink" />
        )}
      </span>

      {/* Glow effect */}
      <span className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-r from-primary/50 via-primary/30 to-primary/50 -z-10" aria-hidden="true">
        {displayedText}
      </span>
    </h1>
  );
}
