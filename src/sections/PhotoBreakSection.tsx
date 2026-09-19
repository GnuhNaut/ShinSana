import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'

/** A single full-bleed pause between ceremony details and the album. */
export function PhotoBreakSection() {
  const config = useWeddingConfig()
  const image = config.gallery.find((photo) => photo.featured) ?? config.gallery[0]

  if (!image) return null

  return (
    <section className="photo-break" aria-label="Khoảnh khắc trong ngày cưới">
      <WeddingImage {...image} wrapperClassName="photo-break__image" />
      <div className="photo-break__veil" aria-hidden="true" />
      <p className="photo-break__caption">{image.caption}</p>
      <blockquote className="photo-break__quote">
        <span aria-hidden="true">“</span>
        <p>{config.content.storyQuote}</p>
      </blockquote>
    </section>
  )
}
