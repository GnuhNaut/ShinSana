import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface PaperFrameProps extends OrnamentProps {
  /** Padding inset as a fraction of the frame. */
  inset?: number
  /** Inner double border. */
  double?: boolean
}

/**
 * Decorative paper frame used as a low-cost stand-in for an actual border image.
 * It draws two concentric rectangles with thin strokes.
 */
export function PaperFrame({ className, tone = 'rose', size, style, double = true, ...props }: PaperFrameProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('paper-frame', tone, className)}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeWidth="0.8"
      style={ornamentStyle(size, style)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="4" y="4" width="92" height="92" />
      {double && <rect x="8" y="8" width="84" height="84" opacity="0.55" />}
    </svg>
  )
}
