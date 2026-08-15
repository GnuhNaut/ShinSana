import { useCallback, useState } from 'react'
import { Expand } from 'lucide-react'
import { MaskReveal, OrientalReveal } from '../components/motion'
import { DongSonDivider, EasternCloud, PeonyCorner } from '../components/ornaments'
import { GalleryLightbox } from '../components/wedding/GalleryLightbox'
import { SectionHeading } from '../components/ui/SectionHeading'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'

export function GallerySection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setActiveIndex(null), [])
  if (!config.features.gallery || config.gallery.length === 0) return null

  return (
    <section className="gallery section" aria-labelledby="gallery-title">
      <div className="container">
        <OrientalReveal>
          <SectionHeading id="gallery-title" eyebrow="Album ngày chung đôi" title="Khoảnh khắc của chúng mình" light />
        </OrientalReveal>
        <PeonyCorner className="gallery__peony" corner="top-right" tone="champagne" />
        <DongSonDivider className="gallery__divider" tone="champagne" center="diamond" />
        <div className="gallery__grid">
          {config.gallery.map((image, index) => (
            <OrientalReveal className={`gallery-item gallery-item--${image.layout}`} key={image.id} variant={index % 2 === 0 ? 'left' : 'right'}>
              {index === 2 && <blockquote className="gallery__quote">“{config.copy.galleryQuote}”</blockquote>}
              <MaskReveal className="gallery-item__mount" direction={index % 2 === 0 ? 'left' : 'right'} veilColor="var(--color-accent)">
                <button type="button" className="gallery-item__button" onClick={() => setActiveIndex(index)} aria-label={`Mở ảnh: ${image.alt}`}>
                  <WeddingImage {...image} />
                  <span className="gallery-item__expand"><Expand aria-hidden="true" /></span>
                </button>
              </MaskReveal>
              <div className="gallery-item__caption"><span>{String(index + 1).padStart(2, '0')}</span><span>{image.caption}</span></div>
            </OrientalReveal>
          ))}
        </div>
      </div>
      <EasternCloud className="gallery__cloud gallery__cloud--left" direction="left" tone="champagne" />
      <EasternCloud className="gallery__cloud gallery__cloud--right" direction="right" tone="champagne" />
      <GalleryLightbox images={config.gallery} activeIndex={activeIndex} onChange={setActiveIndex} onClose={closeLightbox} />
    </section>
  )
}
