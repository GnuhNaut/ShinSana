import { useCallback, useState } from 'react'
import { Expand } from 'lucide-react'
import { GalleryLightbox } from '../components/wedding/GalleryLightbox'
import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'

export function StorySection() {
  const config = useWeddingConfig()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setActiveIndex(null), [])

  if (config.gallery.length === 0) return null

  return (
    <section className="photo-chapter" aria-labelledby="gallery-title">
      <div className="photo-chapter__feature">
        <WeddingImage {...config.hero} wrapperClassName="photo-chapter__feature-image" />
        <div className="photo-chapter__feature-copy">
          <p className="section-kicker">{config.content.storyEyebrow}</p>
          <h2 id="gallery-title">{config.content.storyTitle}</h2>
          <p>{config.content.storyLead}</p>
        </div>
      </div>

      <blockquote className="photo-chapter__quote">
        <span aria-hidden="true">“</span>
        <p>{config.content.storyQuote}</p>
      </blockquote>

      <div className="shell">
        <div className="album-grid" aria-label="Album ảnh cưới">
          {config.gallery.map((photo, index) => (
            <figure className={'album-grid__item album-grid__item--' + photo.layout} key={photo.id}>
              <button type="button" onClick={() => setActiveIndex(index)} aria-label={'Mở ảnh: ' + photo.caption}>
                <WeddingImage {...photo} wrapperClassName="album-grid__image" />
                <span className="album-grid__open"><Expand aria-hidden="true" /></span>
              </button>
              <figcaption>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <GalleryLightbox images={config.gallery} activeIndex={activeIndex} onChange={setActiveIndex} onClose={closeLightbox} />
    </section>
  )
}
