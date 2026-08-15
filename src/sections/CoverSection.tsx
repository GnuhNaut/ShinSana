import { useEffect, useState } from 'react'
import { CornerBrackets, DoubleHappiness, FloralCorner, PaperFrame } from '../components/ornaments'
import { getGuestNameFromUrl } from '../utils/guest'
import { weddingConfig as config } from '../config/wedding'

interface CoverSectionProps {
  onOpened: () => void
}

export function CoverSection({ onOpened }: CoverSectionProps) {
  const [leaving, setLeaving] = useState(false)
  const guestName = getGuestNameFromUrl()

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
    }, reducedMotion ? 20 : 700)
  }

  const showPersonalized = config.features.personalizedGuest && Boolean(guestName)

  return (
    <section className={`cover ${leaving ? 'cover--leaving' : ''}`} aria-label="Bìa thiệp cưới">
      <div className="cover__background" aria-hidden="true" />
      <div className="cover__silk" aria-hidden="true" />
      <div className="cover__panel cover__panel--left" aria-hidden="true" />
      <div className="cover__panel cover__panel--right" aria-hidden="true" />

      <article className="cover__card">
        <FloralCorner className="cover__floral cover__floral--top" corner="top-left" tone="rose" variant="bloom" />
        <FloralCorner className="cover__floral cover__floral--bottom" corner="bottom-right" tone="rose" variant="bloom" />
        <PaperFrame className="cover__frame" double tone="gold" />

        <div className="cover__card-inner">
          <h1 className="sr-only">Thiệp cưới {config.couple.groom.fullName} và {config.couple.bride.fullName}</h1>
          <p className="cover__kicker cover__reveal">TRÂN TRỌNG KÍNH MỜI</p>
          <div className="cover__seal cover__reveal--seal">
            <DoubleHappiness tone="rose" size="100%" />
          </div>
          <div className="cover__names" aria-hidden="true">
            <span className="cover__reveal">{config.couple.groom.fullName}</span>
            <i className="cover__reveal">&amp;</i>
            <span className="cover__reveal">{config.couple.bride.fullName}</span>
          </div>
          <div className="cover__dates cover__reveal">
            <time dateTime={config.date.iso}>{config.date.display.replaceAll('.', ' · ')}</time>
            <span>{config.date.lunar}</span>
          </div>
          {showPersonalized && (
            <p className="cover__guest cover__reveal">Kính mời <strong>{guestName}</strong></p>
          )}
          <button className="button button--primary cover__reveal" type="button" onClick={openInvitation} disabled={leaving}>
            <span>{leaving ? 'ĐANG MỞ…' : 'Mở thiệp'}</span>
          </button>
          <p className="cover__hint cover__reveal">{config.copy.coverHint}</p>
        </div>
        <CornerBrackets className="cover__brackets cover__brackets--tl" corner="top-left" tone="gold" length={28} />
        <CornerBrackets className="cover__brackets cover__brackets--br" corner="bottom-right" tone="gold" length={28} />
      </article>
    </section>
  )
}
