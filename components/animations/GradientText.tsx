'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function GradientText({ children, className = '', animate = true }: GradientTextProps) {
  return (
    <motion.span
      className={cn(
        'bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto]',
        className
      )}
      animate={
        animate
          ? {
              backgroundPosition: ['0% center', '200% center', '0% center'],
            }
          : undefined
      }
      transition={
        animate
          ? {
              duration: 8,
              ease: 'linear',
              repeat: Number.POSITIVE_INFINITY,
            }
          : undefined
      }
    >
      {children}
    </motion.span>
  );
}
