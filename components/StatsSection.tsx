'use client';

import { useEffect, useRef, useState } from 'react';

interface Stat {
  value: number;
  label: string;
  suffix?: string;
}

interface StatsSectionProps {
  stats: Stat[];
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
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

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isVisible]);

  return (
    <div ref={ref} className="text-4xl sm:text-5xl font-bold text-foreground">
      {count}{suffix}
    </div>
  );
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative group"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="text-center space-y-2">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              {stat.label}
            </p>
          </div>

          {/* Decorative line */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
}
