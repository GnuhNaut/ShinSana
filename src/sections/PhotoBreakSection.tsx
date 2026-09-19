import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'

/** A full-bleed photographic pause between ceremony details and the album. */
export function PhotoBreakSection() {
  const config = useWeddingConfig()
  const image = config.gallery.find((photo) => photo.featured) ?? config.gallery[0]

  if (!image) return null

  return (
    <section className="photo-break" aria-label="Khoảnh khắc trong ngày cưới">
      <WeddingImage {...image} wrapperClassName="photo-break__image" />
      <div className="photo-break__veil" aria-hidden="true" />
      <p className="photo-break__caption">{image.caption}</p>
    </section>
  )
}
