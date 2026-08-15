import { useEffect, useRef, useState, type RefObject } from 'react'

export interface RevealObserverOptions {
  disabled?: boolean
  once?: boolean
  rootMargin?: string
  threshold?: number
}

export function useRevealVisibility<T extends HTMLElement>({
  disabled = false,
  once = true,
  rootMargin = '0px 0px -8% 0px',
  threshold = 0.08,
}: RevealObserverOptions = {}): { ref: RefObject<T | null>; visible: boolean } {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(disabled)

  useEffect(() => {
    const element = ref.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (disabled || reduceMotion || !element || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return
      setVisible(entry.isIntersecting)
      if (entry.isIntersecting && once) observer.disconnect()
    }, { rootMargin, threshold })

    observer.observe(element)
    return () => observer.disconnect()
  }, [disabled, once, rootMargin, threshold])

  return { ref, visible }
}
