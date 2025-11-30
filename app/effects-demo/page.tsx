'use client';

import { useState } from 'react';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Button } from '@/components/Button';
import { FloatingParticles } from '@/components/FloatingParticles';
import { AnimatedGradient } from '@/components/effects/AnimatedGradient';
import { FloatingBubbles } from '@/components/effects/FloatingBubbles';
import { TwinklingStars } from '@/components/effects/TwinklingStars';
import { MatrixRain } from '@/components/effects/MatrixRain';
import { FloatingOrbs } from '@/components/effects/FloatingOrbs';
import { AnimatedWaves } from '@/components/effects/AnimatedWaves';
import { GeometricShapes } from '@/components/effects/GeometricShapes';
import { RippleEffect } from '@/components/effects/RippleEffect';
import { DNAHelix } from '@/components/effects/DNAHelix';
import { FireworksEffect } from '@/components/effects/FireworksEffect';
import { NeuroNetwork } from '@/components/effects/NeuroNetwork';
import { DigitalRain } from '@/components/effects/DigitalRain';

type EffectType = 'particles' | 'gradient' | 'bubbles' | 'stars' | 'matrix' | 'orbs' | 'waves' | 'geometric' | 'ripple' | 'dna' | 'fireworks' | 'neuro' | 'digitalrain' | 'none';

const effects = [
  { id: 'none' as EffectType, name: 'Aucun Effet', description: 'Pas d\'effet de fond' },
  { id: 'particles' as EffectType, name: 'Particules Connectées', description: 'Particules flottantes avec lignes de connexion (effet actuel sur la home)' },
  { id: 'gradient' as EffectType, name: 'Gradient Animé', description: 'Blobs de couleur qui bougent doucement' },
  { id: 'bubbles' as EffectType, name: 'Bulles Flottantes', description: 'Bulles qui montent comme dans l\'eau' },
  { id: 'stars' as EffectType, name: 'Étoiles Scintillantes', description: 'Étoiles qui apparaissent et disparaissent' },
  { id: 'matrix' as EffectType, name: 'Matrix (Pluie de Code)', description: 'Caractères qui tombent comme dans Matrix' },
  { id: 'orbs' as EffectType, name: 'Orbes Lumineux', description: 'Grandes sphères lumineuses qui flottent' },
  { id: 'waves' as EffectType, name: 'Ondulations/Vagues', description: 'Vagues animées fluides' },
  { id: 'geometric' as EffectType, name: 'Formes Géométriques', description: 'Triangles, carrés, hexagones et cercles qui tournent' },
  { id: 'ripple' as EffectType, name: 'Effet Ripple', description: 'Ondulations concentriques qui se propagent' },
  { id: 'dna' as EffectType, name: 'Hélice ADN', description: 'Double hélice ADN animée' },
  { id: 'fireworks' as EffectType, name: 'Feux d\'Artifice', description: 'Explosions de particules colorées' },
  { id: 'neuro' as EffectType, name: 'Réseau Neuronal', description: 'Réseau de neurones avec impulsions électriques' },
  { id: 'digitalrain' as EffectType, name: 'Pluie Digitale', description: 'Caractères qui tombent style Matrix avec couleurs cyan' },
];

export default function EffectsDemoPage() {
  const [activeEffect, setActiveEffect] = useState<EffectType>('particles');

  const renderEffect = () => {
    switch (activeEffect) {
      case 'particles':
        return <FloatingParticles />;
      case 'gradient':
        return <AnimatedGradient />;
      case 'bubbles':
        return <FloatingBubbles />;
      case 'stars':
        return <TwinklingStars />;
      case 'matrix':
        return <MatrixRain />;
      case 'orbs':
        return <FloatingOrbs />;
      case 'waves':
        return <AnimatedWaves />;
      case 'geometric':
        return <GeometricShapes />;
      case 'ripple':
        return <RippleEffect />;
      case 'dna':
        return <DNAHelix />;
      case 'fireworks':
        return <FireworksEffect />;
      case 'neuro':
        return <NeuroNetwork />;
      case 'digitalrain':
        return <DigitalRain />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Current active effect */}
      {renderEffect()}

      <Section className="py-20 relative z-10">
        <Container>
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Démo des Effets Visuels
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Testez tous les effets d'arrière-plan disponibles. Cliquez sur un effet pour le voir en action.
            </p>
          </div>

          {/* Current Effect Display */}
          <div className="mb-12 p-6 bg-background/80 backdrop-blur-sm border border-border rounded-2xl">
            <h2 className="text-2xl font-semibold mb-2">
              {effects.find(e => e.id === activeEffect)?.name || 'Aucun effet'}
            </h2>
            <p className="text-muted-foreground">
              {effects.find(e => e.id === activeEffect)?.description}
            </p>
          </div>

          {/* Effect Selector Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {effects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setActiveEffect(effect.id)}
                className={`
                  p-6 rounded-xl border-2 transition-all text-left
                  hover:scale-105 hover:shadow-lg
                  ${
                    activeEffect === effect.id
                      ? 'border-primary bg-primary/10 shadow-lg'
                      : 'border-border bg-background/60 backdrop-blur-sm'
                  }
                `}
              >
                <h3 className="font-semibold mb-2 text-lg">{effect.name}</h3>
                <p className="text-sm text-muted-foreground">{effect.description}</p>
              </button>
            ))}
          </div>

          {/* Usage Recommendations */}
          <div className="mt-12 p-6 bg-background/80 backdrop-blur-sm border border-border rounded-2xl">
            <h2 className="text-xl font-semibold mb-4">💡 Recommandations d'utilisation</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Homepage :</strong> Particules Connectées (actuel), Orbes Lumineux, ou Réseau Neuronal</p>
              <p><strong>Page Contact :</strong> Bulles Flottantes, Gradient Animé, ou Effet Ripple</p>
              <p><strong>Page Projects :</strong> Étoiles Scintillantes, Formes Géométriques, ou Gradient Animé</p>
              <p><strong>Page About :</strong> Ondulations/Vagues, Hélice ADN (scientifique), ou Formes Géométriques</p>
              <p><strong>Page Tech/Code :</strong> Matrix, Pluie Digitale, ou Réseau Neuronal</p>
              <p><strong>Page Événement/Célébration :</strong> Feux d'Artifice</p>
            </div>
          </div>

          {/* Performance Note */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note :</strong> Tous ces effets utilisent Canvas et sont optimisés, mais sur mobile il vaut mieux utiliser des effets plus légers comme le Gradient Animé.
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Button asChild>
              <a href="/">Retour à l'accueil</a>
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
