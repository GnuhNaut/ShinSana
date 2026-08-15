import { useMemo } from 'react'
import { CalendarPlus, MapPin } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { FloralCorner, HairlineDivider, Lotus } from '../components/ornaments'
import { weddingConfig as config } from '../config/wedding'
import { type GuestSide } from '../types/wedding'
import { ceremonyTitle, resolveCeremony, safeExternalUrl } from '../utils/ceremony'
import { calendarDataUri } from '../utils/ics'

interface CeremonySectionProps {
  side: GuestSide
}

export function CeremonySection({ side }: CeremonySectionProps) {
  const bride = useMemo(() => resolveCeremony(config, 'brideSide'), [])
  const groom = useMemo(() => resolveCeremony(config, 'groomSide'), [])

  const ordered = useMemo(() => {
    if (side === 'groom') return [groom, bride]
    if (side === 'bride') return [bride, groom]
    return [groom, bride]
  }, [bride, groom, side])

  return (
    <section className="events" id="ceremony" aria-labelledby="events-title">
      <FloralCorner className="events__floral events__floral--top" corner="top-left" tone="rose" variant="trail" />
      <FloralCorner className="events__floral events__floral--bottom" corner="bottom-right" tone="rose" variant="trail" />

      <div className="container">
        <OrientalReveal className="events__header" variant="up">
          <p className="eyebrow">Ngày vui của chúng mình</p>
          <h2 id="events-title" className="events__title">Hai lễ cưới, một hành trình</h2>
          <p className="events__intro">
            Mỗi nhà tổ chức một buổi lễ riêng — chung vui một bên hay cả hai đều được, Hùng &amp; Mai đều rất mong được đón tiếp.
          </p>
          <HairlineDivider className="events__divider" center="diamond" tone="rose" />
        </OrientalReveal>

        <div className="events__grid">
          {ordered.map((ceremony, index) => (
            <OrientalReveal
              className={`event-card${isPrimary(ceremony.key, side) ? ' event-card--primary' : ''}`}
              key={ceremony.key}
              variant={index === 0 ? 'left' : 'right'}
              delay={index * 160}
            >
              <EventCard ceremony={ceremony} />
            </OrientalReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function isPrimary(key: 'brideSide' | 'groomSide', side: GuestSide): boolean {
  if (side === 'both') return false
  return (side === 'groom' && key === 'groomSide') || (side === 'bride' && key === 'brideSide')
}

interface EventCardProps {
  ceremony: ReturnType<typeof resolveCeremony>
}

function EventCard({ ceremony }: EventCardProps) {
  const mapNavigationUrl = safeExternalUrl(ceremony.mapNavigationUrl)
  const mapEmbedUrl = safeExternalUrl(ceremony.mapEmbedUrl)
  const title = ceremonyTitle(config, ceremony)
  const calendarHref = calendarDataUri({
    title,
    date: ceremony.date,
    description: config.seo.description,
    location: ceremony.address || undefined,
    startIso: ceremony.calendar.startIso || undefined,
    endIso: ceremony.calendar.endIso || undefined,
  })

  return (
    <article className="event-card" aria-labelledby={`event-${ceremony.key}-title`}>
      <header className="event-card__head">
        <Lotus className="event-card__lotus" tone="rose" withWater={false} size="2.5rem" />
        <p className="event-card__label">{ceremony.label}</p>
        <h3 id={`event-${ceremony.key}-title`} className="event-card__title">{title}</h3>
        <HairlineDivider className="event-card__divider" center="diamond" tone="rose" />
      </header>

      <div className="event-card__date" aria-labelledby={`event-${ceremony.key}-date`}>
        <span className="event-card__date-day">{parseInt(ceremony.date.split('-')[2] ?? '0', 10) || '—'}</span>
        <span className="event-card__date-rest">
          {ceremony.dateDisplayLong}
          {ceremony.weekday && <small>{ceremony.weekday}</small>}
        </span>
      </div>

      <dl className="event-card__list">
        <div className="event-card__row">
          <dt>Âm lịch</dt>
          <dd>{ceremony.lunarDate || config.date.lunar}</dd>
        </div>
        <div className="event-card__row">
          <dt>Giờ</dt>
          <dd>{ceremony.time || '—'}</dd>
        </div>
        <div className="event-card__row">
          <dt>Địa điểm</dt>
          <dd>
            <strong>{ceremony.venueName || (ceremony.address ? ceremony.address : 'Địa điểm sẽ cập nhật')}</strong>
            {ceremony.venueName && ceremony.address && <span>{ceremony.address}</span>}
          </dd>
        </div>
      </dl>

      <div className="event-card__map">
        {mapEmbedUrl ? (
          <iframe
            className="event-card__iframe"
            src={mapEmbedUrl}
            title={`Bản đồ ${ceremony.venueName || ceremony.label}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <>
            <MapPin aria-hidden="true" />
            <span>Bản đồ sẽ hiển thị khi địa điểm được xác nhận.</span>
          </>
        )}
      </div>

      <div className="event-card__actions">
        {mapNavigationUrl ? (
          <a className="button button--outline" href={mapNavigationUrl} target="_blank" rel="noopener noreferrer">
            <MapPin aria-hidden="true" /> Chỉ đường
          </a>
        ) : (
          <button className="button button--outline" type="button" disabled title={config.copy.detailsNote}>
            <MapPin aria-hidden="true" /> Chỉ đường · sẽ cập nhật
          </button>
        )}
        <a className="button button--primary" href={calendarHref} download={`wedding-${ceremony.key}-${ceremony.date}.ics`}>
          <CalendarPlus aria-hidden="true" /> Thêm vào lịch
        </a>
      </div>
    </article>
  )
}
