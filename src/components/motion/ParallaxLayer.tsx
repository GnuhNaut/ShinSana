import { useEffect, useRef, type ReactNode } from 'react'

interface ParallaxLayerProps {
  children: ReactNode
  className?: string
  /** Fraction of the viewport height, clamped to a restrained 1–4%. */
  strength?: number
}

/** Lightweight intersecting-only parallax; no React updates occur while scrolling. */
export function ParallaxLayer({ children, className = '', strength = 0.025 }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!element || reducedMotion || !('IntersectionObserver' in window)) return

    const safeStrength = Math.min(.04, Math.max(.01, strength))
    let intersecting = false
    let frame = 0

    const update = () => {
      frame = 0
      if (!intersecting) return
      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const progress = (viewportHeight / 2 - (rect.top + rect.height / 2)) / viewportHeight
      const mobileFactor = window.matchMedia('(max-width: 44.99rem)').matches ? .65 : 1
      const offset = Math.max(-1, Math.min(1, progress)) * viewportHeight * safeStrength * mobileFactor
      element.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`)
    }

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const observer = new IntersectionObserver(([entry]) => {
      intersecting = Boolean(entry?.isIntersecting)
      if (intersecting) requestUpdate()
    })

    observer.observe(element)
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [strength])

  return <div className={`parallax-layer ${className}`} ref={ref}><div className="parallax-layer__content">{children}</div></div>
}
