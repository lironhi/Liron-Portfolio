'use client';

import { useState } from 'react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import {
  UnderlineSlide,
  BackgroundPill,
  ScaleBounce,
  GlowEffect,
  SlideFromLeft,
  GradientShift,
  RotateIn,
  BorderExpand,
  LiquidMorph,
  DotIndicator,
  WaveEffect,
  Particles,
} from '@/components/animations/NavAnimations';

const animations = [
  {
    id: 1,
    name: 'Underline Slide',
    description: 'Ligne élégante qui glisse sous le lien actif - Style minimaliste et professionnel',
    component: UnderlineSlide,
    recommended: true,
  },
  {
    id: 2,
    name: 'Background Pill',
    description: 'Fond arrondi qui apparaît en douceur - Moderne et clean',
    component: BackgroundPill,
    recommended: true,
  },
  {
    id: 3,
    name: 'Scale Bounce',
    description: 'Effet de rebond avec agrandissement - Dynamique et joueur',
    component: ScaleBounce,
  },
  {
    id: 4,
    name: 'Glow Effect',
    description: 'Lueur lumineuse autour du texte - Futuriste et accrocheur',
    component: GlowEffect,
  },
  {
    id: 5,
    name: 'Slide From Left',
    description: 'Barre verticale qui glisse depuis la gauche - Style dashboard',
    component: SlideFromLeft,
  },
  {
    id: 6,
    name: 'Gradient Shift',
    description: 'Dégradé subtil qui apparaît - Discret et élégant',
    component: GradientShift,
  },
  {
    id: 7,
    name: 'Rotate In',
    description: 'Rotation légère en 3D - Original et immersif',
    component: RotateIn,
  },
  {
    id: 8,
    name: 'Border Expand',
    description: 'Bordure qui s\'étend autour du lien - Net et structuré',
    component: BorderExpand,
  },
  {
    id: 9,
    name: 'Liquid Morph',
    description: 'Morphing organique et fluide - Créatif et unique',
    component: LiquidMorph,
  },
  {
    id: 10,
    name: 'Dot Indicator',
    description: 'Point animé à côté du texte - Simple et efficace',
    component: DotIndicator,
    recommended: true,
  },
  {
    id: 11,
    name: 'Wave Effect',
    description: 'Vague qui traverse le lien - Fluide et élégant',
    component: WaveEffect,
  },
  {
    id: 12,
    name: 'Particles',
    description: 'Particules qui jaillissent - Festif et énergique',
    component: Particles,
  },
];

export default function NavAnimationsDemoPage() {
  const [activeIds, setActiveIds] = useState<number[]>([]);

  const toggleActive = (id: number) => {
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <Section>
      <Container>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">
              Animations de Navigation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cliquez sur chaque exemple pour voir l'animation en action. Les animations recommandées sont marquées d'une étoile ⭐
            </p>
          </div>

          {/* Animation Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {animations.map((anim) => {
              const AnimComponent = anim.component;
              const isActive = activeIds.includes(anim.id);

              return (
                <div
                  key={anim.id}
                  className="rounded-lg border bg-card p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => toggleActive(anim.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">
                      {anim.name}
                      {anim.recommended && (
                        <span className="ml-2 text-yellow-500">⭐</span>
                      )}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {anim.description}
                  </p>

                  {/* Demo */}
                  <div className="flex items-center justify-center min-h-[80px] bg-muted/30 rounded-md p-4">
                    <AnimComponent isActive={isActive}>
                      <span className="text-sm font-medium">
                        Menu Item
                      </span>
                    </AnimComponent>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <span className="text-xs text-muted-foreground">
                      {isActive ? '✅ Actif - Cliquez pour désactiver' : '⚪ Inactif - Cliquez pour activer'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="mt-12 rounded-lg border bg-blue-50 dark:bg-blue-950/30 p-6 space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              📝 Comment choisir ?
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>
                <strong>Professionnel / Corporate:</strong> Underline Slide, Background Pill, Border Expand
              </li>
              <li>
                <strong>Moderne / Tech:</strong> Glow Effect, Gradient Shift, Particles
              </li>
              <li>
                <strong>Créatif / Artistique:</strong> Liquid Morph, Wave Effect, Rotate In
              </li>
              <li>
                <strong>Minimaliste:</strong> Dot Indicator, Underline Slide, Slide From Left
              </li>
              <li>
                <strong>Dynamique / Fun:</strong> Scale Bounce, Particles, Liquid Morph
              </li>
            </ul>
          </div>

          {/* Navigation to home */}
          <div className="text-center">
            <a
              href="/"
              className="inline-block text-sm text-primary hover:underline"
            >
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
