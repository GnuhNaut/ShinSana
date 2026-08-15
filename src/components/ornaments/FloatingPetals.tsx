import { useEffect, useRef, useState, type CSSProperties } from 'react'

interface FloatingPetalsProps {
  className?: string
  /** Clamped to 6–18; small screens display at most 10. */
  count?: number
  tone?: 'red' | 'champagne' | 'mixed'
}

type PetalStyle = CSSProperties & {
  '--petal-delay': string
  '--petal-drift': string
  '--petal-duration': string
  '--petal-opacity': string
  '--petal-rotate': string
  '--petal-scale': string
  '--petal-x': string
}

function petalStyle(index: number): PetalStyle {
  return {
    '--petal-delay': `${-((index * 2.17) % 13).toFixed(2)}s`,
    '--petal-drift': `${index % 2 === 0 ? '' : '-'}${18 + (index * 13) % 54}px`,
    '--petal-duration': `${10 + (index * 7) % 9}s`,
    '--petal-opacity': `${(0.24 + ((index * 11) % 31) / 100).toFixed(2)}`,
    '--petal-rotate': `${80 + (index * 47) % 220}deg`,
    '--petal-scale': `${(0.7 + ((index * 17) % 45) / 100).toFixed(2)}`,
    '--petal-x': `${4 + (index * 37) % 92}%`,
  }
}

export function FloatingPetals({ className = '', count = 14, tone = 'mixed' }: FloatingPetalsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [documentHidden, setDocumentHidden] = useState(() => typeof document !== 'undefined' && document.hidden)
  const [inViewport, setInViewport] = useState(false)
  const safeCount = Math.min(18, Math.max(6, Math.round(count)))

  useEffect(() => {
    const syncVisibility = () => setDocumentHidden(document.hidden)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element || !('IntersectionObserver' in window)) {
      setInViewport(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => setInViewport(Boolean(entry?.isIntersecting)), { rootMargin: '100px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const paused = documentHidden || !inViewport

  return (
    <div
      aria-hidden="true"
      className={`floating-petals floating-petals--${tone} ${paused ? 'is-paused' : ''} ${className}`}
      ref={ref}
    >
      {Array.from({ length: safeCount }, (_, index) => (
        <span className="floating-petals__petal" key={index} style={petalStyle(index)}>
          <svg fill="none" focusable="false" viewBox="0 0 18 28" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1c7 5 9 13 4 21-2 3-5 5-8 5-3-9-2-18 4-26Z" fill="currentColor" />
            <path d="M9 4c0 7-1 13-4 20" opacity=".36" stroke="currentColor" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </div>
  )
}
