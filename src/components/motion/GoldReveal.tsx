import type { CSSProperties, ReactNode } from 'react'
import { useRevealVisibility, type RevealObserverOptions } from './useRevealVisibility'

interface GoldRevealProps extends RevealObserverOptions {
  block?: boolean
  children: ReactNode
  className?: string
  delay?: number
  tone?: 'gold' | 'inherit'
}

type GoldRevealStyle = CSSProperties & { '--gold-delay': string }

/** A one-shot entrance and restrained foil sweep for names, seals, or small ornaments. */
export function GoldReveal({
  block = false,
  children,
  className = '',
  delay = 0,
  tone = 'gold',
  ...observerOptions
}: GoldRevealProps) {
  const { ref, visible } = useRevealVisibility<HTMLSpanElement>(observerOptions)
  const style: GoldRevealStyle = { '--gold-delay': `${Math.max(0, delay)}ms` }

  return (
    <span
      className={`gold-reveal gold-reveal--${tone} ${block ? 'gold-reveal--block' : ''} ${visible ? 'is-visible' : ''} ${className}`}
      ref={ref}
      style={style}
    >
      <span className="gold-reveal__content">{children}</span>
    </span>
  )
}
