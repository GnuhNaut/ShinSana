import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  speedY: number;
  speedX: number;
  swingRange: number;
  swingSpeed: number;
  swingPhase: number;
  color: string;
};

const GOLDEN_PALETTE = [
  'rgba(246, 211, 101, ',
  'rgba(253, 224, 71, ',
  'rgba(212, 175, 55, ',
  'rgba(254, 240, 138, ',
  'rgba(251, 191, 36, ',
];

export function GoldenStardust({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive particle count (fewer on mobile to preserve battery)
    const isMobile = width < 768;
    const count = isMobile ? 22 : 36;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const baseAlpha = 0.2 + Math.random() * 0.55;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * (isMobile ? 2.2 : 3),
        alpha: baseAlpha,
        baseAlpha,
        speedY: 0.25 + Math.random() * 0.45,
        speedX: (Math.random() - 0.5) * 0.2,
        swingRange: 15 + Math.random() * 25,
        swingSpeed: 0.008 + Math.random() * 0.015,
        swingPhase: Math.random() * Math.PI * 2,
        color: GOLDEN_PALETTE[Math.floor(Math.random() * GOLDEN_PALETTE.length)],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (isDocumentVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y -= p.speedY;
          p.swingPhase += p.swingSpeed;
          p.x += Math.sin(p.swingPhase) * 0.35 + p.speedX;

          // Twinkle effect
          p.alpha = p.baseAlpha * (0.7 + 0.3 * Math.sin(p.swingPhase * 3));

          // Recycle particle when it floats off top or sides
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.shadowBlur = p.size * 2.5;
          ctx.shadowColor = 'rgba(246, 211, 101, 0.7)';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="golden-stardust-canvas"
      aria-hidden="true"
    />
  );
}
