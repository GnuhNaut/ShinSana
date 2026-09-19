interface PeonyLineArtProps {
  className?: string
}

/** Lightweight decorative line art; it deliberately stays outside the content tree. */
export function PeonyLineArt({ className = '' }: PeonyLineArtProps) {
  return (
    <svg className={'peony-line-art ' + className} viewBox="0 0 160 140" fill="none" aria-hidden="true" focusable="false">
      <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round">
        <path d="M80 111c-6-18-3-37 7-51 10-14 25-20 40-20-1 17-9 31-24 40-8 5-16 9-23 31Z" />
        <path d="M80 111c6-18 3-37-7-51C63 46 48 40 33 40c1 17 9 31 24 40 8 5 16 9 23 31Z" />
        <path d="M80 108c-14-7-25-19-28-35-3-15 5-29 17-37 8 12 12 24 11 38" />
        <path d="M80 108c14-7 25-19 28-35 3-15-5-29-17-37-8 12-12 24-11 38" />
        <path d="M80 105c-7-11-9-24-5-36 2-7 5-13 5-22 0 9 3 15 5 22 4 12 2 25-5 36Z" />
        <path d="M45 87c10-1 20 1 29 7M115 87c-10-1-20 1-29 7M80 107v25M80 120c-8-2-15-1-23 4M80 120c8-2 15-1 23 4" />
      </g>
    </svg>
  )
}
