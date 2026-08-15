import type { CSSProperties, ReactNode } from 'react'
import { useRevealVisibility, type RevealObserverOptions } from './useRevealVisibility'

export type RevealVariant = 'fade' | 'up' | 'down' | 'left' | 'right' | 'scale'

interface RevealProps extends RevealObserverOptions {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  variant?: RevealVariant
}

type RevealStyle = CSSProperties & {
  '--motion-delay': string
  '--motion-duration': string
}

/** Scroll reveal primitive. Named separately in CSS so it can coexist with the V1 Reveal. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 720,
  variant = 'up',
  ...observerOptions
}: RevealProps) {
  const { ref, visible } = useRevealVisibility<HTMLDivElement>(observerOptions)
  const style: RevealStyle = {
    '--motion-delay': `${Math.max(0, delay)}ms`,
    '--motion-duration': `${Math.max(1, duration)}ms`,
  }

  return (
    <div
      className={`motion-reveal motion-reveal--${variant} ${visible ? 'is-visible' : ''} ${className}`}
      ref={ref}
      style={style}
    >
      {children}
    </div>
  )
}

export const OrientalReveal = Reveal
