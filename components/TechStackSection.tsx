'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface TechItem {
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'ai';
}

const techStack: TechItem[] = [
  // Frontend
  { name: 'React', icon: '/images/logos/tech-stack/reactjs-svgrepo-com.svg', category: 'frontend' },
  { name: 'Next.js', icon: '/images/logos/tech-stack/nextjs-fill-svgrepo-com.svg', category: 'frontend' },
  { name: 'TypeScript', icon: '/images/logos/tech-stack/typescript-official-svgrepo-com.svg', category: 'frontend' },
  { name: 'CSS', icon: '/images/logos/tech-stack/css-svgrepo-com.svg', category: 'frontend' },

  // Backend
  { name: 'Node.js', icon: '/images/logos/tech-stack/node-svgrepo-com.svg', category: 'backend' },
  { name: 'Python', icon: '/images/logos/tech-stack/python-svgrepo-com.svg', category: 'backend' },
  { name: 'Django', icon: '/images/logos/tech-stack/django-svgrepo-com.svg', category: 'backend' },
  { name: 'NestJS', icon: '/images/logos/tech-stack/nestjs-svgrepo-com.svg', category: 'backend' },

  // Database
  { name: 'MongoDB', icon: '/images/logos/tech-stack/mongo-svgrepo-com.svg', category: 'database' },
  { name: 'MySQL', icon: '/images/logos/tech-stack/mysql-svgrepo-com.svg', category: 'database' },
  { name: 'Redis', icon: '/images/logos/tech-stack/redis-svgrepo-com.svg', category: 'database' },

  // Tools
  { name: 'Git', icon: '/images/logos/tech-stack/git-svgrepo-com.svg', category: 'tools' },
  { name: 'Docker', icon: '/images/logos/tech-stack/docker-svgrepo-com.svg', category: 'tools' },
  { name: 'AWS', icon: '/images/logos/tech-stack/aws-svgrepo-com.svg', category: 'tools' },

  // AI/ML
  { name: 'AI', icon: '/images/logos/tech-stack/ai-svgrepo-com.svg', category: 'ai' },
  { name: 'LangChain', icon: '/images/logos/tech-stack/langgraph-color.svg', category: 'ai' },
];

const categoryColors = {
  frontend: 'from-blue-500/20 to-cyan-500/20',
  backend: 'from-green-500/20 to-emerald-500/20',
  database: 'from-purple-500/20 to-pink-500/20',
  tools: 'from-orange-500/20 to-red-500/20',
  ai: 'from-violet-500/20 to-fuchsia-500/20',
};

export function TechStackSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
    <div ref={ref} className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 max-w-6xl mx-auto">
        {techStack.map((tech, index) => (
          <div
            key={tech.name}
            className={`group relative transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative">
              {/* Icon container */}
              <div className={`
                relative w-16 h-16 sm:w-20 sm:h-20 mx-auto p-3 sm:p-4
                rounded-2xl bg-background border border-border
                transition-all duration-300
                group-hover:scale-110 group-hover:shadow-xl
                group-hover:border-primary/50
                ${hoveredIndex === index ? 'ring-2 ring-primary/30' : ''}
              `}>
                {/* Gradient background on hover */}
                <div className={`
                  absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                  transition-opacity duration-300 bg-gradient-to-br ${categoryColors[tech.category]}
                `} />

                {/* Icon */}
                <div className="relative w-full h-full">
                  <Image
                    src={tech.icon}
                    alt={tech.name}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Tooltip */}
              <div className={`
                absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap
                px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-all duration-200 group-hover:-translate-y-2
                shadow-lg z-10
              `}>
                {tech.name}
                {/* Arrow */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom gradient line */}
      <div className="mt-16 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
