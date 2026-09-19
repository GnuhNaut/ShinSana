import { ArrowUp } from 'lucide-react'
import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'

export function FinaleSection() {
  const config = useWeddingConfig()
  const replay = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <section className="finale" aria-labelledby="finale-title">
      <WeddingImage {...config.hero} wrapperClassName="finale__image" />
      <div className="finale__veil" aria-hidden="true" />
      <div className="finale__content">
        <p className="section-kicker">{config.content.closingEyebrow}</p>
        <p className="finale__mark" aria-hidden="true">{config.couple.monogram}</p>
        <h2 id="finale-title">{config.content.closingTitle}</h2>
        <p>{config.content.closingBody}</p>
        <time dateTime={config.date.iso}>{config.date.displayLong} · {config.date.lunar}</time>
        <button type="button" className="text-link text-link--light" onClick={replay}>
          <ArrowUp aria-hidden="true" /> Xem lại thiệp
        </button>
      </div>
    </section>
  )
}
