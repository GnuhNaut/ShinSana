import { MaskReveal, OrientalReveal } from '../components/motion'
import { DongSonDivider, RedThread } from '../components/ornaments'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function StorySection() {
  return (
    <section className="story section" aria-labelledby="story-title">
      <div className="container">
        <OrientalReveal>
          <SectionHeading id="story-title" eyebrow="Our Love Story" eyebrowLang="en" title="Chuyện chúng mình" description={config.copy.storyIntro} />
        </OrientalReveal>
      </div>
      <div className="story__journey">
        <RedThread className="story__thread" />
        <div className="story__chapters">
          {config.story.map((item, index) => (
            <article className={`story-chapter story-chapter--${index % 2 === 0 ? 'odd' : 'even'}`} key={item.chapter}>
              <div className="container story-chapter__inner">
                <MaskReveal className="story-chapter__image" direction={index % 2 === 0 ? 'left' : 'right'} veilColor={index === 1 ? 'var(--color-accent)' : 'var(--color-primary)'}>
                  <div className="story-chapter__mount"><WeddingImage {...item.image} /></div>
                </MaskReveal>
                <OrientalReveal className="story-chapter__content" variant={index % 2 === 0 ? 'left' : 'right'}>
                  <div className="story-chapter__meta"><span>{item.chapter}</span><span>{item.year}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </OrientalReveal>
                <span className="story-chapter__marker" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              </div>
            </article>
          ))}
        </div>
        <DongSonDivider className="story__divider" tone="red" center="diamond" />
      </div>
    </section>
  )
}
