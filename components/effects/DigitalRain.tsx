'use client';

import { useEffect, useRef } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  charIndex: number;
}

export function DigitalRain() {
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

    // Create character set (binary, hex, and symbols)
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF#$%&@';

    const drops: Drop[] = [];
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    // Create drops
    for (let i = 0; i < columns; i++) {
      drops.push({
        x: i * fontSize,
        y: Math.random() * -500,
        speed: Math.random() * 3 + 1,
        chars: chars.split(''),
        charIndex: Math.floor(Math.random() * chars.length)
      });
    }

    // Animation loop
    const animate = () => {
      // Semi-transparent background for trail effect
      ctx.fillStyle = isDarkMode() ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      drops.forEach(drop => {
        // Change character occasionally
        if (Math.random() < 0.05) {
          drop.charIndex = Math.floor(Math.random() * drop.chars.length);
        }

        const char = drop.chars[drop.charIndex];

        // Create gradient for each character
        const gradient = ctx.createLinearGradient(drop.x, drop.y - fontSize * 10, drop.x, drop.y);

        if (isDarkMode()) {
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
          gradient.addColorStop(0.5, 'rgba(34, 211, 238, 0.5)');
          gradient.addColorStop(1, 'rgba(34, 211, 238, 1)');
        } else {
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0)');
          gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.6)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 1)');
        }

        ctx.fillStyle = gradient;
        ctx.fillText(char, drop.x, drop.y);

        // Draw brighter head
        ctx.fillStyle = isDarkMode() ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 100, 200, 1)';
        ctx.fillText(char, drop.x, drop.y);

        // Update position
        drop.y += drop.speed;

        // Reset when off screen
        if (drop.y > canvas.height + 100) {
          drop.y = Math.random() * -200 - 100;
          drop.speed = Math.random() * 3 + 1;
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
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
