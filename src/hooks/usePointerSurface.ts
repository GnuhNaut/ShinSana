import { useEffect, useRef, type RefObject } from 'react';

export function usePointerSurface<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!element || !finePointer.matches) return;

    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    const paint = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const x = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      element.style.setProperty('--pointer-x', `${(x * 100).toFixed(2)}%`);
      element.style.setProperty('--pointer-y', `${(y * 100).toFixed(2)}%`);
      element.style.setProperty('--pointer-nx', (x * 2 - 1).toFixed(3));
      element.style.setProperty('--pointer-ny', (y * 2 - 1).toFixed(3));
    };

    const onMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    const onLeave = () => {
      element.style.setProperty('--pointer-x', '50%');
      element.style.setProperty('--pointer-y', '50%');
      element.style.setProperty('--pointer-nx', '0');
      element.style.setProperty('--pointer-ny', '0');
    };

    element.addEventListener('pointermove', onMove, { passive: true });
    element.addEventListener('pointerleave', onLeave, { passive: true });
    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}
