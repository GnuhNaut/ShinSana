import { MaskReveal, OrientalReveal } from '../components/motion'
import { DoubleHappiness, DongSonDivider, Lotus } from '../components/ornaments'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function CoupleSection() {
  const people = [config.couple.groom, config.couple.bride]
  return (
    <section className="couple section" aria-labelledby="couple-title">
      <div className="container">
        <OrientalReveal>
          <SectionHeading id="couple-title" eyebrow="Song hỷ tương phùng" title="Hai người, một lời hẹn" />
        </OrientalReveal>
        <div className="couple__grid">
          {people.map((person, index) => (
            <article className={`couple-card couple-card--${index === 0 ? 'groom' : 'bride'}`} key={person.fullName}>
              <MaskReveal className="couple-card__portrait" direction={index === 0 ? 'left' : 'right'} veilColor="var(--color-primary-dark)">
                <div className="couple-card__frame"><WeddingImage {...person.portrait} /></div>
              </MaskReveal>
              <div className="couple-card__content">
                <p className="eyebrow">{person.role}</p>
                <h3>{person.fullName}</h3>
                <p>{person.introduction}</p>
              </div>
            </article>
          ))}
          <OrientalReveal className="couple__union" variant="scale">
            <DongSonDivider className="couple__rule" tone="red" center="diamond" />
            <DoubleHappiness className="couple__happiness" tone="red" />
            <Lotus className="couple__lotus" tone="gold" withWater={false} />
          </OrientalReveal>
        </div>
      </div>
    </section>
  )
}
