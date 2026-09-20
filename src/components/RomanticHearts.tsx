import { useEffect, useRef } from 'react';

const CURSOR_CLASS = 'heart-cursor-enabled';
const GHOST_POOL_SIZE = 14;
const PRIMARY_POOL_SIZE = 4;
const SECONDARY_POOL_SIZE = 24;
const HEART_PATH = 'M12 21.25C10.9 20.36 4 15.63 4 9.67A4.67 4.67 0 0 1 12 6.4a4.67 4.67 0 0 1 8 3.27c0 5.96-6.9 10.69-8 11.58Z';

const SUPPRESSED_SELECTOR = [
  'input',
  'textarea',
  'select',
  'option',
  '[contenteditable]:not([contenteditable="false"])',
  'iframe',
  'dialog',
  '[role="dialog"]',
  '[data-heart-suppress]',
  '[data-no-hearts]',
  '[data-map]',
  '[data-qr]',
  '[data-lightbox]',
  '.venue-dialog',
  '.venue-dialog-backdrop',
  '.venue-dialog__map-wrap',
  '.gift-insert__qr',
  '.qr-empty',
  '.viewer',
  '.lightbox',
].join(',');

const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'summary',
  '[role="button"]',
  '[data-heart-interactive]',
  '.gallery-slide',
  '.venue-panel',
].join(',');

const BUTTON_LIKE_SELECTOR = 'button, [role="button"], a, summary';
const GHOST_COLORS = ['#FF6FA7', '#FF88B4', '#FFA5C6', '#FFD1E0'] as const;
const RAIN_COLORS = ['#FF6FA7', '#FF88B4', '#FFA5C6', '#FFC0D4', '#FFD1E0'] as const;

function elementFromTarget(target: EventTarget | null) {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

function hasTextSelection() {
  const selection = window.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.toString().trim());
}

function isSuppressed(target: EventTarget | null) {
  const element = elementFromTarget(target);
  return !element || Boolean(element.closest(SUPPRESSED_SELECTOR)) || hasTextSelection();
}

function isInteractive(target: EventTarget | null) {
  return Boolean(elementFromTarget(target)?.closest(INTERACTIVE_SELECTOR));
}

function isButtonLike(target: EventTarget | null) {
  return Boolean(elementFromTarget(target)?.closest(BUTTON_LIKE_SELECTOR));
}

function HeartGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d={HEART_PATH} fill="currentColor" />
    </svg>
  );
}

function createRainHeart(index: number, count: number) {
  const drop = document.createElement('span');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const smallWeight = Math.random();
  const size = smallWeight < 0.7
    ? 7 + Math.round(Math.random() * 4)
    : smallWeight < 0.94
      ? 12 + Math.round(Math.random() * 4)
      : 17 + Math.round(Math.random() * 5);
  const isLongDrop = index % 7 === 0;
  const delay = Math.round(Math.random() * (isLongDrop ? 160 : 330));
  const duration = Math.round(isLongDrop ? 2350 + Math.random() * 350 : 1700 + Math.random() * 550);
  const x = ((index + 0.18 + Math.random() * 0.64) / count) * 100;
  const drift = Math.round(-42 + Math.random() * 84);
  const rotation = Math.round(-150 + Math.random() * 300);
  const color = index % 17 === 0
    ? '#F1B7C9'
    : RAIN_COLORS[Math.floor(Math.random() * RAIN_COLORS.length)];

  drop.className = 'heart-rain__heart';
  drop.dataset.heartRainDrop = String(index);
  drop.style.setProperty('--heart-x', `${x.toFixed(2)}vw`);
  drop.style.setProperty('--heart-size', `${size}px`);
  drop.style.setProperty('--heart-delay', `${delay}ms`);
  drop.style.setProperty('--heart-duration', `${duration}ms`);
  drop.style.setProperty('--heart-drift', `${drift}px`);
  drop.style.setProperty('--heart-rotation', `${rotation}deg`);
  drop.style.setProperty('--heart-opacity', `${(0.42 + Math.random() * 0.4).toFixed(2)}`);
  drop.style.setProperty('--heart-scale', `${(0.84 + Math.random() * 0.28).toFixed(2)}`);
  drop.style.setProperty('--heart-color', color);
  drop.style.animationDelay = `${delay}ms`;
  drop.style.animationDuration = `${duration}ms`;
  drop.style.color = color;

  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');
  path.setAttribute('d', HEART_PATH);
  path.setAttribute('fill', 'currentColor');
  svg.append(path);
  drop.append(svg);
  return drop;
}

export function RomanticHearts({ celebrating }: { celebrating: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const rainLayerRef = useRef<HTMLDivElement | null>(null);
  const previousCelebratingRef = useRef(false);
  const rainTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const cursor = cursorRef.current;
    if (!root || !cursor) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const ghostNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-heart-ghost]'));
    const primaryNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-heart-click="primary"]'));
    const secondaryNodes = Array.from(root.querySelectorAll<HTMLElement>('[data-heart-click="secondary"]'));
    const animationGeneration = new WeakMap<HTMLElement, number>();
    let ghostIndex = 0;
    let primaryIndex = 0;
    let secondaryIndex = 0;
    let burstSequence = 0;
    let frame = 0;
    let pendingMove: PointerEvent | null = null;
    let lastGhostX = Number.NaN;
    let lastGhostY = Number.NaN;
    let lastGhostAt = 0;
    let documentCursorEnabled = false;
    let pointerDown: { id: number; x: number; y: number } | null = null;

    const canUseCursor = () => finePointer.matches && !reducedMotion.matches;

    const setDocumentCursor = (enabled: boolean) => {
      if (documentCursorEnabled === enabled) return;
      documentCursorEnabled = enabled;
      document.documentElement.classList.toggle(CURSOR_CLASS, enabled);
      root.dataset.cursorEnabled = String(enabled);
    };

    const hideCursor = (restoreNative = true) => {
      cursor.dataset.visible = 'false';
      cursor.style.opacity = '0';
      if (restoreNative) setDocumentCursor(false);
      lastGhostX = Number.NaN;
      lastGhostY = Number.NaN;
    };

    const animateNode = (
      node: HTMLElement,
      keyframes: Keyframe[],
      options: KeyframeAnimationOptions,
    ) => {
      const generation = (animationGeneration.get(node) ?? 0) + 1;
      animationGeneration.set(node, generation);
      node.getAnimations().forEach((animation) => animation.cancel());
      node.dataset.active = 'true';
      const animation = node.animate(keyframes, options);
      const markInactive = () => {
        if (animationGeneration.get(node) === generation) node.dataset.active = 'false';
      };
      animation.onfinish = markInactive;
      animation.oncancel = markInactive;
    };

    const emitGhost = (x: number, y: number, dx: number, dy: number) => {
      // Five visible echoes read as an afterimage; more begins to look like confetti.
      if (ghostNodes.filter((node) => node.dataset.active === 'true').length >= 5) return;
      const node = ghostNodes[ghostIndex++ % ghostNodes.length];
      const order = ghostIndex;
      const length = Math.max(1, Math.hypot(dx, dy));
      const backwardX = -(dx / length) * 8;
      const backwardY = -(dy / length) * 5 - 3;
      const size = 8 + (order % 4);
      const duration = 390 + (order % 5) * 32;
      const rotation = -12 + (order % 7) * 4;
      const startX = x - (dx / length) * 7 - size / 2;
      const startY = y - (dy / length) * 7 - size / 2;

      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.color = GHOST_COLORS[order % GHOST_COLORS.length];
      node.style.setProperty('--heart-size', `${size}px`);
      node.style.setProperty('--heart-color', GHOST_COLORS[order % GHOST_COLORS.length]);
      node.style.setProperty('--heart-duration', `${duration}ms`);
      animateNode(
        node,
        [
          {
            opacity: 0.7,
            filter: 'blur(0px)',
            transform: `translate3d(${startX}px, ${startY}px, 0) rotate(${rotation}deg) scale(.96)`,
          },
          {
            opacity: 0.28,
            filter: 'blur(1px)',
            offset: 0.58,
            transform: `translate3d(${startX + backwardX * 0.65}px, ${startY + backwardY * 0.65}px, 0) rotate(${rotation - 4}deg) scale(.64)`,
          },
          {
            opacity: 0,
            filter: 'blur(2px)',
            transform: `translate3d(${startX + backwardX}px, ${startY + backwardY}px, 0) rotate(${rotation - 7}deg) scale(.32)`,
          },
        ],
        { duration, easing: 'linear' },
      );
    };

    const emitPrimary = (x: number, y: number, compact: boolean) => {
      const node = primaryNodes[primaryIndex++ % primaryNodes.length];
      const size = compact ? 18 : 30;
      const duration = compact ? 430 : 560;
      const left = x - size / 2;
      const top = y - size / 2;

      node.dataset.compact = String(compact);
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.color = '#FF6FA7';
      node.style.setProperty('--heart-size', `${size}px`);
      node.style.setProperty('--heart-color', '#FF6FA7');
      node.style.setProperty('--heart-duration', `${duration}ms`);
      animateNode(
        node,
        [
          { opacity: 0, transform: `translate3d(${left}px, ${top}px, 0) scale(.62)` },
          { opacity: 0.94, offset: 0.15, transform: `translate3d(${left}px, ${top}px, 0) scale(.84)` },
          { opacity: 1, offset: 0.42, transform: `translate3d(${left}px, ${top}px, 0) scale(1.32)` },
          { opacity: 0.76, offset: 0.64, transform: `translate3d(${left}px, ${top}px, 0) scale(.98)` },
          { opacity: 0, transform: `translate3d(${left}px, ${top - 4}px, 0) scale(.18)` },
        ],
        { duration, easing: 'linear' },
      );
    };

    const emitSecondary = (x: number, y: number, order: number, count: number, compact: boolean) => {
      const node = secondaryNodes[secondaryIndex++ % secondaryNodes.length];
      const size = compact ? 5 + (order % 2) : 6 + (order % 4);
      const angle = -Math.PI * 0.86 + (Math.PI * 0.72 * (order + 0.45)) / Math.max(1, count);
      const distance = (compact ? 13 : 20) + (order % 3) * (compact ? 3 : 5);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - (compact ? 7 : 11);
      const left = x - size / 2;
      const top = y - size / 2;
      const duration = (compact ? 500 : 560) + (order % 4) * 42;
      const color = GHOST_COLORS[(order + burstSequence) % GHOST_COLORS.length];

      node.dataset.compact = String(compact);
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.color = color;
      node.style.setProperty('--heart-size', `${size}px`);
      node.style.setProperty('--heart-color', color);
      node.style.setProperty('--heart-duration', `${duration}ms`);
      animateNode(
        node,
        [
          {
            opacity: 0,
            transform: `translate3d(${left}px, ${top}px, 0) rotate(${-8 + order * 4}deg) scale(.45)`,
          },
          {
            opacity: 0.76,
            offset: 0.18,
            transform: `translate3d(${left + dx * 0.18}px, ${top + dy * 0.18}px, 0) rotate(${order * 5}deg) scale(1)`,
          },
          {
            opacity: 0,
            transform: `translate3d(${left + dx}px, ${top + dy}px, 0) rotate(${12 + order * 9}deg) scale(.24)`,
          },
        ],
        { duration, easing: 'cubic-bezier(.22,.72,.3,1)' },
      );
    };

    const paintPointer = (timestamp: number) => {
      frame = 0;
      const event = pendingMove;
      if (!event || event.pointerType !== 'mouse' || !canUseCursor() || isSuppressed(event.target)) {
        hideCursor();
        return;
      }

      setDocumentCursor(true);
      cursor.dataset.visible = 'true';
      cursor.dataset.interactive = String(isInteractive(event.target));
      cursor.style.opacity = '1';
      cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
      cursor.style.transform = `translate3d(${event.clientX - 1.5}px, ${event.clientY - 1.5}px, 0)`;

      if (!Number.isFinite(lastGhostX) || !Number.isFinite(lastGhostY)) {
        lastGhostX = event.clientX;
        lastGhostY = event.clientY;
        lastGhostAt = timestamp;
        return;
      }

      const dx = event.clientX - lastGhostX;
      const dy = event.clientY - lastGhostY;
      const threshold = 12 + (ghostIndex % 4) * 2;
      if (Math.hypot(dx, dy) < threshold || timestamp - lastGhostAt < 68) return;
      emitGhost(event.clientX, event.clientY, dx, dy);
      lastGhostX = event.clientX;
      lastGhostY = event.clientY;
      lastGhostAt = timestamp;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      pendingMove = event;
      if (!frame) frame = window.requestAnimationFrame(paintPointer);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      if (!canUseCursor() || isSuppressed(event.target)) {
        pendingMove = null;
        hideCursor();
        return;
      }
      pendingMove = event;
      if (!frame) frame = window.requestAnimationFrame(paintPointer);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary) return;
      pointerDown = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!event.isPrimary || reducedMotion.matches || isSuppressed(event.target)) {
        pointerDown = null;
        if (event.pointerType === 'mouse' && isSuppressed(event.target)) hideCursor();
        return;
      }
      if (
        !pointerDown
        || pointerDown.id !== event.pointerId
        || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 12
      ) {
        pointerDown = null;
        return;
      }

      pointerDown = null;
      const touch = event.pointerType !== 'mouse';
      const compact = isButtonLike(event.target);
      const secondaryCount = touch ? 2 + (burstSequence % 3) : 3 + (burstSequence % 4);
      burstSequence += 1;
      emitPrimary(event.clientX, event.clientY, compact);
      for (let index = 0; index < secondaryCount; index += 1) {
        emitSecondary(event.clientX, event.clientY, index, secondaryCount, compact);
      }
    };

    const onPointerCancel = () => {
      pointerDown = null;
    };

    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        pendingMove = null;
        hideCursor();
      }
    };

    const onWindowBlur = () => {
      pendingMove = null;
      hideCursor();
    };

    const onCapabilityChange = () => {
      root.dataset.finePointer = String(finePointer.matches);
      root.dataset.reducedMotion = String(reducedMotion.matches);
      if (reducedMotion.matches) {
        [...ghostNodes, ...primaryNodes, ...secondaryNodes].forEach((node) => {
          animationGeneration.set(node, (animationGeneration.get(node) ?? 0) + 1);
          node.getAnimations().forEach((animation) => animation.cancel());
          node.dataset.active = 'false';
        });
      }
      if (canUseCursor()) setDocumentCursor(true);
      else hideCursor();
    };

    root.dataset.finePointer = String(finePointer.matches);
    root.dataset.reducedMotion = String(reducedMotion.matches);
    setDocumentCursor(canUseCursor());
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerCancel, { passive: true });
    window.addEventListener('pointerout', onPointerOut, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    finePointer.addEventListener('change', onCapabilityChange);
    reducedMotion.addEventListener('change', onCapabilityChange);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerover', onPointerOver);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('blur', onWindowBlur);
      finePointer.removeEventListener('change', onCapabilityChange);
      reducedMotion.removeEventListener('change', onCapabilityChange);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove(CURSOR_CLASS);
      [...ghostNodes, ...primaryNodes, ...secondaryNodes].forEach((node) => {
        animationGeneration.set(node, (animationGeneration.get(node) ?? 0) + 1);
        node.getAnimations().forEach((animation) => animation.cancel());
        node.dataset.active = 'false';
      });
    };
  }, []);

  useEffect(() => {
    const crossedIntoCelebration = celebrating && !previousCelebratingRef.current;
    previousCelebratingRef.current = celebrating;
    if (!crossedIntoCelebration) return;

    const host = rootRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!host || reducedMotion.matches) return;

    if (rainTimerRef.current !== null) window.clearTimeout(rainTimerRef.current);
    rainLayerRef.current?.remove();
    const layer = document.createElement('div');
    layer.className = 'heart-rain';
    layer.dataset.heartRain = '';
    layer.dataset.active = 'true';
    layer.setAttribute('aria-hidden', 'true');
    const mobile = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
    const count = mobile ? 36 : 56;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < count; index += 1) {
      fragment.append(createRainHeart(index, count));
    }

    layer.append(fragment);
    layer.dataset.count = String(count);
    host.append(layer);
    rainLayerRef.current = layer;
    rainTimerRef.current = window.setTimeout(() => {
      layer.remove();
      if (rainLayerRef.current === layer) rainLayerRef.current = null;
      rainTimerRef.current = null;
    }, 3050);
  }, [celebrating]);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const clearRainForReducedMotion = () => {
      if (!reducedMotion.matches) return;
      if (rainTimerRef.current !== null) {
        window.clearTimeout(rainTimerRef.current);
      }
      rainTimerRef.current = null;
      rainLayerRef.current?.remove();
      rainLayerRef.current = null;
    };

    reducedMotion.addEventListener('change', clearRainForReducedMotion);
    return () => {
      reducedMotion.removeEventListener('change', clearRainForReducedMotion);
      if (rainTimerRef.current !== null) window.clearTimeout(rainTimerRef.current);
      rainTimerRef.current = null;
      rainLayerRef.current?.remove();
      rainLayerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="romantic-hearts heart-effects"
      data-heart-effects=""
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      <div
        ref={cursorRef}
        className="heart-cursor"
        data-heart-cursor=""
        data-visible="false"
        data-interactive="false"
        style={{ height: 34, opacity: 0, pointerEvents: 'none', width: 34 }}
      >
        <svg className="heart-cursor__art" viewBox="0 0 34 34" focusable="false" aria-hidden="true">
          <defs>
            <linearGradient id="heart-cursor-rose" x1="4" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFA5C6" />
              <stop offset=".52" stopColor="#FF6FA7" />
              <stop offset="1" stopColor="#E34F87" />
            </linearGradient>
          </defs>
          <path
            className="heart-cursor__arrow"
            d="M1.5 1.5 12.25 30.2l4.62-10.08 8.2 8.2 3.54-3.54-8.2-8.2 10.08-4.62L1.5 1.5Z"
            fill="url(#heart-cursor-rose)"
            stroke="#C94178"
            strokeLinejoin="round"
            strokeWidth="1.15"
          />
          <path
            className="heart-cursor__heart"
            d="M11.65 23.1c-1.8-1.35-4.45-3.38-4.45-5.8a2.6 2.6 0 0 1 4.45-1.83 2.6 2.6 0 0 1 4.45 1.83c0 2.42-2.65 4.45-4.45 5.8Z"
            fill="#FFD1E0"
            stroke="#C94178"
            strokeWidth=".7"
          />
          <path className="heart-cursor__highlight" d="m4.2 4.35 7.15 18.95" fill="none" stroke="#FFF4E4" strokeLinecap="round" strokeWidth=".85" opacity=".7" />
        </svg>
      </div>

      <div className="heart-trail" data-heart-trail="" aria-hidden="true">
        {Array.from({ length: GHOST_POOL_SIZE }, (_, index) => (
          <span className="heart-ghost" data-heart-ghost={index} data-active="false" key={index}>
            <HeartGlyph />
          </span>
        ))}
      </div>

      <div className="heart-click-layer" data-heart-click-layer="" aria-hidden="true">
        {Array.from({ length: PRIMARY_POOL_SIZE }, (_, index) => (
          <span className="heart-click heart-click--primary" data-heart-click="primary" data-active="false" key={`primary-${index}`}>
            <HeartGlyph />
          </span>
        ))}
        {Array.from({ length: SECONDARY_POOL_SIZE }, (_, index) => (
          <span className="heart-click heart-click--secondary" data-heart-click="secondary" data-active="false" key={`secondary-${index}`}>
            <HeartGlyph />
          </span>
        ))}
      </div>

    </div>
  );
}
