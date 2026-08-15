import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

interface EasternCloudProps extends OrnamentProps {
  direction?: 'left' | 'right'
}

export function EasternCloud({
  className,
  direction = 'right',
  tone = 'gold',
  size,
  style,
  ...props
}: EasternCloudProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={`${ornamentClass('eastern-cloud', tone, className)} oriental-ornament--cloud-${direction}`}
      fill="none"
      focusable="false"
      style={ornamentStyle(size, style)}
      viewBox="0 0 420 132"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 95h115c-14-8-18-19-11-31 8-14 25-16 39-6 5-27 26-45 54-45 30 0 53 22 55 51 13-12 35-11 47 2 9 10 9 23 3 29h102" strokeWidth="2" />
        <path d="M52 111h127c18 0 27-8 27-19 0-9-7-16-16-16-10 0-16 7-16 14" opacity=".58" strokeWidth="1.3" />
        <path d="M233 111h79c16 0 25-7 25-17 0-8-6-14-14-14-9 0-14 6-14 12" opacity=".58" strokeWidth="1.3" />
        <path d="M80 124h78m112 0h63" opacity=".32" strokeWidth="1" />
        <path d="M157 63c5-20 21-32 42-32 22 0 39 15 42 36" opacity=".42" strokeWidth="1.2" />
      </g>
    </svg>
  )
}
