import { ArrowUp } from 'lucide-react'
import { GoldReveal, OrientalReveal } from '../components/motion'
import { FloatingPetals, HairlineDivider, RoseSeal } from '../components/ornaments'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function FinaleSection() {
  const replay = () => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  return (
    <section className="closing" aria-labelledby="closing-title">
      <WeddingImage {...config.hero} alt="" wrapperClassName="closing__image" />
      <div className="closing__veil" aria-hidden="true" />
      <FloatingPetals className="closing__petals" count={6} tone="mixed" />

      <OrientalReveal className="closing__content" variant="scale" threshold={0.14}>
        <article className="closing__card">
          <GoldReveal block className="closing__seal">
            <RoseSeal tone="rose" monogram={config.couple.monogram} ring="thin" />
          </GoldReveal>
          <p className="closing__eyebrow">Cảm ơn bạn</p>
          <h2 id="closing-title" className="closing__title">
            {config.copy.finalMessage}
          </h2>
          <HairlineDivider center="diamond" tone="rose" />
          <div className="closing__date">
            <span>Ngày thành hôn</span>
            <time dateTime={config.date.iso}>{config.date.display}</time>
            <small>{config.date.lunar}</small>
          </div>
          <strong className="closing__signature">{config.couple.signature}</strong>
          <button type="button" className="text-button closing__replay" onClick={replay}>
            <ArrowUp aria-hidden="true" /> Xem lại thiệp
          </button>
          <p className="closing__mark">Tuấn Hùng &amp; Sao Mai · 2026</p>
        </article>
      </OrientalReveal>
    </section>
  )
}
