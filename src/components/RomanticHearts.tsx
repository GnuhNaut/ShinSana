import { useEffect, useRef } from 'react';

const POOL_SIZE = 18;
const blockedTarget = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  if (!element) return true;
  if (element.closest('[data-heart-allowed]')) return false;
  return Boolean(element.closest('input, textarea, select, button, a, iframe, [role="dialog"], .viewer, .gift-insert__qr, [data-no-hearts]'));
};

const isDarkSurface = (target: EventTarget | null) => {
  const element = target instanceof Element ? target : null;
  if (!element) return false;
  if (element.closest('.response-paper, .gift-insert, .venue-panel, .intro-scene')) return false;
  return Boolean(element.closest('.opening, .hero-scene, .venue-scene, .cinematic-scene, .gallery-scene, .response-scene, .gift-scene, .finale-scene'));
};

export function RomanticHearts() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!layer || reducedMotion.matches) return;

    const nodes = Array.from(layer.querySelectorAll<HTMLElement>('.heart-particle'));
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let poolIndex = 0;
    let frame = 0;
    let pending: PointerEvent | null = null;
    let lastX = -100;
    let lastY = -100;

    const emit = (x: number, y: number, burst: boolean, order = 0, darkSurface = false) => {
      const node = nodes[poolIndex++ % nodes.length];
      node.getAnimations().forEach((animation) => animation.cancel());
      const outline = poolIndex % 9 === 0;
      const pale = darkSurface ? poolIndex % 3 !== 0 : poolIndex % 5 === 0;
      const size = burst ? 7 + (order % 4) : 5 + (poolIndex % 7);
      const angle = burst ? (Math.PI * 2 * order) / 8 : Math.PI * (.52 + Math.random() * .22);
      const distance = burst ? 20 + (order % 3) * 8 : 8 + Math.random() * 6;
      const dx = Math.cos(angle) * distance;
      const dy = burst ? Math.sin(angle) * distance - 25 : -distance;
      const rotate = -18 + Math.random() * 36;
      const color = outline ? '#d4ac59' : pale ? '#fff4e4' : '#95161b';
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.color = color;
      node.classList.toggle('is-outline', outline);
      node.animate(
        [
          { opacity: '0', transform: `translate3d(${x - 3}px, ${y - 2}px, 0) rotate(${rotate - 5}deg) scale(.55)` },
          { opacity: burst ? '.88' : '.72', offset: .16, transform: `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(1)` },
          { opacity: '0', transform: `translate3d(${x + dx}px, ${y + dy}px, 0) rotate(${rotate + 18}deg) scale(.12)` },
        ],
        { duration: burst ? 620 + (order % 3) * 55 : 430 + (poolIndex % 4) * 35, easing: 'cubic-bezier(.22,.72,.24,1)' },
      );
    };

    const paintTrail = () => {
      frame = 0;
      const event = pending;
      if (!event || blockedTarget(event.target)) return;
      const distance = Math.hypot(event.clientX - lastX, event.clientY - lastY);
      if (distance < 22) return;
      lastX = event.clientX;
      lastY = event.clientY;
      emit(event.clientX - 5, event.clientY + 3, false, 0, isDarkSurface(event.target));
    };

    const onMove = (event: PointerEvent) => {
      if (!finePointer.matches || event.pointerType !== 'mouse') return;
      pending = event;
      if (!frame) frame = window.requestAnimationFrame(paintTrail);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!event.isPrimary || blockedTarget(event.target)) return;
      const count = event.pointerType === 'mouse' ? 8 : 6;
      const darkSurface = isDarkSurface(event.target);
      for (let index = 0; index < count; index += 1) emit(event.clientX, event.clientY, true, index, darkSurface);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (frame) window.cancelAnimationFrame(frame);
      nodes.forEach((node) => node.getAnimations().forEach((animation) => animation.cancel()));
    };
  }, []);

  return (
    <div ref={layerRef} className="romantic-hearts" aria-hidden="true">
      {Array.from({ length: POOL_SIZE }, (_, index) => (
        <span className="heart-particle" key={index}>
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M12 21S3.6 16.2 3.6 9.5A4.5 4.5 0 0 1 12 7.2a4.5 4.5 0 0 1 8.4 2.3C20.4 16.2 12 21 12 21Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
