import { ArrowUp } from 'lucide-react'
import { GoldReveal, OrientalReveal, ParallaxLayer } from '../components/motion'
import { DoubleHappiness, EasternCloud, FloatingPetals, PeonyCorner } from '../components/ornaments'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function FinalSection() {
  const replay = () => { window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }
  return (
    <section className="final final--lacquer" aria-labelledby="final-title">
      <ParallaxLayer className="final__parallax" strength={0.024}>
        <WeddingImage {...config.hero} alt="" wrapperClassName="final__image" />
      </ParallaxLayer>
      <div className="final__veil" aria-hidden="true" />
      <FloatingPetals className="final__petals" count={12} tone="mixed" />
      <PeonyCorner className="final__peony final__peony--left" tone="gold" corner="top-left" />
      <PeonyCorner className="final__peony final__peony--right" tone="gold" corner="bottom-right" />
      <EasternCloud className="final__cloud final__cloud--top" tone="champagne" direction="left" />
      <EasternCloud className="final__cloud final__cloud--bottom" tone="champagne" direction="right" />
      <OrientalReveal className="final__content final__ceremonial-frame" variant="scale" threshold={0.14}>
        <GoldReveal className="final__seal-reveal" block>
          <DoubleHappiness className="final__seal" tone="gold" size={112} />
        </GoldReveal>
        <p className="eyebrow">Hẹn ngày chung đôi</p>
        <h2 id="final-title">
          <GoldReveal block delay={120}>
            <span>Hẹn gặp bạn</span>
            <span>trong ngày chung đôi</span>
          </GoldReveal>
        </h2>
        <div className="final__date">
          <span>Ngày thành hôn</span>
          <time dateTime={config.date.iso}>{config.date.display}</time>
          <small>{config.date.lunar}</small>
        </div>
        <p className="final__message">{config.copy.finalMessage}</p>
        <strong className="final__signature">{config.couple.signature}</strong>
        <button type="button" className="text-button text-button--light" onClick={replay}><ArrowUp aria-hidden="true" /> Xem lại từ đầu</button>
      </OrientalReveal>
    </section>
  )
}
