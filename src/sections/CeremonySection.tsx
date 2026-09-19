import { useState } from 'react'
import { CalendarDays, Clock3, Copy, MapPin, Navigation } from 'lucide-react'
import { PeonyLineArt } from '../components/ui/PeonyLineArt'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import type { GuestSide, WeddingLocation } from '../types/wedding'
import { copyPlainText } from '../utils/clipboard'
import { safeExternalUrl } from '../utils/contentSafety'

interface CeremonySectionProps {
  side: GuestSide
}

export function CeremonySection({ side }: CeremonySectionProps) {
  const config = useWeddingConfig()
  const locations = side === 'both'
    ? [config.locations.groom, config.locations.bride]
    : [config.locations[side]]

  return (
    <section className={'ceremony ceremony--' + side} id="locations" aria-labelledby="locations-title">
      <PeonyLineArt className="ceremony__peony" />
      <div className="shell">
        <header className="ceremony__header">
          <p className="section-kicker">{config.content.dateEyebrow}</p>
          <p className="ceremony__date-large"><time dateTime={config.date.iso}>{config.date.display}</time></p>
          <h2>{config.content.dateTitle}</h2>
          <p>{config.content.dateBody}</p>
          <span className="section-rule" aria-hidden="true" />
          <p className="section-kicker">{config.content.locationsEyebrow}</p>
          <h2 id="locations-title">{config.content.locationsTitle}</h2>
          <p>{config.content.locationsBody}</p>
        </header>

        <div className={'location-grid location-grid--' + side}>
          {locations.map((location) => <LocationCard key={location.side} location={location} />)}
        </div>
      </div>
    </section>
  )
}

function LocationCard({ location }: { location: WeddingLocation }) {
  const [copied, setCopied] = useState(false)
  const mapUrl = safeExternalUrl(location.mapUrl)
  const copyAddress = async () => {
    const success = await copyPlainText(location.address)
    setCopied(success)
    if (success) window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <article className={'location-card location-card--' + location.side}>
      <div className="location-card__seal" aria-hidden="true">{location.side === 'groom' ? 'Nhà Trai' : 'Nhà Gái'}</div>
      <header>
        <p>{location.side === 'groom' ? 'Gia đình Nhà Trai' : 'Gia đình Nhà Gái'}</p>
        <h3>{location.title}</h3>
      </header>
      <dl>
        <div>
          <dt><CalendarDays aria-hidden="true" /> Ngày</dt>
          <dd><time dateTime={location.date}>{location.date}</time><small>{location.lunarDate}</small></dd>
        </div>
        <div>
          <dt><Clock3 aria-hidden="true" /> Đón khách</dt>
          <dd>{location.receptionTime}</dd>
        </div>
        <div>
          <dt><Clock3 aria-hidden="true" /> Làm lễ</dt>
          <dd>{location.ceremonyTime}</dd>
        </div>
        <div>
          <dt><MapPin aria-hidden="true" /> Địa điểm</dt>
          <dd>{location.address}</dd>
        </div>
      </dl>
      {location.note && <p className="location-card__note">{location.note}</p>}
      <div className="location-card__actions">
        {mapUrl ? (
          <a className="button button--red" href={mapUrl} target="_blank" rel="noopener noreferrer" data-context-cursor="ĐI">
            <Navigation aria-hidden="true" /> Chỉ đường
          </a>
        ) : (
          <span className="location-card__map-pending"><Navigation aria-hidden="true" /> Bản đồ sẽ cập nhật</span>
        )}
        <button className="button button--line" type="button" onClick={copyAddress}>
          <Copy aria-hidden="true" /> {copied ? 'Đã sao chép' : 'Sao chép địa chỉ'}
        </button>
      </div>
      <span className="sr-only" role="status" aria-live="polite">{copied ? 'Đã sao chép địa chỉ' : ''}</span>
    </article>
  )
}
