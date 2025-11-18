'use client';

import { useState, useEffect } from 'react';

interface AnimatedTitleProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3';
}

export function AnimatedTitle({ text, className = '', as = 'h1' }: AnimatedTitleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Faster typing speed for titles
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text]);

  const Component = as;

  return (
    <Component className={className}>
      <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground animate-gradient-x">
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-0.5 h-[0.9em] bg-primary ml-1 animate-blink" />
        )}
      </span>
    </Component>
  );
}
