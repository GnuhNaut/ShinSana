import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { gallery } from '../config/wedding';
import { useModalDialog } from '../hooks/useModalDialog';
import { usePointerSurface } from '../hooks/usePointerSurface';

type TransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  axis: 'x' | 'y' | null;
  dragged: boolean;
};

const wrap = (value: number) => (value + gallery.length) % gallery.length;

export function Gallery() {
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = usePointerSurface<HTMLDivElement>();
  const activeButton = useRef<HTMLButtonElement>(null);
  const drag = useRef<DragState | null>(null);
  const dragFrame = useRef(0);
  const pendingX = useRef(0);
  const suppressClick = useRef(false);

  const move = useCallback((direction: number) => {
    setIndex((current) => wrap(current + direction));
  }, []);
  const closeViewer = useCallback(() => setViewer(false), []);
  const viewerRef = useModalDialog<HTMLDivElement>(viewer, closeViewer, activeButton);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !('IntersectionObserver' in window)) {
      setReady(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (dragFrame.current) window.cancelAnimationFrame(dragFrame.current);
  }, []);

  const paintDrag = () => {
    dragFrame.current = 0;
    const stage = stageRef.current;
    if (!stage) return;
    const width = Math.max(stage.clientWidth, 1);
    const clamped = Math.max(-width * 0.55, Math.min(width * 0.55, pendingX.current));
    stage.style.setProperty('--drag-px', `${clamped}px`);
    stage.style.setProperty('--drag-progress', `${clamped / width}`);
  };

  const resetDrag = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.classList.remove('is-dragging');
    stage.classList.add('is-snapping');
    stage.style.setProperty('--drag-px', '0px');
    stage.style.setProperty('--drag-progress', '0');
    window.setTimeout(() => stage.classList.remove('is-snapping'), 460);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      axis: null,
      dragged: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.axis && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      current.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
      if (current.axis === 'x') {
        event.currentTarget.classList.add('is-dragging');
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (current.axis !== 'x') return;
    event.preventDefault();
    current.lastX = event.clientX;
    current.dragged = Math.abs(dx) > 12;
    pendingX.current = dx;
    if (!dragFrame.current) dragFrame.current = window.requestAnimationFrame(paintDrag);
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = current.lastX - current.startX;
    const threshold = Math.max(48, event.currentTarget.clientWidth * 0.08);
    suppressClick.current = current.dragged;
    if (current.dragged) window.setTimeout(() => { suppressClick.current = false; }, 450);
    drag.current = null;
    if (dragFrame.current) {
      window.cancelAnimationFrame(dragFrame.current);
      dragFrame.current = 0;
    }
    resetDrag();
    if (Math.abs(dx) >= threshold) move(dx < 0 ? 1 : -1);
  };

  const openViewer = () => {
    const update = () => setViewer(true);
    const transition = (document as TransitionDocument).startViewTransition;
    if (transition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      transition.call(document, update);
    } else {
      update();
    }
  };

  const onGalleryKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest('.viewer')) return;
    if (target.matches('input, textarea, select')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      move(1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      move(-1);
    }
  };

  const visible = [-3, -2, -1, 0, 1, 2, 3].map((offset) => {
    const itemIndex = wrap(index + offset);
    return { offset, itemIndex, item: gallery[itemIndex] };
  });

  return (
    <section
      className="scene gallery-scene"
      ref={sectionRef}
      aria-labelledby="gallery-title"
      onKeyDown={onGalleryKeyDown}
    >
      <div className="gallery-head">
        <div>
          <span className="scene-kicker">PHOTO</span>
          <h2 id="gallery-title">Những khoảnh khắc<br /><em>ở lại.</em></h2>
        </div>
        <div className="gallery-counter" aria-live="polite">
          <strong>{String(index + 1).padStart(2, '0')}</strong>
          <span>/ {String(gallery.length).padStart(2, '0')}</span>
        </div>
      </div>

      <div
        className="gallery-stage"
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
      >
        <div className="gallery-stage__halo" aria-hidden="true" />
        {ready && visible.map(({ offset, itemIndex, item }) => (
          <button
            key={item.id}
            ref={offset === 0 ? activeButton : undefined}
            className={`gallery-slide gallery-slide--${offset < 0 ? 'prev' : offset > 0 ? 'next' : 'active'} gallery-slide--depth-${Math.min(Math.abs(offset), 3)}`}
            style={{ '--offset': offset } as CSSProperties}
            type="button"
            tabIndex={offset === 0 ? 0 : -1}
            aria-label={offset === 0 ? `Mở ảnh ${itemIndex + 1} toàn màn hình` : `Chuyển đến ảnh ${itemIndex + 1}`}
            aria-current={offset === 0 ? 'true' : undefined}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              if (offset === 0) openViewer();
              else move(offset > 0 ? 1 : -1);
            }}
          >
            <span className="gallery-slide__frame">
              <img
                src={item.src}
                alt={offset === 0 ? item.alt : ''}
                loading={Math.abs(offset) <= 1 ? 'eager' : 'lazy'}
                draggable={false}
              />
              <span className="gallery-slide__shine" aria-hidden="true" />
              {offset === 0 && <span className="gallery-slide__action">XEM ẢNH <i aria-hidden="true">↗</i></span>}
            </span>
          </button>
        ))}
      </div>

      <div className="gallery-footer">
        <div className="gallery-progress" aria-hidden="true">
          <i style={{ width: `${((index + 1) / gallery.length) * 100}%` }} />
        </div>
        <div className="gallery-nav">
          <button type="button" onClick={() => move(-1)} aria-label="Ảnh trước">←</button>
          <button type="button" onClick={() => move(1)} aria-label="Ảnh tiếp">→</button>
        </div>
      </div>

      {viewer && createPortal(
        <div
          ref={viewerRef}
          className="viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`Ảnh ${index + 1} trên ${gallery.length}`}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight') { event.preventDefault(); event.stopPropagation(); move(1); }
            if (event.key === 'ArrowLeft') { event.preventDefault(); event.stopPropagation(); move(-1); }
          }}
        >
          <div className="viewer__bar">
            <span>PHOTO · {String(index + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}</span>
            <button className="seal-button viewer__close" type="button" onClick={closeViewer} aria-label="Đóng ảnh toàn màn hình" data-autofocus>×</button>
          </div>
          <button className="viewer__nav viewer__nav--prev" type="button" onClick={() => move(-1)} aria-label="Ảnh trước">←</button>
          <figure>
            <img src={gallery[index].src} alt={gallery[index].alt} />
            <figcaption>{gallery[index].alt}</figcaption>
          </figure>
          <button className="viewer__nav viewer__nav--next" type="button" onClick={() => move(1)} aria-label="Ảnh tiếp">→</button>
        </div>,
        document.body,
      )}
    </section>
  );
}
