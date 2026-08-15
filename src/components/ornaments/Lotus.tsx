import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface LotusProps extends OrnamentProps {
  /** Adds a quiet water line below the bloom. */
  withWater?: boolean
  /** Stem length multiplier for the soft lotus line art. */
  stem?: 'short' | 'long'
  /** Visual weight of the stroke. */
  weight?: 'hairline' | 'regular'
}

export function Lotus({ className, tone = 'rose', size, style, withWater = false, stem = 'short', weight = 'regular', ...props }: LotusProps) {
  const strokeWidth = weight === 'hairline' ? 1.1 : 1.55
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('lotus', tone, className)}
      fill="none"
      focusable="false"
      style={ornamentStyle(size, style)}
      viewBox="0 0 220 126"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth}>
        <path d="M110 91c-22-19-25-43 0-72 25 29 22 53 0 72Z" />
        <path d="M106 91C78 84 62 65 68 35c28 8 42 28 38 56Zm8 0c28-7 44-26 38-56-28 8-42 28-38 56Z" />
        <path d="M93 91C65 93 42 81 35 55c29-2 49 10 58 36Zm34 0c28 2 51-10 58-36-29-2-49 10-58 36Z" />
        <path d="M79 89c-23 10-46 6-62-13 22-11 45-7 62 13Zm62 0c23 10 46 6 62-13-22-11-45-7-62 13Z" />
        <path d="M110 91v22" />
        {stem === 'long' && (
          <path d="M110 113c-2 18 6 30 18 42" opacity=".62" />
        )}
        {withWater && (
          <>
            <path d="M64 113c18-5 28-5 46 0s28 5 46 0" opacity=".65" />
            <path d="M82 121c12-3 19-3 28 0s16 3 28 0" opacity=".38" />
          </>
        )}
      </g>
    </svg>
  )
}
