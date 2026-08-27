import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface DividerProps extends OrnamentProps {
  /** Center accent: a restrained sparkle, leaf, or hairline. */
  center?: 'star' | 'diamond' | 'leaf' | 'pip' | 'none'
  /** Show two-tone rule (gold + soft ink). */
  dual?: boolean
  /** Filled track variant (a soft bar). */
  solid?: boolean
}

/** A thin, paper-style divider used between sections. */
export function HairlineDivider({
  className,
  tone = 'rose',
  size,
  style,
  center = 'star',
  dual = false,
  solid = false,
  ...props
}: DividerProps) {
  const width = 100
  const height = 18
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('hairline', tone, className)}
      fill="none"
      focusable="false"
      preserveAspectRatio="none"
      stroke="currentColor"
      strokeLinecap="round"
      style={ornamentStyle(size, style)}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <line x1={solid ? 20 : 8} y1={height / 2} x2={width - (solid ? 20 : 8)} y2={height / 2} strokeWidth={dual ? 0.6 : 0.85} opacity={dual ? 0.6 : 0.85} />
        {dual && (
          <line x1={solid ? 22 : 12} y1={height / 2 + 3} x2={width - (solid ? 22 : 12)} y2={height / 2 + 3} strokeWidth="0.4" opacity="0.85" />
        )}
        {center === 'diamond' && (
          <g transform={`translate(${width / 2} ${height / 2})`}>
            <path d="M0 -4 L4 0 L0 4 L-4 0 Z" fill="currentColor" stroke="none" />
          </g>
        )}
        {center === 'star' && (
          <g transform={`translate(${width / 2} ${height / 2})`}>
            <path d="M0 -5 L1.25 -1.25 L5 0 L1.25 1.25 L0 5 L-1.25 1.25 L-5 0 L-1.25 -1.25 Z" fill="currentColor" stroke="none" />
          </g>
        )}
        {center === 'leaf' && (
          <g transform={`translate(${width / 2} ${height / 2})`}>
            <path d="M-5 0 C-3 -3 3 -3 5 0 C3 3 -3 3 -5 0 Z" stroke="currentColor" fill="none" strokeWidth="0.8" />
          </g>
        )}
        {center === 'pip' && (
          <circle cx={width / 2} cy={height / 2} r="1.6" fill="currentColor" />
        )}
      </g>
    </svg>
  )
}
