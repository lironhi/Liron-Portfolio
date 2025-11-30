'use client';

import { useEffect, useRef } from 'react';

interface Shape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  velocityX: number;
  velocityY: number;
  type: 'triangle' | 'square' | 'hexagon' | 'circle';
  color: string;
  opacity: number;
}

export function GeometricShapes() {
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

    // Create shapes
    const shapes: Shape[] = [];
    const shapeCount = 15;
    const colors = isDarkMode()
      ? ['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(34, 211, 238, 0.3)']
      : ['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(236, 72, 153, 0.4)', 'rgba(34, 211, 238, 0.4)'];

    const types: Shape['type'][] = ['triangle', 'square', 'hexagon', 'circle'];

    for (let i = 0; i < shapeCount; i++) {
      shapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 60 + 30,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        velocityX: (Math.random() - 0.5) * 0.5,
        velocityY: (Math.random() - 0.5) * 0.5,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.3 + 0.2
      });
    }

    // Draw functions for each shape
    const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.closePath();
    };

    const drawSquare = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.rect(x - size / 2, y - size / 2, size, size);
      ctx.closePath();
    };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size / 2 * Math.cos(angle);
        const py = y + size / 2 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      shapes.forEach(shape => {
        // Update position
        shape.x += shape.velocityX;
        shape.y += shape.velocityY;
        shape.rotation += shape.rotationSpeed;

        // Bounce off edges
        if (shape.x < -50 || shape.x > canvas.width + 50) shape.velocityX *= -1;
        if (shape.y < -50 || shape.y > canvas.height + 50) shape.velocityY *= -1;

        // Draw shape
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);

        ctx.strokeStyle = shape.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = shape.opacity;

        switch (shape.type) {
          case 'triangle':
            drawTriangle(ctx, 0, 0, shape.size);
            break;
          case 'square':
            drawSquare(ctx, 0, 0, shape.size);
            break;
          case 'hexagon':
            drawHexagon(ctx, 0, 0, shape.size);
            break;
          case 'circle':
            drawCircle(ctx, 0, 0, shape.size);
            break;
        }

        ctx.stroke();
        ctx.restore();
      });

      requestAnimationFrame(animate);
    };

    animate();

    // Dark mode observer
    const observer = new MutationObserver(() => {
      const newColors = isDarkMode()
        ? ['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.3)', 'rgba(236, 72, 153, 0.3)', 'rgba(34, 211, 238, 0.3)']
        : ['rgba(139, 92, 246, 0.4)', 'rgba(59, 130, 246, 0.4)', 'rgba(236, 72, 153, 0.4)', 'rgba(34, 211, 238, 0.4)'];

      shapes.forEach(shape => {
        shape.color = newColors[Math.floor(Math.random() * newColors.length)];
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
