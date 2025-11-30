'use client';

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  angle: number;
  radius: number;
  speed: number;
}

export function DNAHelix() {
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

    let offset = 0;
    const pointCount = 50;
    const helixRadius = 60;
    const helixHeight = canvas.height;
    const spacing = helixHeight / pointCount;

    const color1 = isDarkMode() ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.7)';
    const color2 = isDarkMode() ? 'rgba(236, 72, 153, 0.6)' : 'rgba(236, 72, 153, 0.7)';

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      offset += 0.02;
      const centerX = canvas.width / 2;

      // Draw helix strands
      for (let strand = 0; strand < 2; strand++) {
        const points: { x: number; y: number }[] = [];

        for (let i = 0; i < pointCount; i++) {
          const angle = (i * 0.3) + offset + (strand * Math.PI);
          const x = centerX + Math.cos(angle) * helixRadius;
          const y = i * spacing;

          points.push({ x, y });

          // Draw points
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = strand === 0 ? color1 : color2;
          ctx.fill();
        }

        // Connect points with curves
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
        }

        ctx.strokeStyle = strand === 0 ? color1 : color2;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw connecting bars between strands
      for (let i = 0; i < pointCount; i++) {
        const angle1 = (i * 0.3) + offset;
        const angle2 = (i * 0.3) + offset + Math.PI;

        const x1 = centerX + Math.cos(angle1) * helixRadius;
        const x2 = centerX + Math.cos(angle2) * helixRadius;
        const y = i * spacing;

        // Only draw bar if strands are close enough
        if (Math.abs(angle1 % (Math.PI * 2) - Math.PI) < 0.5) {
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = isDarkMode() ? 'rgba(100, 100, 100, 0.3)' : 'rgba(150, 150, 150, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    // Dark mode observer
    const observer = new MutationObserver(() => {
      // Colors will update on next frame
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
      style={{ width: '100%', height: '100%', zIndex: 0, opacity: 0.4 }}
    />
  );
}
