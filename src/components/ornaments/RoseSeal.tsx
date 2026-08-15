import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface RoseSealProps extends OrnamentProps {
  /** Optional monogram letters drawn in the center. */
  monogram?: string
  /** Outer ring style: thin, hairline, or filled. */
  ring?: 'thin' | 'hairline' | 'filled'
}

export function RoseSeal({ className, tone = 'rose', size, style, monogram = 'H × M', ring = 'thin', ...props }: RoseSealProps) {
  const stroke = ring === 'hairline' ? 0.6 : ring === 'filled' ? 1.6 : 1
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('rose-seal', tone, className)}
      focusable="false"
      style={ornamentStyle(size, style)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeOpacity={ring === 'filled' ? 0.95 : 0.7} strokeWidth={stroke} />
      <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.4" />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize="14"
        fontWeight="500"
        letterSpacing="0.06em"
        fill="currentColor"
      >
        {monogram}
      </text>
    </svg>
  )
}
