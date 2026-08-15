import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

export type OrnamentCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface PeonyCornerProps extends OrnamentProps {
  corner?: OrnamentCorner
}

export function PeonyCorner({
  className,
  corner = 'top-left',
  tone = 'gold',
  size,
  style,
  ...props
}: PeonyCornerProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={`${ornamentClass('peony-corner', tone, className)} oriental-ornament--${corner}`}
      fill="none"
      focusable="false"
      style={ornamentStyle(size, style)}
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.45">
        <path d="M3 226C25 169 58 129 104 98c29-20 52-42 70-76" opacity=".78" />
        <path d="M30 173c-3-29 8-48 34-57 4 28-7 48-34 57Zm43-46c5-25 20-39 45-39-5 25-20 38-45 39Zm53-41c1-20 11-34 30-40-1 20-11 33-30 40Z" />
        <path d="M47 145c22-1 38 8 48 27-23 2-39-7-48-27Zm47-42c18 2 31 11 37 28-18-1-31-10-37-28Z" opacity=".8" />
        <path d="M126 82c-17-4-25-15-24-32 13 1 21 6 26 16-2-15 4-26 18-33 8 12 8 24 1 35 10-8 21-10 33-5-2 15-10 25-24 30 14 0 24 6 31 18-9 11-21 15-35 10 6 10 5 21-2 32-15-4-23-14-24-29-8 11-19 15-33 13-2-15 4-26 17-34-13-3-21-10-25-22 10-11 24-14 41-9Z" />
        <path d="M128 73c8-9 19-10 29-3-1 12-8 20-20 22 6 9 5 18-2 27-11-2-17-9-19-20-9 5-18 4-26-3 2-11 9-17 20-19-5-8-4-16 2-23 9 1 15 7 16 19Z" opacity=".85" />
        <path d="M119 84c6-7 14-7 21-1-1 8-6 13-14 14-7-3-9-7-7-13Z" />
        <circle cx="128" cy="85" r="2.5" fill="currentColor" stroke="none" />
        <path d="M4 229h48M3 229v-48" opacity=".42" />
      </g>
    </svg>
  )
}
