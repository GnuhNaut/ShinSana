import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { ArrowLeft, ArrowRight, Expand } from 'lucide-react'
import { GalleryLightbox } from './GalleryLightbox'
import { WeddingImage } from '../ui/WeddingImage'
import type { GalleryChapter, GalleryImage } from '../../types/wedding'

interface GalleryCoverflowProps {
  images: GalleryImage[]
  chapters: GalleryChapter[]
}

interface VisibleSlide {
  image: GalleryImage
  index: number
  offset: number
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  lastX: number
  lastTime: number
  previousX: number
  previousTime: number
  axis: 'pending' | 'horizontal'
}

const WINDOW_OFFSETS = [0, -1, 1, -2, 2, -3, 3]
const AXIS_LOCK_DISTANCE = 8

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown
}

function modulo(value: number, length: number) {
  return ((value % length) + length) % length
}

function visibleWindow(images: GalleryImage[], activeIndex: number): VisibleSlide[] {
  const seen = new Set<number>()

  return WINDOW_OFFSETS.flatMap((offset) => {
    const index = modulo(activeIndex + offset, images.length)
    if (seen.has(index)) return []
    seen.add(index)
    return [{ image: images[index], index, offset }]
  })
}

function samePointer(drag: DragState, pointerId: number) {
  return !Number.isFinite(drag.pointerId) || !Number.isFinite(pointerId) || drag.pointerId === pointerId
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ))

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return reduced
}

function useGalleryReady(stageRef: RefObject<HTMLDivElement | null>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !('IntersectionObserver' in window)) {
      setReady(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      setReady(true)
      observer.disconnect()
    }, { rootMargin: '560px 0px' })

    observer.observe(stage)
    return () => observer.disconnect()
  }, [stageRef])

  return ready
}

/**
 * A deliberately small virtual window around the active photo. The full album
 * stays in config and in the lightbox, but the landing page never mounts it all.
 */
export function GalleryCoverflow({ images, chapters }: GalleryCoverflowProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const reducedMotion = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const galleryReady = useGalleryReady(stageRef)
  const dragRef = useRef<DragState | null>(null)
  const dragFrameRef = useRef<number | null>(null)
  const dragPositionRef = useRef(0)
  const suppressClickRef = useRef(false)
  const suppressClickTimerRef = useRef<number | null>(null)
  const focusActiveAfterKeyboardRef = useRef(false)

  const imageCount = images.length
  const safeActiveIndex = imageCount === 0 ? 0 : Math.min(activeIndex, imageCount - 1)
  const current = images[safeActiveIndex]
  const currentChapter = current ? chapters.find((chapter) => chapter.id === current.chapter) : undefined
  const slides = useMemo(
    () => imageCount === 0 ? [] : visibleWindow(images, safeActiveIndex),
    [images, imageCount, safeActiveIndex],
  )

  useEffect(() => {
    if (!galleryReady || imageCount < 2) return
    ;[-1, 1].forEach((offset) => {
      const image = images[modulo(safeActiveIndex + offset, imageCount)]
      const preload = new Image()
      if (image.srcSet) preload.srcset = image.srcSet
      if (image.sizes) preload.sizes = image.sizes
      preload.src = image.src
    })
  }, [galleryReady, imageCount, images, safeActiveIndex])

  useEffect(() => () => {
    if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current)
    if (suppressClickTimerRef.current !== null) window.clearTimeout(suppressClickTimerRef.current)
  }, [])

  const armClickGuard = useCallback(() => {
    suppressClickRef.current = true
    if (suppressClickTimerRef.current !== null) window.clearTimeout(suppressClickTimerRef.current)
    suppressClickTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = false
      suppressClickTimerRef.current = null
    // WebKit can dispatch the compatibility click noticeably later than
    // Chromium. A new pointer-down clears this guard immediately, so this
    // longer fallback never eats a deliberate follow-up tap.
    }, 700)
  }, [])

  const focusActiveSlide = useCallback(() => {
    stageRef.current?.querySelector<HTMLButtonElement>('.coverflow__slide.is-active > button')?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!focusActiveAfterKeyboardRef.current) return
    focusActiveAfterKeyboardRef.current = false
    focusActiveSlide()
  }, [focusActiveSlide, safeActiveIndex])

  const moveBy = useCallback((delta: number, restoreFocus = false) => {
    if (imageCount < 2) return
    const nextIndex = modulo(safeActiveIndex + delta, imageCount)
    if (restoreFocus) {
      if (nextIndex === safeActiveIndex) focusActiveSlide()
      else focusActiveAfterKeyboardRef.current = true
    }
    setActiveIndex(nextIndex)
  }, [focusActiveSlide, imageCount, safeActiveIndex])

  const writeDragPosition = useCallback((position: number, immediate = false) => {
    dragPositionRef.current = position
    const stage = stageRef.current
    if (!stage) return

    const commit = () => {
      dragFrameRef.current = null
      stage.style.setProperty('--coverflow-drag', `${dragPositionRef.current}px`)
    }

    if (immediate) {
      if (dragFrameRef.current !== null) window.cancelAnimationFrame(dragFrameRef.current)
      commit()
      return
    }

    if (dragFrameRef.current === null) dragFrameRef.current = window.requestAnimationFrame(commit)
  }, [])

  const resetDrag = useCallback(() => {
    dragRef.current = null
    stageRef.current?.classList.remove('is-dragging', 'is-pointer-down')
    writeDragPosition(0)
  }, [writeDragPosition])

  const commitDrag = useCallback(() => {
    const drag = dragRef.current
    if (!drag || drag.axis !== 'horizontal') {
      resetDrag()
      return
    }

    const distance = drag.lastX - drag.startX
    const elapsed = Math.max(1, drag.lastTime - drag.previousTime)
    const velocity = (drag.lastX - drag.previousX) / elapsed
    const threshold = Math.min(96, Math.max(54, (stageRef.current?.clientWidth ?? 360) * .16))
    const hasIntent = Math.abs(distance) > threshold || (!reducedMotion && Math.abs(velocity) > .48)

    if (hasIntent) {
      armClickGuard()
      moveBy(distance < 0 ? 1 : -1)
    }
    resetDrag()
  }, [armClickGuard, moveBy, reducedMotion, resetDrag])

  const finishPointer = useCallback((pointerId: number) => {
    const drag = dragRef.current
    if (!drag || !samePointer(drag, pointerId)) return
    stageRef.current?.classList.remove('is-pointer-down')
    commitDrag()
  }, [commitDrag])

  useEffect(() => {
    const finishPointerOutsideStage = () => {
      const drag = dragRef.current
      if (!drag) return
      stageRef.current?.classList.remove('is-pointer-down')
      commitDrag()
    }
    const cancelPointerOutsideStage = () => {
      const drag = dragRef.current
      if (!drag) return
      stageRef.current?.classList.remove('is-pointer-down')
      resetDrag()
    }

    window.addEventListener('pointerup', finishPointerOutsideStage)
    window.addEventListener('pointercancel', cancelPointerOutsideStage)
    window.addEventListener('mouseup', finishPointerOutsideStage)
    return () => {
      window.removeEventListener('pointerup', finishPointerOutsideStage)
      window.removeEventListener('pointercancel', cancelPointerOutsideStage)
      window.removeEventListener('mouseup', finishPointerOutsideStage)
    }
  }, [commitDrag, resetDrag])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current || (event.pointerType === 'mouse' && event.button !== 0)) return
    // A real new tap/click begins with pointerdown, whereas the synthetic
    // click generated by the completed drag does not. This lets a visitor
    // deliberately open the photo right after swiping without letting that
    // synthetic click open it by mistake.
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      if (suppressClickTimerRef.current !== null) window.clearTimeout(suppressClickTimerRef.current)
      suppressClickTimerRef.current = null
    }
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      previousX: event.clientX,
      previousTime: event.timeStamp,
      axis: 'pending',
    }
    stageRef.current?.classList.add('is-pointer-down')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || !samePointer(drag, event.pointerId)) return
    const distanceX = event.clientX - drag.startX
    const distanceY = event.clientY - drag.startY

    if (drag.axis === 'pending') {
      if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < AXIS_LOCK_DISTANCE) return
      if (Math.abs(distanceX) <= Math.abs(distanceY) * 1.2) {
        // Browsers may still issue a click after a vertical pan beginning on
        // the active photo. It is a scroll gesture, never a request to open
        // the lightbox.
        armClickGuard()
        resetDrag()
        return
      }
      drag.axis = 'horizontal'
      stageRef.current?.classList.remove('is-pointer-down')
      stageRef.current?.classList.add('is-dragging')
      // Pointer capture keeps a release outside the stage attached to this
      // gesture. The window handlers below remain the fallback for engines
      // that decline capture for a synthetic pointer.
      if (event.currentTarget.setPointerCapture) {
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // The global completion listeners safely finish the same gesture.
        }
      }
    }

    if (event.pointerType !== 'mouse') event.preventDefault()
    drag.previousX = drag.lastX
    drag.previousTime = drag.lastTime
    drag.lastX = event.clientX
    drag.lastTime = event.timeStamp
    writeDragPosition(Math.max(-136, Math.min(136, distanceX)))
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current && !samePointer(dragRef.current, event.pointerId)) return
    finishPointer(event.pointerId)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current && !samePointer(dragRef.current, event.pointerId)) return
    stageRef.current?.classList.remove('is-pointer-down')
    resetDrag()
  }

  const onLostPointerCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    // Some WebKit builds relinquish capture as a pointer leaves the stage
    // before they dispatch mouseup. At that point a horizontal drag still has
    // a complete, valid distance, so finish it rather than discarding it.
    finishPointer(event.pointerId)
  }

  const runViewTransition = useCallback((update: () => void) => {
    const startViewTransition = (document as ViewTransitionDocument).startViewTransition
    if (reducedMotion || !startViewTransition) {
      update()
      return
    }
    try {
      startViewTransition.call(document, update)
    } catch {
      update()
    }
  }, [reducedMotion])

  const openActive = useCallback(() => {
    if (imageCount > 0) runViewTransition(() => setLightboxIndex(safeActiveIndex))
  }, [imageCount, runViewTransition, safeActiveIndex])

  const selectSlide = (index: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      if (suppressClickTimerRef.current !== null) window.clearTimeout(suppressClickTimerRef.current)
      suppressClickTimerRef.current = null
      return
    }
    if (index === safeActiveIndex) {
      openActive()
      return
    }
    setActiveIndex(index)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      moveBy(-1, true)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      moveBy(1, true)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      if (safeActiveIndex === 0) focusActiveSlide()
      else {
        focusActiveAfterKeyboardRef.current = true
        setActiveIndex(0)
      }
    }
    if (event.key === 'End') {
      event.preventDefault()
      const lastIndex = Math.max(0, imageCount - 1)
      if (safeActiveIndex === lastIndex) focusActiveSlide()
      else {
        focusActiveAfterKeyboardRef.current = true
        setActiveIndex(lastIndex)
      }
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      openActive()
    }
  }

  const changeLightboxIndex = useCallback((index: number) => {
    setActiveIndex(index)
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => runViewTransition(() => setLightboxIndex(null)), [runViewTransition])
  const returnFocusTarget = useCallback(() => (
    stageRef.current?.querySelector<HTMLButtonElement>('.coverflow__slide.is-active > button') ?? null
  ), [])

  const chapterStops = useMemo(() => chapters.flatMap((chapter) => {
    const index = images.findIndex((image) => image.chapter === chapter.id)
    return index === -1 ? [] : [{ chapter, index }]
  }), [chapters, images])

  if (!current) return null

  const stageStyle = {
    '--gallery-progress': `${((safeActiveIndex + 1) / imageCount) * 100}%`,
    '--coverflow-drag': '0px',
  } as CSSProperties

  return (
    <>
      <div className={'coverflow' + (lightboxIndex !== null ? ' is-viewing' : '')} data-reduced-motion={reducedMotion ? 'true' : 'false'}>
        <div
          className="coverflow__stage"
          ref={stageRef}
          data-context-cursor="KÉO"
          role="region"
          aria-roledescription="carousel"
          aria-label="Bộ ảnh cưới, dùng phím mũi tên hoặc vuốt để xem ảnh"
          aria-describedby="gallery-status"
          tabIndex={0}
          style={stageStyle}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onLostPointerCapture={onLostPointerCapture}
        >
          <div className="coverflow__track">
            {slides.map(({ image, index, offset }) => {
              const active = offset === 0
              const slideStyle = { '--coverflow-offset': offset } as CSSProperties

              return (
                <figure
                  className={'coverflow__slide' + (active ? ' is-active' : '')}
                  data-image-id={image.id}
                  data-offset={offset}
                  key={image.id}
                  style={slideStyle}
                >
                  <button
                    type="button"
                    aria-current={active ? 'true' : undefined}
                    aria-label={(active ? 'Mở ảnh ' : 'Chọn ảnh ') + (index + 1) + ': ' + image.caption}
                    data-context-cursor={active ? 'XEM' : undefined}
                    tabIndex={active ? 0 : -1}
                    onClick={() => selectSlide(index)}
                  >
                    <span className="coverflow__mat">
                      {galleryReady && Math.abs(offset) <= 2 ? (
                        <WeddingImage
                          {...image}
                          eager={active}
                          fetchPriority={Math.abs(offset) === 2 ? 'low' : undefined}
                          sizes={active ? '(max-width: 43.99rem) 78vw, min(59vw, 52rem)' : '(max-width: 43.99rem) 34vw, 20vw'}
                          wrapperClassName="coverflow__image"
                        />
                      ) : (
                        <span className="coverflow__image coverflow__image--pending" aria-hidden="true" />
                      )}
                    </span>
                    {active && <span className="coverflow__open"><Expand aria-hidden="true" /> <span>Mở toàn ảnh</span></span>}
                  </button>
                </figure>
              )
            })}
          </div>
          <span className="coverflow__shine" aria-hidden="true" />
        </div>

        {chapterStops.length > 1 && (
          <nav className="coverflow__chapter-nav" aria-label="Chuyển chương ảnh">
            {chapterStops.map(({ chapter, index }, chapterIndex) => (
              <button
                type="button"
                aria-current={currentChapter?.id === chapter.id ? 'true' : undefined}
                aria-label={`${chapter.eyebrow}: ${chapter.title}${chapter.lead ? '. ' + chapter.lead : ''}`}
                key={chapter.id}
                onClick={() => setActiveIndex(index)}
              >
                <span aria-hidden="true">{String(chapterIndex + 1).padStart(2, '0')}</span>
                <strong>{chapter.title}</strong>
              </button>
            ))}
          </nav>
        )}

        <div className="coverflow__footer">
          <button className="coverflow__arrow" type="button" onClick={() => moveBy(-1)} disabled={imageCount < 2} aria-label="Ảnh trước">
            <ArrowLeft aria-hidden="true" />
          </button>
          <div className="coverflow__caption" id="gallery-status">
            <p className="coverflow__chapter">{currentChapter ? currentChapter.eyebrow + ' · ' + currentChapter.title : 'Khoảnh khắc'}</p>
            <p className="coverflow__image-caption">{current.caption}</p>
            {currentChapter?.lead && <span className="sr-only">{currentChapter.lead}</span>}
            <span aria-live="polite">Ảnh {safeActiveIndex + 1} trên {imageCount}</span>
          </div>
          <button className="coverflow__arrow" type="button" onClick={() => moveBy(1)} disabled={imageCount < 2} aria-label="Ảnh tiếp theo">
            <ArrowRight aria-hidden="true" />
          </button>
        </div>
        <p className="coverflow__hint">{reducedMotion ? 'Dùng phím mũi tên hoặc các nút để xem ảnh.' : 'Vuốt ngang hoặc dùng phím mũi tên để xem ảnh.'}</p>
      </div>

      <GalleryLightbox
        images={images}
        activeIndex={lightboxIndex}
        onChange={changeLightboxIndex}
        onClose={closeLightbox}
        returnFocusTarget={returnFocusTarget}
      />
    </>
  )
}
