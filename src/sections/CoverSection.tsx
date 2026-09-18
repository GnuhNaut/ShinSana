import { useEffect, useState } from 'react'
import { DoubleHappiness, FloralCorner, HairlineDivider } from '../components/ornaments'
import { WeddingImage } from '../components/ui/WeddingImage'
import { DecorativeSticker } from '../components/wedding/DecorativeSticker'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import { getGuestNameFromUrl } from '../utils/guest'

interface CoverSectionProps {
  onOpened: () => void
}

export function CoverSection({ onOpened }: CoverSectionProps) {
  const config = useWeddingConfig()
  const [leaving, setLeaving] = useState(false)
  const guestName = config.features.personalizedGuest ? getGuestNameFromUrl() : null

  useEffect(() => {
    document.body.classList.add('invitation-closed')
    return () => document.body.classList.remove('invitation-closed')
  }, [])

  const openInvitation = () => {
    if (leaving) return
    setLeaving(true)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => {
      document.body.classList.remove('invitation-closed')
      onOpened()
    }, reducedMotion ? 20 : 620)
  }

  return (
    <section className={`cover${leaving ? ' cover--leaving' : ''}`} aria-labelledby="cover-title">
      <div className="cover__media">
        <WeddingImage {...config.hero} eager />
      </div>
      <div className="cover__veil" aria-hidden="true" />
      <span className="cover__sparkle cover__sparkle--one" aria-hidden="true">✦</span>
      <DecorativeSticker placement="hero" className="cover__sticker" eager />
      <div className="cover__layout">
        <article className="cover__paper">
          <FloralCorner className="cover__floral" corner="bottom-right" tone="rose" variant="trail" />
          <DoubleHappiness className="cover__seal" tone="primary" size="3rem" />
          <p className="cover__kicker">{config.copy.coverEyebrow}</p>
          {guestName && <p className="cover__guest">Kính mời <strong>{guestName}</strong></p>}
          <h1 className="cover__names" id="cover-title" aria-label={`${config.couple.groom.fullName} và ${config.couple.bride.fullName}`}>
            <span>{config.couple.groom.fullName}</span>
            <i>&amp;</i>
            <span>{config.couple.bride.fullName}</span>
          </h1>
          <HairlineDivider className="cover__divider" center="star" tone="rose" />
          <p className="cover__date">
            <time dateTime={config.date.iso}>{config.date.display.replaceAll('.', ' · ')}</time>
            <span>{config.date.lunar}</span>
          </p>
          <button className="button button--primary cover__button" type="button" onClick={openInvitation} disabled={leaving}>
            {leaving ? 'Đang mở…' : 'Mở lời mời'}
          </button>
          <p className="cover__hint">{config.copy.coverHint}</p>
        </article>
      </div>
    </section>
  )
}
