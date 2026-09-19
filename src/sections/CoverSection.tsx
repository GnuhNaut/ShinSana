import { useEffect, useState } from 'react'
import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import { getGuestNameFromUrl } from '../utils/guest'

interface CoverSectionProps {
  onOpening: () => void
  onOpened: () => void
}

export function CoverSection({ onOpening, onOpened }: CoverSectionProps) {
  const config = useWeddingConfig()
  const [leaving, setLeaving] = useState(false)
  const guestName = getGuestNameFromUrl()

  useEffect(() => {
    document.body.dataset.invitationState = 'closed'
    return () => { delete document.body.dataset.invitationState }
  }, [])

  const openInvitation = () => {
    if (leaving) return
    onOpening()
    setLeaving(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => {
      delete document.body.dataset.invitationState
      onOpened()
    }, reduced ? 1 : 820)
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
        <button className="cover__open" type="button" onClick={openInvitation} disabled={leaving}>
          <span>{leaving ? 'Đang mở thiệp' : config.content.coverPrompt}</span>
          <i aria-hidden="true">↘</i>
        </button>
      </div>
    </section>
  )
}
