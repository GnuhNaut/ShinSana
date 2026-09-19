import { useEffect, useState } from 'react'
import { ArrowUp, Music2, VolumeX } from 'lucide-react'

interface FloatingControlsProps {
  hasMusic: boolean
  isPlaying: boolean
  audioFailed: boolean
  onToggleMusic: () => void
}

export function FloatingControls({ hasMusic, isPlaying, audioFailed, onToggleMusic }: FloatingControlsProps) {
  const [showTop, setShowTop] = useState(false)
  const [yieldToAction, setYieldToAction] = useState(false)

  useEffect(() => {
    const update = () => {
      setShowTop(window.scrollY > window.innerHeight * 0.9)

      const mobile = window.matchMedia('(max-width: 43.99rem)').matches
      const fixedRailTop = window.innerHeight - 9.25 * 16
      const actionOccupiesRail = mobile && Array.from(document.querySelectorAll<HTMLElement>('.response__form, .wish-form, .gift-envelope')).some((element) => {
        const bounds = element.getBoundingClientRect()
        return bounds.top < window.innerHeight && bounds.bottom > fixedRailTop
      })
      setYieldToAction(actionOccupiesRail)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const toTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <aside className={'floating-controls' + (yieldToAction ? ' is-yielding' : '')} aria-label="Tiện ích thiệp cưới">
      <button
        className={'floating-controls__button' + (isPlaying ? ' is-playing' : '')}
        type="button"
        onClick={onToggleMusic}
        aria-label={!hasMusic ? 'Nhạc nền sẽ được cập nhật' : audioFailed ? 'Nhạc nền không thể phát' : isPlaying ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
        aria-pressed={isPlaying}
        disabled={!hasMusic || audioFailed}
        title={!hasMusic ? 'Nhạc nền sẽ được cập nhật' : audioFailed ? 'Không thể phát nhạc nền' : isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
      >
        {!hasMusic || audioFailed ? <VolumeX aria-hidden="true" /> : <Music2 aria-hidden="true" />}
      </button>
      {showTop && (
        <button className="floating-controls__button" type="button" onClick={toTop} aria-label="Về đầu thiệp">
          <ArrowUp aria-hidden="true" />
        </button>
      )}
    </aside>
  )
}
