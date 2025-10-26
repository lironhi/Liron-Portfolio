'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  lift?: boolean;
  glow?: boolean;
}

export function HoverCard({
  children,
  className = '',
  scale = 1.02,
  lift = true,
  glow = false,
}: HoverCardProps) {
  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ scale: 1 }}
      whileHover={{
        scale,
        y: lift ? -4 : 0,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 20,
        },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-primary/20 blur-xl -z-10"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {children}
    </motion.div>
  );
}
