'use client';

import { useEffect, useRef, useState } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Matrix characters
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);

    // Create drops
    const drops: Drop[] = [];
    for (let i = 0; i < columns; i++) {
      drops.push({
        x: i * fontSize,
        y: Math.random() * -canvas.height,
        speed: Math.random() * 10 + 5,
        chars: [],
      });
    }

    let animationFrameId: number;

    const animate = () => {
      // Fade effect
      ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      drops.forEach((drop) => {
        // Pick random character
        const char = chars[Math.floor(Math.random() * chars.length)];

        // Draw character
        if (isDark) {
          ctx.fillStyle = '#0F0'; // Green for dark mode
        } else {
          ctx.fillStyle = '#0A0'; // Darker green for light mode
        }
        ctx.fillText(char, drop.x, drop.y);

        // Move drop down
        drop.y += drop.speed;

        // Reset drop when it goes off screen
        if (drop.y > canvas.height) {
          drop.y = Math.random() * -100;
          drop.speed = Math.random() * 10 + 5;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: isDark ? 0.5 : 0.3 }}
    />
  );
}
