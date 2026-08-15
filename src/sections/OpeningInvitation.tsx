import { useEffect, useState } from 'react'
import { GoldReveal } from '../components/motion'
import { DoubleHappiness, FloatingPetals, PeonyCorner } from '../components/ornaments'
import { weddingConfig as config } from '../config/wedding'

interface OpeningInvitationProps { onOpened: () => void }

export function OpeningInvitation({ onOpened }: OpeningInvitationProps) {
  const [leaving, setLeaving] = useState(false)

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
    }, reducedMotion ? 20 : 1180)
  }

  return (
    <section className={`opening ${leaving ? 'opening--leaving' : ''}`} aria-label="Mở thiệp cưới">
      <div className="opening__material" aria-hidden="true" />
      <div className="opening__frame" aria-hidden="true">
        <svg className="opening__border-svg" focusable="false" preserveAspectRatio="none" viewBox="0 0 100 100">
          <rect x=".6" y=".6" width="98.8" height="98.8" pathLength="1" />
          <rect x="1.4" y="1.4" width="97.2" height="97.2" pathLength="1" />
        </svg>
        <span />
      </div>
      <PeonyCorner className="opening__peony opening__peony--top" corner="top-left" tone="champagne" />
      <PeonyCorner className="opening__peony opening__peony--bottom" corner="bottom-right" tone="champagne" />
      <FloatingPetals className="opening__petals" count={10} tone="champagne" />
      <div className="opening__content">
        <h1 className="sr-only">Thiệp cưới {config.couple.groom.fullName} và {config.couple.bride.fullName}</h1>
        <p className="opening__kicker">{config.copy.openingEyebrow}</p>
        <div className="opening__seal"><GoldReveal block><DoubleHappiness tone="champagne" /></GoldReveal></div>
        <div className="opening__names" aria-hidden="true">
          <span>{config.couple.groom.fullName}</span>
          <i>&amp;</i>
          <span>{config.couple.bride.fullName}</span>
        </div>
        <div className="opening__dates">
          <time dateTime={config.date.iso}>{config.date.display.replaceAll('.', ' · ')}</time>
          <span>{config.date.lunar}</span>
        </div>
        <button className="button button--primary opening__button" type="button" onClick={openInvitation} disabled={leaving}>
          <span>{leaving ? 'ĐANG MỞ…' : 'MỞ THIỆP'}</span>
        </button>
        <p className="opening__hint">{config.copy.openingHint}</p>
      </div>
      <div className="opening__panel opening__panel--left" aria-hidden="true"><span /></div>
      <div className="opening__panel opening__panel--right" aria-hidden="true"><span /></div>
    </section>
  )
}
