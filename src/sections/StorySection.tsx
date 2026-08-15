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
  const enableGallery = config.features.gallery && config.gallery.length > 0
  const chapters = config.story.slice(0, 3)
  const gallery = enableGallery ? config.gallery.slice(0, 6) : []
  const quote = config.copy.storyQuote || 'Có những khoảnh khắc chỉ cần được nhìn thấy, không cần được giải thích.'

  const handleExpand = (imageId: string) => {
    if (!enableGallery) return
    const index = config.gallery.findIndex((image) => image.id === imageId)
    if (index >= 0) setActiveIndex(index)
  }

  return (
    <section className="album" aria-labelledby="album-title">
      <FloralCorner className="album__floral album__floral--top" corner="top-right" tone="rose" variant="trail" />
      <FloralCorner className="album__floral album__floral--bottom" corner="bottom-left" tone="rose" variant="trail" />

      <div className="container">
        <OrientalReveal className="album__header" variant="up">
          <p className="eyebrow">Chuyện chúng mình</p>
          <h2 id="album-title" className="album__title">Album ngày chung đôi</h2>
          <p className="album__intro">
            Một vài khoảnh khắc trên hành trình từ hai người xa lạ trở thành một đôi.
          </p>
          <HairlineDivider className="album__divider" center="diamond" tone="rose" />
        </OrientalReveal>

        <div className="album__layout">
          {chapters.length > 0 && (
            <article className="album__block album__block--lead">
              <MaskReveal className="album__frame album__frame--tilt-l" variant="up">
                <WeddingImage {...chapters[0]!.image} />
              </MaskReveal>
              <OrientalReveal className="album__block-content" variant="right" delay={120}>
                <p className="album__caption"><span>{chapters[0]!.chapter}</span><span>{chapters[0]!.title}</span></p>
                <p className="album__block-copy">{chapters[0]!.description}</p>
              </OrientalReveal>
            </article>
          )}

          {chapters.length > 1 && (
            <article className="album__block album__block--pair">
              <OrientalReveal className="album__block-content" variant="left">
                <p className="album__caption"><span>{chapters[1]!.chapter}</span><span>{chapters[1]!.title}</span></p>
                <p className="album__block-copy">{chapters[1]!.description}</p>
              </OrientalReveal>
              <MaskReveal className="album__frame album__frame--tilt-r" variant="up" delay={120}>
                <WeddingImage {...chapters[1]!.image} />
              </MaskReveal>
            </article>
          )}

          {quote && (
            <OrientalReveal className="album__block album__block--quote" variant="up">
              <p>{quote}</p>
            </OrientalReveal>
          )}

          {chapters.length > 2 && (
            <article className="album__block album__block--landscape">
              <MaskReveal className="album__frame album__frame--tilt-l" variant="up">
                <WeddingImage {...chapters[2]!.image} />
              </MaskReveal>
              <OrientalReveal className="album__block-content" variant="right" delay={120}>
                <p className="album__caption"><span>{chapters[2]!.chapter}</span><span>{chapters[2]!.title}</span></p>
                <p className="album__block-copy">{chapters[2]!.description}</p>
              </OrientalReveal>
            </article>
          )}

          {enableGallery && (
            <OrientalReveal className="album__gallery" variant="up">
              {gallery.map((image, index) => (
                <div className={`album__frame album__frame--paper album__frame--${index % 2 === 0 ? 'tilt-l' : 'tilt-r'}`} key={image.id}>
                  <button
                    type="button"
                    className="album__frame-button"
                    onClick={() => handleExpand(image.id)}
                    aria-label={`Mở ảnh: ${image.alt}`}
                  >
                    <WeddingImage {...image} />
                    <span className="album__frame-expand"><Expand aria-hidden="true" /></span>
                  </button>
                  <p className="album__caption"><span>{String(index + 1).padStart(2, '0')}</span><span>{image.caption}</span></p>
                </div>
              ))}
            </OrientalReveal>
          )}
        </div>
      </div>
      <GalleryLightbox images={config.gallery} activeIndex={activeIndex} onChange={setActiveIndex} onClose={closeLightbox} />
    </section>
  )
}
