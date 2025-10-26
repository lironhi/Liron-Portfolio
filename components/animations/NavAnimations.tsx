'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// ============================================
// 1. UNDERLINE SLIDE - Ligne qui glisse sous le lien actif
// ============================================
export function UnderlineSlide({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{
          scaleX: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 380,
          damping: 30,
        }}
      />
    </div>
  );
}

// ============================================
// 2. BACKGROUND PILL - Fond arrondi qui apparaît
// ============================================
export function BackgroundPill({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-primary/10 rounded-full -z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 3. SCALE BOUNCE - Effet de rebond avec scale
// ============================================
export function ScaleBounce({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.1 : 1,
        fontWeight: isActive ? 600 : 400,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 4. GLOW EFFECT - Lueur qui apparaît autour du texte
// ============================================
export function GlowEffect({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-primary/30 blur-xl rounded-full -z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: isActive ? 1.5 : 0,
          opacity: isActive ? 0.8 : 0,
        }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 5. SLIDE FROM LEFT - Barre qui arrive de la gauche
// ============================================
export function SlideFromLeft({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
        initial={{ scaleY: 0, x: -4, opacity: 0 }}
        animate={{
          scaleY: isActive ? 1 : 0,
          x: isActive ? 0 : -4,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      />
      <motion.div
        animate={{
          x: isActive ? 4 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// 6. GRADIENT SHIFT - Gradient qui se déplace
// ============================================
export function GradientShift({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="relative"
      animate={{
        background: isActive
          ? 'linear-gradient(90deg, transparent 0%, rgba(var(--primary-rgb), 0.1) 50%, transparent 100%)'
          : 'transparent',
      }}
      transition={{
        duration: 0.5,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 7. ROTATE IN - Rotation légère avec fade
// ============================================
export function RotateIn({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <motion.div
      animate={{
        rotateX: isActive ? 0 : 10,
        scale: isActive ? 1.05 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// 8. BORDER EXPAND - Bordure qui s'étend
// ============================================
export function BorderExpand({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative px-3 py-2">
      <motion.div
        className="absolute inset-0 border-2 border-primary rounded-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isActive ? 1 : 0.8,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 9. LIQUID MORPH - Effet de morphing liquide
// ============================================
export function LiquidMorph({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 -z-10"
        initial={{ borderRadius: '50%', scale: 0 }}
        animate={{
          borderRadius: isActive ? ['50%', '30%', '40%', '35%'] : '50%',
          scale: isActive ? 1 : 0,
          opacity: isActive ? 1 : 0,
        }}
        transition={{
          borderRadius: {
            duration: 2,
            repeat: isActive ? Number.POSITIVE_INFINITY : 0,
            ease: 'easeInOut',
          },
          scale: {
            type: 'spring',
            stiffness: 300,
            damping: 25,
          },
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 10. DOT INDICATOR - Point coloré qui apparaît
// ============================================
export function DotIndicator({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative flex items-center gap-2">
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
            repeat: isActive ? Number.POSITIVE_INFINITY : 0,
            ease: 'easeInOut',
          },
          opacity: {
            duration: 0.3,
          },
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 11. WAVE EFFECT - Vague qui passe
// ============================================
export function WaveEffect({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10"
        initial={{ x: '-100%' }}
        animate={{
          x: isActive ? '100%' : '-100%',
        }}
        transition={{
          duration: 0.8,
          ease: 'easeInOut',
        }}
      />
      {children}
    </div>
  );
}

// ============================================
// 12. PARTICLES - Particules qui apparaissent
// ============================================
export function Particles({ isActive, children }: { isActive: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      {isActive && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{
                scale: 0,
                x: 0,
                y: 0,
                opacity: 0
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
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 0.5,
              }}
            />
          ))}
        </>
      )}
      {children}
    </div>
  );
}
