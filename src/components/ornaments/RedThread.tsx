import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

/** A single wandering thread used only for the couple's story. */
export function RedThread({ className, tone = 'roseDeep', size, style, ...props }: OrnamentProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('red-thread', tone, className)}
      fill="none"
      focusable="false"
      preserveAspectRatio="none"
      style={ornamentStyle(size, style)}
      viewBox="0 0 220 1200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M112 2C26 126 198 224 102 360S28 598 126 720s58 258-12 476"
        pathLength="1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M101 355c13-17 31-17 43-2-10 18-26 25-43 2Z" fill="currentColor" opacity=".72" />
      <path d="M116 716c-14-14-30-12-39 5 13 15 29 19 39-5Z" fill="currentColor" opacity=".72" />
    </svg>
  )
}
