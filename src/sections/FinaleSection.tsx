import { ArrowUp } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { HairlineDivider, RoseSeal } from '../components/ornaments'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function FinaleSection() {
  const weddingYear = config.date.iso.slice(0, 4)
  const replay = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <section className="closing" aria-labelledby="closing-title">
      <WeddingImage {...config.hero} alt="" wrapperClassName="closing__image" />
      <div className="closing__veil" aria-hidden="true" />
      <OrientalReveal className="closing__content" variant="up" threshold={0.12}>
        <RoseSeal className="closing__seal" tone="gold" monogram={config.couple.monogram} ring="thin" />
        <p className="closing__eyebrow">{config.copy.finalTitle}</p>
        <h2 id="closing-title">{config.copy.finalMessage}</h2>
        <HairlineDivider className="closing__divider" center="diamond" tone="gold" />
        <time dateTime={config.date.iso}>{config.date.display}</time>
        <small>{config.date.lunar}</small>
        <strong className="closing__signature">{config.couple.signature}</strong>
        <button type="button" className="text-button closing__replay" onClick={replay}>
          <ArrowUp aria-hidden="true" /> Xem lại thiệp
        </button>
        <p className="closing__mark">{config.couple.groom.fullName} &amp; {config.couple.bride.fullName} · {weddingYear}</p>
      </OrientalReveal>
    </section>
  )
}
