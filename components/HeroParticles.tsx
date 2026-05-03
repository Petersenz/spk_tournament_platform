"use client";

import { useEffect, useRef } from "react";

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Respect reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      opacity: number;
      baseX: number;
      speedY: number;
    }> = [];

    const isMobile = window.innerWidth < 768;
    const maxParticles = isMobile ? 20 : 50;

    const resize = () => {
      // Set display size (css pixels).
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      // Set actual size in memory (scaled to account for extra pixel density).
      const scale = window.devicePixelRatio || 1;
      canvas.width = displayWidth * scale;
      canvas.height = displayHeight * scale;

      // Normalize coordinate system to use css pixels.
      ctx.scale(scale, scale);
    };

    const initParticles = () => {
      particles = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      for (let i = 0; i < maxParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2, // very subtle horizontal drift
          vy: -(Math.random() * 0.3 + 0.1), // upward drift (0.1 - 0.4)
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.2 + 0.05,
          baseX: Math.random() * width,
          speedY: Math.random() * 0.01 + 0.005,
        });
      }
    };

    const draw = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        // Update positions
        p.y += p.vy;
        p.x += p.vx + Math.sin(time * p.speedY) * 0.2; // slight sine wave

        // Reset if off screen
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 0, 9, ${p.opacity})`;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(244, 0, 9, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Initialize
    resize();
    initParticles();
    draw(0);

    // Event listeners
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        initParticles();
      }, 250);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        draw(performance.now());
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
