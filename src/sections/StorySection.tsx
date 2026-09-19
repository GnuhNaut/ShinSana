import { useCallback, useState } from 'react'
import { Expand } from 'lucide-react'
import { GalleryLightbox } from '../components/wedding/GalleryLightbox'
import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import type { GalleryChapter, GalleryImage } from '../types/wedding'

interface GalleryEntry {
  photo: GalleryImage
  index: number
}

type GalleryComposition =
  | { type: 'grid'; entries: GalleryEntry[] }
  | { type: 'feature'; entry: GalleryEntry }

function composeChapter(entries: GalleryEntry[]): GalleryComposition[] {
  const composition: GalleryComposition[] = []
  let gridEntries: GalleryEntry[] = []

  const flushGrid = () => {
    if (gridEntries.length === 0) return
    composition.push({ type: 'grid', entries: gridEntries })
    gridEntries = []
  }

  entries.forEach((entry) => {
    if (!entry.photo.featured) {
      gridEntries.push(entry)
      return
    }

    flushGrid()
    composition.push({ type: 'feature', entry })
  })
  flushGrid()

  return composition
}

function GalleryFigure({ entry, onOpen, className = '' }: { entry: GalleryEntry; onOpen: (index: number) => void; className?: string }) {
  const { photo, index } = entry

  return (
    <figure className={'album-grid__item album-grid__item--' + photo.layout + (className ? ' ' + className : '')}>
      <button type="button" onClick={() => onOpen(index)} aria-label={'Mở ảnh: ' + photo.caption}>
        <WeddingImage {...photo} wrapperClassName="album-grid__image" />
        <span className="album-grid__open"><Expand aria-hidden="true" /></span>
      </button>
      <figcaption>
        <span>{String(index + 1).padStart(2, '0')}</span>
        {photo.caption}
      </figcaption>
    </figure>
  )
}

function GalleryChapterSection({ chapter, entries, onOpen }: { chapter: GalleryChapter; entries: GalleryEntry[]; onOpen: (index: number) => void }) {
  const chapterTitleId = 'gallery-chapter-' + chapter.id

  return (
    <section className={'photo-chapter__chapter photo-chapter__chapter--' + chapter.id} aria-labelledby={chapterTitleId}>
      <header className="shell photo-chapter__chapter-header">
        <p className="section-kicker">{chapter.eyebrow}</p>
        <h3 id={chapterTitleId}>{chapter.title}</h3>
        {chapter.lead && <p>{chapter.lead}</p>}
      </header>

      {composeChapter(entries).map((piece, pieceIndex) => (
        piece.type === 'feature' ? (
          <GalleryFigure
            className="photo-chapter__full-bleed"
            entry={piece.entry}
            key={piece.entry.photo.id}
            onOpen={onOpen}
          />
        ) : (
          <div className="shell" key={chapter.id + '-grid-' + pieceIndex}>
            <div className={'album-grid album-grid--' + chapter.id} aria-label={'Chương ảnh: ' + chapter.title}>
              {piece.entries.map((entry) => <GalleryFigure entry={entry} key={entry.photo.id} onOpen={onOpen} />)}
            </div>
          </div>
        )
      ))}
    </section>
  )
}

export function StorySection() {
  const config = useWeddingConfig()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeLightbox = useCallback(() => setActiveIndex(null), [])
  const entriesByChapter = new Map(config.galleryChapters.map((chapter) => [chapter.id, [] as GalleryEntry[]]))

  config.gallery.forEach((photo, index) => entriesByChapter.get(photo.chapter)?.push({ photo, index }))

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

      {config.galleryChapters.map((chapter) => {
        const entries = entriesByChapter.get(chapter.id) ?? []
        return entries.length > 0 ? <GalleryChapterSection chapter={chapter} entries={entries} key={chapter.id} onOpen={setActiveIndex} /> : null
      })}

      <GalleryLightbox images={config.gallery} activeIndex={activeIndex} onChange={setActiveIndex} onClose={closeLightbox} />
    </section>
  )
}
