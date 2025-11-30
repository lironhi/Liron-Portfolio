'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  color: string;
  gravity: number;
  life: number;
  maxLife: number;
}

interface Firework {
  x: number;
  y: number;
  targetY: number;
  velocityY: number;
  color: string;
  exploded: boolean;
}

export function FireworksEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Check dark mode
    const isDarkMode = () => document.documentElement.classList.contains('dark');

    const fireworks: Firework[] = [];
    const particles: Particle[] = [];
    const colors = ['#8b5cf6', '#ec4899', '#3b82f6', '#22d3ee', '#f59e0b', '#10b981'];

    // Create firework
    const createFirework = () => {
      fireworks.push({
        x: Math.random() * canvas.width,
        y: canvas.height,
        targetY: Math.random() * (canvas.height * 0.4) + 50,
        velocityY: -8,
        color: colors[Math.floor(Math.random() * colors.length)],
        exploded: false
      });
    };

    // Explode firework
    const explodeFirework = (firework: Firework) => {
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = Math.random() * 3 + 2;

        particles.push({
          x: firework.x,
          y: firework.y,
          velocityX: Math.cos(angle) * velocity,
          velocityY: Math.sin(angle) * velocity,
          opacity: 1,
          color: firework.color,
          gravity: 0.1,
          life: 0,
          maxLife: Math.random() * 80 + 60
        });
      }
    };

    // Create initial fireworks
    createFirework();

    let animationFrameId: number;

    // Animation loop
    const animate = () => {
      ctx.fillStyle = isDarkMode() ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const firework = fireworks[i];

        if (!firework.exploded) {
          firework.y += firework.velocityY;
          firework.velocityY += 0.2; // Gravity

          // Draw firework trail
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          // Explode when reaching target
          if (firework.y <= firework.targetY) {
            explodeFirework(firework);
            firework.exploded = true;
            fireworks.splice(i, 1);
          }
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.velocityY += particle.gravity;
        particle.life++;
        particle.opacity = 1 - (particle.life / particle.maxLife);

        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Create new firework occasionally
      if (Math.random() < 0.02 && fireworks.length < 3) {
        createFirework();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
