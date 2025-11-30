'use client';

import { useEffect, useRef, useState } from 'react';

export function AnimatedWaves() {
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

    let time = 0;
    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.01;

      // Draw multiple wave layers
      const waves = [
        { amplitude: 30, frequency: 0.01, speed: 0.5, opacity: 0.1, yOffset: canvas.height * 0.3 },
        { amplitude: 40, frequency: 0.008, speed: 0.3, opacity: 0.15, yOffset: canvas.height * 0.5 },
        { amplitude: 50, frequency: 0.012, speed: 0.7, opacity: 0.1, yOffset: canvas.height * 0.7 },
      ];

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);

        for (let x = 0; x <= canvas.width; x++) {
          const y = wave.yOffset + Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();

        if (isDark) {
          ctx.fillStyle = `rgba(59, 130, 246, ${wave.opacity})`;
        } else {
          ctx.fillStyle = `rgba(147, 197, 253, ${wave.opacity})`;
        }
        ctx.fill();
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
    />
  );
}
