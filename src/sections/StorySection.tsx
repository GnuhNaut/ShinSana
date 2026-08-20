import { useCallback, useState } from 'react'
import { Expand } from 'lucide-react'
import { MaskReveal, OrientalReveal } from '../components/motion'
import { FloralCorner, HairlineDivider } from '../components/ornaments'
import { GalleryLightbox } from '../components/wedding/GalleryLightbox'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function StorySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setActiveIndex(null), [])
  const gallery = config.features.gallery ? config.gallery.slice(0, 4) : []
  const chapters = config.story.slice(0, 3)

  if (gallery.length === 0 && chapters.length === 0) return null

  const openImage = (id: string) => {
    const index = config.gallery.findIndex((image) => image.id === id)
    if (index >= 0) setActiveIndex(index)
  }

  return (
    <section className="album" aria-labelledby="album-title">
      <FloralCorner className="album__floral" corner="top-right" tone="rose" variant="trail" />
      <div className="container">
        <OrientalReveal className="album__header" variant="up">
          <p className="eyebrow">Chuyện chúng mình</p>
          <h2 id="album-title">Một ngày, một đời thương</h2>
          <p>{config.copy.storyIntro}</p>
          <HairlineDivider className="album__divider" center="diamond" tone="rose" />
        </OrientalReveal>

        {chapters.length > 0 && (
          <ol className="album__story" aria-label="Những dấu mốc của chúng mình">
            {chapters.map((chapter, index) => (
              <OrientalReveal variant="up" delay={index * 80} key={`${chapter.chapter}-${chapter.title}`}>
                <li>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><h3>{chapter.title}</h3><p>{chapter.description}</p></div>
                </li>
              </OrientalReveal>
            ))}
          </ol>
        )}

        {gallery.length > 0 && (
          <div className="album__gallery">
            {gallery.map((photo, index) => (
              <MaskReveal
                className={`album__item album__item--${index + 1}`}
                direction={index % 2 === 0 ? 'left' : 'right'}
                variant="fade"
                delay={index * 70}
                key={photo.id}
              >
                <figure>
                  <button type="button" onClick={() => openImage(photo.id)} aria-label={`Mở ảnh: ${photo.alt}`}>
                    <WeddingImage {...photo} />
                    <span className="album__expand"><Expand aria-hidden="true" /></span>
                  </button>
                  <figcaption><span>{String(index + 1).padStart(2, '0')}</span>{photo.caption}</figcaption>
                </figure>
              </MaskReveal>
            ))}
          </div>
        )}
      </div>

      <GalleryLightbox images={config.gallery} activeIndex={activeIndex} onChange={setActiveIndex} onClose={closeLightbox} />
    </section>
  )
}
