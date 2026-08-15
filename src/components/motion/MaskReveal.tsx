import type { CSSProperties, ReactNode } from 'react'
import { useRevealVisibility, type RevealObserverOptions } from './useRevealVisibility'

export type MaskDirection = 'left' | 'right' | 'up' | 'down'

interface MaskRevealProps extends RevealObserverOptions {
  children: ReactNode
  className?: string
  delay?: number
  direction?: MaskDirection
  /** Any valid CSS color; defaults to the vermilion token. */
  veilColor?: string
}

type MaskStyle = CSSProperties & {
  '--mask-delay': string
  '--mask-veil': string
}

export function MaskReveal({
  children,
  className = '',
  delay = 0,
  direction = 'left',
  veilColor = 'var(--color-primary)',
  ...observerOptions
}: MaskRevealProps) {
  const { ref, visible } = useRevealVisibility<HTMLDivElement>(observerOptions)
  const style: MaskStyle = {
    '--mask-delay': `${Math.max(0, delay)}ms`,
    '--mask-veil': veilColor,
  }

  return (
    <div
      className={`mask-reveal mask-reveal--${direction} ${visible ? 'is-visible' : ''} ${className}`}
      ref={ref}
      style={style}
    >
      <div className="mask-reveal__content">{children}</div>
    </div>
  )
}
