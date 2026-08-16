import type { CSSProperties, SVGProps } from 'react'

export type OrnamentTone = 'rose' | 'roseDeep' | 'gold' | 'goldDeep' | 'ink' | 'paper' | 'inherit' | 'primary' | 'deep'

export interface OrnamentProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Uses a design-token-backed currentColor class. */
  tone?: OrnamentTone
  /** Optional CSS width. Height remains proportional. */
  size?: CSSProperties['width']
}

export function ornamentClass(name: string, tone: OrnamentTone, className = '') {
  return ['oriental-ornament', `oriental-ornament--${name}`, `oriental-ornament--${tone}`, className]
    .filter(Boolean)
    .join(' ')
}

export function ornamentStyle(size: OrnamentProps['size'], style: CSSProperties | undefined) {
  return size === undefined ? style : { ...style, width: size }
}
