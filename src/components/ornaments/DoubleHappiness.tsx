import type { OrnamentProps } from './types'
import { ornamentClass, ornamentStyle } from './types'

/** A geometric Song Hy mark assembled from simple ceremonial seal strokes. */
export function DoubleHappiness({ className, tone = 'gold', size, style, ...props }: OrnamentProps) {
  return (
    <svg
      {...props}
      aria-hidden="true"
      className={ornamentClass('double-happiness', tone, className)}
      focusable="false"
      style={ornamentStyle(size, style)}
      viewBox="0 0 160 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="currentColor">
        <path d="M5 12h56v7H5zm25-9h7v29h-7zM11 29h44v7H11zm4 14h36v27H15zm7 7v13h22V50zm-9 27h16l4-7 4 7h16v7H38l-5-8-5 8H13zm2 14h36v29H15zm7 7v15h22V98z" />
        <path d="M99 12h56v7H99zm24-9h7v29h-7zm-18 26h44v7h-44zm4 14h36v27h-36zm7 7v13h22V50zm-9 27h16l4-7 4 7h16v7h-20l-5-8-5 8h-20zm2 14h36v29h-36zm7 7v15h22V98z" />
        <path d="M56 52h48v7H56zm0 42h48v7H56z" opacity=".88" />
      </g>
    </svg>
  )
}
