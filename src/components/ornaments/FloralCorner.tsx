import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

export type OrnamentCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

interface FloralCornerProps extends OrnamentProps {
  corner?: OrnamentCorner
  /** Visual variant: bloom cluster, leaf trail, or airy wreath. */
  variant?: 'bloom' | 'wreath' | 'trail'
}

/**
 * Soft floral line art used to anchor compositions.
 * Replaces the heavier peony corner to keep the palette airy.
 */
export function FloralCorner({
  className,
  corner = 'top-left',
  tone = 'rose',
  size,
  style,
  variant = 'bloom',
  ...props
}: FloralCornerProps) {
  const cornerClass = `ornament-floral--${corner}`
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={`${ornamentClass(`floral-${variant}`, tone, className)} ${cornerClass}`}
      fill="none"
      focusable="false"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={ornamentStyle(size, style)}
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      {variant === 'bloom' && (
        <g strokeWidth="0.95">
          <path d="M6 214 C40 168 70 134 116 104" opacity=".85" />
          <path d="M22 184 C18 156 36 134 70 122" opacity=".7" />
          <path d="M58 142 C50 118 70 94 100 88" opacity=".7" />
          <g>
            <path d="M124 88 C140 76 154 86 152 102 C140 112 124 102 124 88Z" />
            <path d="M124 88 C108 76 96 86 96 100 C108 110 124 102 124 88Z" opacity=".78" />
            <path d="M138 116 C150 110 162 116 164 128 C156 138 140 132 138 116Z" opacity=".78" />
            <path d="M86 116 C72 110 60 116 58 130 C68 140 86 134 86 116Z" opacity=".78" />
            <circle cx="112" cy="100" r="3" fill="currentColor" stroke="none" />
          </g>
          <path d="M82 142 C72 156 74 174 92 184" opacity=".55" />
          <path d="M44 198 C56 184 78 174 102 168" opacity=".5" />
        </g>
      )}
      {variant === 'wreath' && (
        <g strokeWidth="0.85">
          <path d="M16 110 C40 60 110 16 192 80" opacity=".78" />
          <path d="M30 138 C70 84 130 60 184 110" opacity=".42" />
          <g>
            <circle cx="60" cy="78" r="6" />
            <circle cx="100" cy="42" r="7" />
            <circle cx="142" cy="36" r="6" />
            <circle cx="178" cy="64" r="7" />
          </g>
          <path d="M150 110 C170 110 188 122 188 144" opacity=".7" />
          <path d="M88 160 C112 178 142 178 168 162" opacity=".55" />
          <path d="M44 156 C50 132 60 116 78 110" opacity=".55" />
        </g>
      )}
      {variant === 'trail' && (
        <g strokeWidth="0.85">
          <path d="M4 200 C44 200 92 168 110 124 C140 60 168 30 214 14" opacity=".7" />
          <path d="M40 168 C76 158 102 138 116 110" opacity=".42" />
          <g>
            <circle cx="64" cy="152" r="2.5" />
            <circle cx="90" cy="138" r="2.5" />
            <circle cx="116" cy="114" r="2.5" />
            <circle cx="138" cy="86" r="2.5" />
            <circle cx="158" cy="60" r="2.5" />
          </g>
          <path d="M150 90 C176 70 198 60 218 58" opacity=".55" />
        </g>
      )}
    </svg>
  )
}
