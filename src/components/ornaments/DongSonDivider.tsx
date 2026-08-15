import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface DongSonDividerProps extends OrnamentProps {
  center?: 'sun' | 'diamond'
}

export function DongSonDivider({
  center = 'sun',
  className,
  tone = 'gold',
  size,
  style,
  ...props
}: DongSonDividerProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('dong-son-divider', tone, className)}
      fill="none"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
      style={ornamentStyle(size, style)}
      viewBox="0 0 640 52"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinejoin="round">
        <path d="M2 26h226m184 0h226" strokeWidth="1.2" />
        <path d="m26 18 10 8-10 8m22-16 10 8-10 8m22-16 10 8-10 8m22-16 10 8-10 8m22-16 10 8-10 8m22-16 10 8-10 8m22-16 10 8-10 8m22-16 10 8-10 8" opacity=".55" />
        <path d="m614 18-10 8 10 8m-22-16-10 8 10 8m-22-16-10 8 10 8m-22-16-10 8 10 8m-22-16-10 8 10 8m-22-16-10 8 10 8m-22-16-10 8 10 8m-22-16-10 8 10 8" opacity=".55" />
        {center === 'sun' ? (
          <>
            <circle cx="320" cy="26" r="12" strokeWidth="1.4" />
            <circle cx="320" cy="26" r="4" fill="currentColor" stroke="none" />
            <path d="M320 2v8m0 32v8m24-24h-8m-32 0h-8m41-17-6 6m-22 22-6 6m34 0-6-6m-22-22-6-6" />
          </>
        ) : (
          <>
            <path d="m320 4 22 22-22 22-22-22 22-22Z" strokeWidth="1.4" />
            <path d="m320 15 11 11-11 11-11-11 11-11Z" fill="currentColor" opacity=".7" />
          </>
        )}
      </g>
    </svg>
  )
}
