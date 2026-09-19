import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import { getGuestNameFromUrl } from '../utils/guest'

interface CoverSectionProps {
  onOpening: () => void
  onReveal: () => void
  onOpened: () => void
}

export function CoverSection({ onOpening, onReveal, onOpened }: CoverSectionProps) {
  const config = useWeddingConfig()
  const [leaving, setLeaving] = useState(false)
  const guestName = getGuestNameFromUrl()
  const magneticFrame = useRef<number | null>(null)

  useEffect(() => {
    document.body.dataset.invitationState = 'closed'
    return () => {
      if (magneticFrame.current !== null) window.cancelAnimationFrame(magneticFrame.current)
      delete document.body.dataset.invitationState
    }
  }, [])

  const openInvitation = () => {
    if (leaving) return
    onOpening()
    setLeaving(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(onReveal, reduced ? 1 : 360)
    window.setTimeout(() => {
      delete document.body.dataset.invitationState
      onOpened()
    }, reduced ? 1 : 820)
  }

  const moveOpenButton = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) return
    const button = event.currentTarget
    const bounds = button.getBoundingClientRect()
    const x = Math.max(-4, Math.min(4, ((event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)) * 4))
    const y = Math.max(-3, Math.min(3, ((event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)) * 3))
    if (magneticFrame.current !== null) window.cancelAnimationFrame(magneticFrame.current)
    magneticFrame.current = window.requestAnimationFrame(() => {
      button.style.setProperty('--magnet-x', `${x}px`)
      button.style.setProperty('--magnet-y', `${y}px`)
      magneticFrame.current = null
    })
  }

  const resetOpenButton = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (magneticFrame.current !== null) window.cancelAnimationFrame(magneticFrame.current)
    event.currentTarget.style.setProperty('--magnet-x', '0px')
    event.currentTarget.style.setProperty('--magnet-y', '0px')
  }

  return (
    <section className={'cover' + (leaving ? ' cover--leaving' : '')} aria-labelledby="cover-title">
      <WeddingImage {...config.hero} eager wrapperClassName="cover__image" />
      <div className="cover__wash" aria-hidden="true" />
      <div className="cover__curtains" aria-hidden="true">
        <span className="cover__curtain cover__curtain--left" />
        <span className="cover__curtain cover__curtain--right" />
      </div>
      <div className="cover__edge cover__edge--top" aria-hidden="true" />
      <div className="cover__edge cover__edge--bottom" aria-hidden="true" />

      <div className="cover__content">
        <p className="cover__mark" aria-hidden="true">{config.couple.monogram}</p>
        <p className="cover__eyebrow">{config.content.coverEyebrow}</p>
        {guestName && (
          <div className="cover__guest">
            <span>Kính mời</span>
            <strong>{guestName}</strong>
          </div>
        )}
        <h1 id="cover-title" className="cover__names" aria-label={config.couple.groom + ' và ' + config.couple.bride}>
          <span>{config.couple.groom}</span>
          <i>&amp;</i>
          <span>{config.couple.bride}</span>
        </h1>
        <div className="cover__rule" aria-hidden="true"><span /></div>
        <p className="cover__date">
          <time dateTime={config.date.iso}>{config.date.display}</time>
          <span>{config.date.lunar}</span>
        </p>
        <button
          className="cover__open"
          type="button"
          data-context-cursor="MỞ"
          onClick={openInvitation}
          onPointerMove={moveOpenButton}
          onPointerLeave={resetOpenButton}
          disabled={leaving}
        >
          <span>{leaving ? 'Đang mở thiệp' : config.content.coverPrompt}</span>
          <i aria-hidden="true">↘</i>
        </button>
      </div>
    </section>
  )
}
