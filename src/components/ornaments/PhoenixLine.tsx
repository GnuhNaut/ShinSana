import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface PhoenixLineProps extends OrnamentProps {
  direction?: 'left' | 'right'
}

/** An abstract, restrained phoenix contour intended for embossing or section edges. */
export function PhoenixLine({
  className,
  direction = 'right',
  tone = 'gold',
  size,
  style,
  ...props
}: PhoenixLineProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={`${ornamentClass('phoenix-line', tone, className)} oriental-ornament--phoenix-${direction}`}
      fill="none"
      focusable="false"
      style={ornamentStyle(size, style)}
      viewBox="0 0 420 230"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 181c58-2 84-31 93-71 6-27 22-45 48-54 27-10 50-2 66 21-29-9-50-3-62 18-9 16-6 31 9 45 24 23 54 31 91 25 42-7 77-31 105-72-13 52-44 87-91 105-43 16-87 8-131-26-17-13-35-16-54-9-23 9-47 15-74 18Z" strokeWidth="2" />
        <path d="M151 166c33 20 52 37 58 52 4-24-3-44-22-61m24 11c33 17 54 31 63 44-1-22-11-40-31-55m16 2c34 9 59 18 75 28-8-19-22-33-43-43" opacity=".72" strokeWidth="1.35" />
        <path d="M176 54c-7-14-5-27 7-39 13 11 17 23 11 37 12-11 25-14 40-8-5 16-16 25-33 27" strokeWidth="1.4" />
        <path d="M229 77c11 7 19 17 23 29 14-7 28-8 42-1-15 18-34 25-58 22" opacity=".62" strokeWidth="1.2" />
        <circle cx="194" cy="72" r="2.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}
