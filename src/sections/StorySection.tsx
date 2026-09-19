import { GalleryCoverflow } from '../components/wedding/GalleryCoverflow'
import { useWeddingConfig } from '../config/WeddingConfigContext'

export function StorySection() {
  const config = useWeddingConfig()

  if (config.gallery.length === 0) return null

  return (
    <section className="gallery-showcase" aria-labelledby="gallery-title">
      <header className="shell gallery-showcase__header">
        <div>
          <p className="section-kicker">{config.content.storyEyebrow}</p>
          <h2 id="gallery-title">{config.content.storyTitle}</h2>
        </div>
        <p>{config.content.storyLead}</p>
      </header>
      <GalleryCoverflow images={config.gallery} chapters={config.galleryChapters} />
    </section>
  )
}
