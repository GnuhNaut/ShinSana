import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

export type OrnamentCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface CornerBracketsProps extends OrnamentProps {
  /** L-shape: which corner it should be drawn in. */
  corner?: OrnamentCorner
  /** Bracket length in px. */
  length?: number
  /** Distance from the parent edge. */
  inset?: number
}

/**
 * Thin L-shaped brackets used to anchor paper cards without heavy borders.
 */
export function CornerBrackets({ className, corner = 'top-left', tone = 'rose', size, style, length = 26, inset = 0, ...props }: CornerBracketsProps) {
  const crossX = corner === 'top-left' || corner === 'bottom-left' ? inset : 100 - inset
  const crossY = corner === 'top-left' || corner === 'top-right' ? inset : 100 - inset
  const horizX1 = corner === 'top-left' || corner === 'bottom-left' ? crossX : crossX - length
  const horizX2 = corner === 'top-left' || corner === 'bottom-left' ? crossX + length : crossX
  const vertY1 = corner === 'top-left' || corner === 'top-right' ? crossY : crossY - length
  const vertY2 = corner === 'top-left' || corner === 'top-right' ? crossY + length : crossY
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('corner-brackets', tone, className)}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="0.85"
      style={ornamentStyle(size, style)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1={horizX1} y1={crossY} x2={horizX2} y2={crossY} />
      <line x1={crossX} y1={vertY1} x2={crossX} y2={vertY2} />
    </svg>
  )
}
