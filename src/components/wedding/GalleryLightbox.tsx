import { useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { WeddingImage } from '../ui/WeddingImage'
import type { GalleryImage } from '../../types/wedding'

interface GalleryLightboxProps {
  images: GalleryImage[]
  activeIndex: number | null
  onChange: (index: number) => void
  onClose: () => void
}

export function GalleryLightbox({ images, activeIndex, onChange, onClose }: GalleryLightboxProps) {
  const touchStart = useRef<number | null>(null)
  const open = activeIndex !== null
  const current = activeIndex === null ? null : images[activeIndex]

  const previous = useCallback(() => {
    if (activeIndex === null) return
    onChange((activeIndex - 1 + images.length) % images.length)
  }, [activeIndex, images.length, onChange])

  const next = useCallback(() => {
    if (activeIndex === null) return
    onChange((activeIndex + 1) % images.length)
  }, [activeIndex, images.length, onChange])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') previous()
      if (event.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [next, open, previous])

  if (!current || activeIndex === null) return null

  return (
    <Modal open={open} onClose={onClose} title="thư viện ảnh" className="lightbox" showClose>
      <div
        className="lightbox__stage"
        onTouchStart={(event) => { touchStart.current = event.changedTouches[0]?.clientX ?? null }}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return
          const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current
          if (Math.abs(delta) > 48) {
            if (delta > 0) previous()
            else next()
          }
          touchStart.current = null
        }}
      >
        <WeddingImage key={current.id} {...current} eager wrapperClassName="lightbox__image" />
      </div>
      <div className="lightbox__footer">
        <button type="button" className="icon-button" onClick={previous} aria-label="Ảnh trước"><ArrowLeft aria-hidden="true" /></button>
        <div>
          <p>{current.caption}</p>
          <span aria-live="polite">Ảnh {activeIndex + 1} trên {images.length}</span>
        </div>
        <button type="button" className="icon-button" onClick={next} aria-label="Ảnh tiếp theo"><ArrowRight aria-hidden="true" /></button>
      </div>
    </Modal>
  )
}
