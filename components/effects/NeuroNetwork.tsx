'use client';

import { useEffect, useRef } from 'react';

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
  pulsePhase: number;
}

export function NeuroNetwork() {
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

    // Create neurons
    const neurons: Neuron[] = [];
    const neuronCount = 40;
    const maxDistance = 200;

    for (let i = 0; i < neuronCount; i++) {
      neurons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3 + 2,
        active: false,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Activate random neurons
    const activateNeuron = () => {
      const randomNeuron = neurons[Math.floor(Math.random() * neurons.length)];
      randomNeuron.active = true;

      setTimeout(() => {
        randomNeuron.active = false;
      }, 1000);
    };

    // Activate neurons periodically
    setInterval(activateNeuron, 300);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const primaryColor = isDarkMode() ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.8)';
      const activeColor = isDarkMode() ? 'rgba(236, 72, 153, 0.8)' : 'rgba(236, 72, 153, 1)';
      const connectionColor = isDarkMode() ? 'rgba(100, 100, 255, 0.15)' : 'rgba(100, 100, 255, 0.2)';

      // Update and draw neurons
      neurons.forEach((neuron, i) => {
        // Update position
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        neuron.pulsePhase += 0.05;

        // Bounce off edges
        if (neuron.x < 0 || neuron.x > canvas.width) neuron.vx *= -1;
        if (neuron.y < 0 || neuron.y > canvas.height) neuron.vy *= -1;

        // Draw connections
        neurons.forEach((otherNeuron, j) => {
          if (i >= j) return;

          const dx = neuron.x - otherNeuron.x;
          const dy = neuron.y - otherNeuron.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.5;

            ctx.beginPath();
            ctx.moveTo(neuron.x, neuron.y);
            ctx.lineTo(otherNeuron.x, otherNeuron.y);

            if (neuron.active || otherNeuron.active) {
              ctx.strokeStyle = activeColor.replace('0.8)', `${opacity})`).replace('1)', `${opacity})`);
              ctx.lineWidth = 2;
            } else {
              ctx.strokeStyle = connectionColor;
              ctx.lineWidth = 1;
            }

            ctx.stroke();
          }
        });

        // Draw neuron
        const pulseSize = neuron.active ? Math.sin(neuron.pulsePhase) * 2 + neuron.radius : neuron.radius;

        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, pulseSize, 0, Math.PI * 2);

        if (neuron.active) {
          const gradient = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, pulseSize * 2);
          gradient.addColorStop(0, activeColor);
          gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = activeColor;
        } else {
          ctx.fillStyle = primaryColor;
        }

        ctx.fill();
      });

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
      style={{ width: '100%', height: '100%' }}
    />
  );
}
