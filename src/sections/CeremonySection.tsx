import { useMemo, type ReactNode } from 'react'
import { CalendarPlus, MapPin, Phone } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { FloralCorner, HairlineDivider } from '../components/ornaments'
import { Countdown } from '../components/wedding/Countdown'
import { WeddingCalendar } from '../components/wedding/WeddingCalendar'
import { weddingConfig as config } from '../config/wedding'
import type { GuestSide } from '../types/wedding'
import {
  ceremonyTitle,
  eventHasMeaningfulDetails,
  getEnabledEvents,
  orderEventsForGuest,
  resolveCeremony,
  safeExternalUrl,
  type ResolvedCeremony,
} from '../utils/ceremony'
import { parseIsoDateParts } from '../utils/dateFormat'
import { calendarDataUri } from '../utils/ics'

interface CeremonySectionProps {
  side: GuestSide
}

export function CeremonySection({ side }: CeremonySectionProps) {
  const { day, monthIndex, year } = useMemo(() => parseIsoDateParts(config.date.iso), [])
  const events = useMemo(() => (
    orderEventsForGuest(getEnabledEvents(config).filter(eventHasMeaningfulDetails), side)
      .map((event) => resolveCeremony(config, event))
  ), [side])
  const calendarHref = calendarDataUri({
    title: `Đám cưới ${config.couple.groom.fullName} & ${config.couple.bride.fullName}`,
    date: config.date.iso,
    description: config.seo.description,
    startIso: config.date.eventStartIso || undefined,
    endIso: config.date.eventEndIso || undefined,
  })

  return (
    <section className="wedding-day" id="wedding-day" aria-labelledby="wedding-day-title">
      <FloralCorner className="wedding-day__ornament" corner="top-right" tone="rose" variant="wreath" />
      <div className="container">
        <OrientalReveal className="wedding-day__header" variant="up">
          <p className="eyebrow">Save the date</p>
          <h2 id="wedding-day-title">Ngày mình chung đôi</h2>
          <p>Một ngày thật đặc biệt, mong được sẻ chia cùng những người chúng mình yêu quý.</p>
          <HairlineDivider className="wedding-day__divider" center="diamond" tone="rose" />
        </OrientalReveal>

        <div className="wedding-day__primary">
          <OrientalReveal className="wedding-day__date" variant="left">
            <div className="wedding-day__date-lockup">
              <span className="wedding-day__day">{day}</span>
              <span className="wedding-day__month">
                <strong>Tháng {monthIndex + 1}</strong>
                <span>{year}</span>
              </span>
            </div>
            <p className="wedding-day__lunar">Tức ngày {config.date.lunar}</p>
            <p className="wedding-day__countdown-label">Còn</p>
            <Countdown target={config.date.countdownIso} compact />
            <div className="wedding-day__actions">
              <a className="button button--primary" href={calendarHref} download={`wedding-${config.date.iso}.ics`}>
                <CalendarPlus aria-hidden="true" /> Thêm vào lịch
              </a>
            </div>
          </OrientalReveal>

          <OrientalReveal variant="right" delay={100}>
            <WeddingCalendar isoDate={config.date.iso} />
          </OrientalReveal>
        </div>

        {events.length > 0 && (
          <div className="wedding-day__events" aria-labelledby="events-title">
            <div className="wedding-day__events-header">
              <p className="eyebrow">Thông tin buổi lễ</p>
              <h3 id="events-title">Hẹn bạn tại ngày vui</h3>
            </div>
            <div className={`events__grid events__grid--${events.length === 1 ? 'single' : 'multiple'}`}>
              {events.map((event, index) => (
                <OrientalReveal variant={index % 2 === 0 ? 'left' : 'right'} delay={index * 100} key={event.id}>
                  <EventCard ceremony={event} />
                </OrientalReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function EventCard({ ceremony }: { ceremony: ResolvedCeremony }) {
  const mapNavigationUrl = safeExternalUrl(ceremony.mapNavigationUrl)
  const mapEmbedUrl = safeExternalUrl(ceremony.mapEmbedUrl)
  const title = ceremonyTitle(ceremony) || ceremony.label || 'Buổi lễ'
  const dateDay = ceremony.date ? Number(ceremony.date.split('-')[2]) : null
  const phoneHref = ceremony.phone ? `tel:${ceremony.phone.replace(/[^+\d]/g, '')}` : ''
  const calendarHref = ceremony.date ? calendarDataUri({
    title,
    date: ceremony.date,
    description: config.seo.description,
    location: ceremony.address || ceremony.venueName || undefined,
    startIso: ceremony.calendar.startIso || undefined,
    endIso: ceremony.calendar.endIso || undefined,
  }) : ''

  return (
    <article className="event-card" aria-labelledby={`event-${ceremony.id}-title`}>
      <header className="event-card__head">
        {ceremony.label && <p className="event-card__label">{ceremony.label}</p>}
        <h4 className="event-card__title" id={`event-${ceremony.id}-title`}>{title}</h4>
      </header>

      {ceremony.date && (
        <div className="event-card__date">
          <time className="event-card__date-day" dateTime={ceremony.date}>{dateDay}</time>
          <span className="event-card__date-rest">{ceremony.dateDisplayLong}<small>{ceremony.weekday}</small></span>
        </div>
      )}

      <dl className="event-card__list">
        {ceremony.lunarDate && <EventRow label="Âm lịch">{ceremony.lunarDate}</EventRow>}
        {ceremony.guestArrivalTime && <EventRow label="Đón khách">{ceremony.guestArrivalTime}</EventRow>}
        {ceremony.ceremonyTime && <EventRow label="Cử hành lễ">{ceremony.ceremonyTime}</EventRow>}
        {ceremony.banquetTime && <EventRow label="Vào tiệc">{ceremony.banquetTime}</EventRow>}
        {(ceremony.venueName || ceremony.address) && (
          <EventRow label="Địa điểm">
            {ceremony.venueName && <strong>{ceremony.venueName}</strong>}
            {ceremony.address && <span>{ceremony.address}</span>}
          </EventRow>
        )}
        {ceremony.phone && <EventRow label="Liên hệ"><a href={phoneHref}>{ceremony.phone}</a></EventRow>}
      </dl>

      {mapEmbedUrl && (
        <iframe
          className="event-card__iframe"
          src={mapEmbedUrl}
          title={`Bản đồ ${ceremony.venueName || title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {(mapNavigationUrl || phoneHref || calendarHref) && (
        <div className="event-card__actions">
          {mapNavigationUrl && (
            <a className="button button--outline" href={mapNavigationUrl} target="_blank" rel="noopener noreferrer">
              <MapPin aria-hidden="true" /> Chỉ đường
            </a>
          )}
          {phoneHref && (
            <a className="button button--outline" href={phoneHref}>
              <Phone aria-hidden="true" /> Gọi điện
            </a>
          )}
          {calendarHref && (
            <a className="button button--primary" href={calendarHref} download={`wedding-${ceremony.id}.ics`}>
              <CalendarPlus aria-hidden="true" /> Thêm vào lịch
            </a>
          )}
        </div>
      )}
    </article>
  )
}

function EventRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="event-card__row"><dt>{label}</dt><dd>{children}</dd></div>
}
