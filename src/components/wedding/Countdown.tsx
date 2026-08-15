import { useEffect, useRef, useState } from 'react'
import { getCountdownParts } from '../../utils/countdown'

interface CountdownProps { target: string }

export function Countdown({ target }: CountdownProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [countdown, setCountdown] = useState(() => getCountdownParts(target))

  useEffect(() => {
    const root = rootRef.current
    let interval: number | null = null
    let inViewport = false

    const stop = () => {
      if (interval !== null) window.clearInterval(interval)
      interval = null
    }
    const update = () => {
      const next = getCountdownParts(target)
      setCountdown(next)
      if (next.isComplete) stop()
    }
    const sync = () => {
      if (inViewport && !document.hidden) {
        update()
        if (interval === null) interval = window.setInterval(update, 1_000)
      } else stop()
    }

    if (!root || !('IntersectionObserver' in window)) {
      inViewport = true
      sync()
      document.addEventListener('visibilitychange', sync)
      return () => { document.removeEventListener('visibilitychange', sync); stop() }
    }

    const observer = new IntersectionObserver(([entry]) => {
      inViewport = Boolean(entry?.isIntersecting)
      sync()
    }, { rootMargin: '100px 0px' })
    observer.observe(root)
    document.addEventListener('visibilitychange', sync)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      stop()
    }
  }, [target])

  if (countdown.isComplete) {
    return (
      <div className="countdown countdown--complete" aria-live="polite" ref={rootRef} role="status">
        <strong>Mình đã về chung một nhà</strong>
        <span lang="en">Forever starts here.</span>
      </div>
    )
  }

  const entries = [
    ['Ngày', countdown.days], ['Giờ', countdown.hours], ['Phút', countdown.minutes], ['Giây', countdown.seconds],
  ] as const

  return (
    <div className="countdown countdown--seals" aria-label="Thời gian còn lại đến ngày cưới" ref={rootRef} role="timer">
      {entries.map(([label, value]) => (
        <div className="countdown__unit" key={label}>
          <span className="countdown__value-window">
            <strong className="countdown__value" key={`${label}-${value}`}>{String(value).padStart(2, '0')}</strong>
          </span>
          <span className="countdown__label">{label}</span>
        </div>
      ))}
    </div>
  )
}
