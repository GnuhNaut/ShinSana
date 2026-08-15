import { Children, type CSSProperties, type ReactNode } from 'react'
import { useRevealVisibility, type RevealObserverOptions } from './useRevealVisibility'
import type { RevealVariant } from './Reveal'

interface RevealGroupProps extends RevealObserverOptions {
  children: ReactNode
  className?: string
  itemClassName?: string
  stagger?: number
  variant?: RevealVariant
}

type GroupStyle = CSSProperties & {
  '--motion-index': number
  '--motion-stagger': string
}

export function RevealGroup({
  children,
  className = '',
  itemClassName = '',
  stagger = 110,
  variant = 'up',
  ...observerOptions
}: RevealGroupProps) {
  const { ref, visible } = useRevealVisibility<HTMLDivElement>(observerOptions)

  return (
    <div className={`motion-reveal-group ${visible ? 'is-visible' : ''} ${className}`} ref={ref}>
      {Children.toArray(children).map((child, index) => {
        const style: GroupStyle = {
          '--motion-index': index,
          '--motion-stagger': `${Math.max(0, stagger)}ms`,
        }
        return <div className={`motion-reveal-group__item motion-reveal--${variant} ${itemClassName}`} key={index} style={style}>{child}</div>
      })}
    </div>
  )
}
