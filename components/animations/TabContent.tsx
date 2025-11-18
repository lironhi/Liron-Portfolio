'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TabContentProps {
  children: ReactNode;
  className?: string;
}

export function TabContent({ children, className }: TabContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
