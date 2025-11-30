'use client';

import { useEffect, useRef } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
  color: string;
}

export function RippleEffect() {
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

    const ripples: Ripple[] = [];
    const colors = isDarkMode()
      ? ['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(236, 72, 153, 0.4)']
      : ['rgba(139, 92, 246, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(236, 72, 153, 0.5)'];

    // Create ripple at random position
    const createRipple = () => {
      ripples.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 0,
        maxRadius: Math.random() * 150 + 100,
        opacity: 1,
        speed: Math.random() * 1.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    };

    // Create initial ripples
    for (let i = 0; i < 3; i++) {
      setTimeout(createRipple, i * 1000);
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];

        ripple.radius += ripple.speed;
        ripple.opacity = 1 - (ripple.radius / ripple.maxRadius);

        if (ripple.opacity <= 0) {
          ripples.splice(i, 1);
          continue;
        }

        // Draw multiple concentric circles for each ripple
        for (let j = 0; j < 3; j++) {
          const offset = j * 20;
          const currentRadius = ripple.radius - offset;

          if (currentRadius > 0) {
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, currentRadius, 0, Math.PI * 2);
            ctx.strokeStyle = ripple.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = ripple.opacity * (1 - j * 0.3);
            ctx.stroke();
          }
        }
      }

      // Create new ripple occasionally
      if (Math.random() < 0.01 && ripples.length < 8) {
        createRipple();
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Dark mode observer
    const observer = new MutationObserver(() => {
      const newColors = isDarkMode()
        ? ['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(236, 72, 153, 0.4)']
        : ['rgba(139, 92, 246, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(236, 72, 153, 0.5)'];

      ripples.forEach(ripple => {
        ripple.color = newColors[Math.floor(Math.random() * newColors.length)];
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      observer.disconnect();
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
