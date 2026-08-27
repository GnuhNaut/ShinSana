import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { CalendarPlus, Check, CircleParking, Copy, MapPin, Phone } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { FloralCorner, HairlineDivider } from '../components/ornaments'
import { Countdown } from '../components/wedding/Countdown'
import { WeddingCalendar } from '../components/wedding/WeddingCalendar'
import { MapModal } from '../components/wedding/MapModal'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import type { GuestSide } from '../types/wedding'
import {
  getDisplayableEvents,
  orderEventsForGuest,
  resolveWeddingEvent,
  safeCalendarRange,
  safeExternalUrl,
  safePhoneHref,
  type ResolvedWeddingEvent,
} from '../utils/ceremony'
import { copyPlainText } from '../utils/clipboard'
import { cleanOptionalText } from '../utils/contentSafety'
import { parseIsoDateParts } from '../utils/dateFormat'
import { calendarDataUri } from '../utils/ics'

interface CeremonySectionProps {
  side: GuestSide
}

export function CeremonySection({ side }: CeremonySectionProps) {
  const config = useWeddingConfig()
  const { day, monthIndex, year } = useMemo(() => parseIsoDateParts(config.date.iso), [config.date.iso])
  const events = useMemo(() => (
    orderEventsForGuest(getDisplayableEvents(config), side).map(resolveWeddingEvent)
  ), [config, side])
  const mainCalendarRange = safeCalendarRange(config.date.eventStartIso, config.date.eventEndIso)
  const calendarHref = calendarDataUri({
    title: `Đám cưới ${config.couple.groom.fullName} & ${config.couple.bride.fullName}`,
    date: config.date.iso,
    description: config.seo.description,
    startIso: mainCalendarRange?.startIso,
    endIso: mainCalendarRange?.endIso,
  })
  const eventGridVariant = events.length === 1
    ? 'single'
    : events.length === 2
      ? 'double'
      : 'multiple'

  return (
    <section className="wedding-day" id="wedding-day" aria-labelledby="wedding-day-title">
      <FloralCorner className="wedding-day__ornament" corner="top-right" tone="rose" variant="wreath" />
      <div className="container">
        <OrientalReveal className="wedding-day__header" variant="up">
          <p className="eyebrow">Save the date</p>
          <h2 id="wedding-day-title">Ngày mình chung đôi</h2>
          <p>Một ngày thật đặc biệt, mong được sẻ chia cùng những người chúng mình yêu quý.</p>
          <HairlineDivider className="wedding-day__divider" center="star" tone="rose" />
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
              <p className="eyebrow">{config.copy.ceremonyTitle}</p>
              <h3 id="events-title">Hẹn bạn tại ngày vui</h3>
            </div>
            <div className={`events__grid events__grid--${eventGridVariant} events__grid--count-${events.length}`}>
              {events.map((event, index) => (
                <OrientalReveal variant={index % 2 === 0 ? 'left' : 'right'} delay={index * 80} key={event.id}>
                  <EventCard event={event} />
                </OrientalReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function EventCard({ event }: { event: ResolvedWeddingEvent }) {
  const config = useWeddingConfig()
  const headingId = useId()
  const eyebrow = cleanOptionalText(event.eyebrow)
  const lunarDate = cleanOptionalText(event.lunarDate)
  const guestArrivalTime = cleanOptionalText(event.guestArrivalTime)
  const ceremonyTime = cleanOptionalText(event.ceremonyTime)
  const receptionTime = cleanOptionalText(event.receptionTime)
  const venueName = cleanOptionalText(event.venueName)
  const address = cleanOptionalText(event.address)
  const parkingNote = cleanOptionalText(event.parkingNote)
  const contactName = cleanOptionalText(event.contactName)
  const contactPhone = cleanOptionalText(event.contactPhone)
  const mapUrl = safeExternalUrl(event.mapUrl)
  const mapEmbedUrl = safeExternalUrl(event.mapEmbedUrl)
  const phoneHref = safePhoneHref(contactPhone)
  const dateParts = event.date ? parseEventDate(event.date) : null
  const hasTimedCalendar = Boolean(
    dateParts
    && event.calendar.startIso
    && event.calendar.endIso,
  )
  const eventCalendarHref = hasTimedCalendar && event.date
    ? calendarDataUri({
        title: event.title,
        date: event.date,
        description: config.seo.description,
        location: address || venueName || undefined,
        startIso: event.calendar.startIso,
        endIso: event.calendar.endIso,
      })
    : ''
  const { copyStatus, handleCopy } = useCopyFeedback(address)
  const [mapOpen, setMapOpen] = useState(false)
  const hasEventRows = Boolean(
    lunarDate
    || guestArrivalTime
    || ceremonyTime
    || receptionTime
    || venueName
    || address
    || parkingNote
    || contactName
    || phoneHref,
  )
  const downloadId = event.id.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'event'

  return (
    <article className="event-card" aria-labelledby={headingId}>
      <header className="event-card__head">
        {eyebrow && <p className="event-card__label">{eyebrow}</p>}
        <h4 className="event-card__title" id={headingId}>{event.title}</h4>
      </header>

      {dateParts && (
        <time className="event-card__date" dateTime={event.date}>
          <span className="event-card__date-day">{dateParts.day}</span>
          <span className="event-card__date-rest">
            <strong>Tháng {dateParts.month}</strong>
            <span>{dateParts.year}</span>
            {event.weekday && <small>{event.weekday}</small>}
          </span>
        </time>
      )}

      {hasEventRows && (
        <dl className="event-card__list">
          {lunarDate && <EventRow label="Âm lịch">{lunarDate}</EventRow>}
          {guestArrivalTime && <EventRow label="Đón khách"><strong>{guestArrivalTime}</strong></EventRow>}
          {ceremonyTime && <EventRow label="Làm lễ"><strong>{ceremonyTime}</strong></EventRow>}
          {receptionTime && <EventRow label="Khai tiệc"><strong>{receptionTime}</strong></EventRow>}
          {(venueName || address) && (
            <EventRow label="Tại">
              {venueName && <strong>{venueName}</strong>}
              {address && <address>{address}</address>}
            </EventRow>
          )}
          {parkingNote && (
            <EventRow label="Gửi xe">
              <span className="event-card__note"><CircleParking aria-hidden="true" />{parkingNote}</span>
            </EventRow>
          )}
          {(contactName || phoneHref) && (
            <EventRow label="Liên hệ">
              {contactName && <strong>{contactName}</strong>}
              {phoneHref && <a href={phoneHref}>{contactPhone}</a>}
            </EventRow>
          )}
        </dl>
      )}

      {(mapUrl || address || phoneHref || eventCalendarHref) && (
        <div className="event-card__actions">
          {mapEmbedUrl ? (
            <button className="button button--primary" type="button" onClick={() => setMapOpen(true)}>
              <MapPin aria-hidden="true" /> Chỉ đường
            </button>
          ) : mapUrl ? (
            <a className="button button--primary" href={mapUrl} target="_blank" rel="noopener noreferrer">
              <MapPin aria-hidden="true" /> Chỉ đường
            </a>
          ) : null}
          {address && (
            <button className="button button--quiet" type="button" onClick={handleCopy}>
              {copyStatus === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copyStatus === 'copied' ? 'Đã sao chép' : 'Sao chép địa chỉ'}
            </button>
          )}
          {phoneHref && (
            <a className="button button--outline" href={phoneHref}>
              <Phone aria-hidden="true" /> Gọi
            </a>
          )}
          {eventCalendarHref && (
            <a className="button button--outline" href={eventCalendarHref} download={`wedding-${downloadId}.ics`}>
              <CalendarPlus aria-hidden="true" /> Lưu ngày cưới
            </a>
          )}
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copyStatus === 'copied' ? 'Đã sao chép địa chỉ' : copyStatus === 'failed' ? 'Không thể sao chép địa chỉ' : ''}
      </span>
      <MapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        title={venueName || event.title}
        address={address}
        mapUrl={mapUrl}
        mapEmbedUrl={mapEmbedUrl}
      />
    </article>
  )
}

function EventRow({ label, children }: { label: string; children: ReactNode }) {
  return <div className="event-card__row"><dt>{label}</dt><dd>{children}</dd></div>
}

function parseEventDate(value: string): { day: number; month: number; year: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match.map(Number)
  if (!year || !month || !day) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null
  return { day, month, year }
}

type CopyStatus = 'idle' | 'copied' | 'failed'

function useCopyFeedback(value: string) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle')
  const resetTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
  }, [])

  const handleCopy = async () => {
    const copied = await copyPlainText(value)
    setCopyStatus(copied ? 'copied' : 'failed')
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopyStatus('idle'), 2400)
  }

  return { copyStatus, handleCopy }
}
