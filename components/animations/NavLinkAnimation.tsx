'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface NavLinkAnimationProps {
  isActive: boolean;
  children: ReactNode;
}

export function NavLinkAnimation({ isActive, children }: NavLinkAnimationProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dot Indicator - Apparaît quand actif */}
      <motion.div
        className="w-1.5 h-1.5 bg-primary rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isActive ? [1, 1.3, 1] : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          scale: {
            duration: 0.6,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
          },
          opacity: {
            duration: 0.3,
          },
        }}
      />

      {/* Particles - Apparaissent au survol (sauf si actif) */}
      <div className="relative">
        {isHovered && !isActive && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/60 rounded-full pointer-events-none"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: [0, (i - 2) * 15],
                  y: [0, -20],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            ))}
          </>
        )}

        {/* Text with hover effect */}
        <motion.div
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
          }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
