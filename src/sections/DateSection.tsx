import { CalendarPlus, MapPin } from 'lucide-react'
import { GoldReveal, OrientalReveal } from '../components/motion'
import { DongSonDivider, EasternCloud, Lotus, PeonyCorner } from '../components/ornaments'
import { Countdown } from '../components/wedding/Countdown'
import { WeddingCalendar } from '../components/wedding/WeddingCalendar'
import { weddingConfig as config } from '../config/wedding'
import { calendarDataUri } from '../utils/ics'
import { parseIsoDateParts } from '../utils/dateFormat'

function safeExternalUrl(value: string): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

interface CeremonyCardProps {
  ceremony: {
    id: string
    label: string
    dateIso: string
    dateLabel: string
    lunarLabel: string
    venueName: string
    venueAddress: string
    note: string
  }
  mapEmbedUrl: string | null
  mapNavigationUrl: string | null
}

function CeremonyCard({ ceremony, mapEmbedUrl, mapNavigationUrl }: CeremonyCardProps) {
  const venueAvailable = Boolean(ceremony.venueName || ceremony.venueAddress)
  const headingId = `${ceremony.id}-title`

  return (
    <article className="details__ceremony-card" aria-labelledby={headingId}>
      <PeonyCorner className="details__peony details__peony--top" corner="top-left" tone="champagne" />
      <PeonyCorner className="details__peony details__peony--bottom" corner="bottom-right" tone="champagne" />
      <header className="details__intro">
        <Lotus className="details__lotus ornament-foil" tone="champagne" withWater={false} />
        <p className="details__kicker">Trân trọng kính mời</p>
        <p className="details__invitation-line">Đến dự lễ thành hôn của</p>
        <h3 className="details__couple-names" id={headingId}>
          <span>{config.couple.groom.fullName}</span>
          <span aria-hidden="true">&amp;</span>
          <span>{config.couple.bride.fullName}</span>
        </h3>
        <p className="eyebrow">{ceremony.label}</p>
        <DongSonDivider className="details__divider" center="sun" tone="champagne" />
      </header>

      <div className="details__facts">
        <div className="details__fact details__fact--date">
          <span>Ngày chung đôi</span>
          <strong><time dateTime={ceremony.dateIso}>{ceremony.dateLabel}</time></strong>
        </div>
        <div className="details__fact details__fact--lunar">
          <span>Âm lịch</span>
          <strong>{ceremony.lunarLabel}</strong>
        </div>
        <div className="details__fact details__fact--venue">
          <span>Địa điểm</span>
          <strong>{venueAvailable ? ceremony.venueName || ceremony.venueAddress : 'Địa điểm sẽ cập nhật'}</strong>
          {ceremony.venueName && ceremony.venueAddress && <address>{ceremony.venueAddress}</address>}
          <p>{ceremony.note}</p>
          {mapEmbedUrl ? (
            <iframe className="details__map" src={mapEmbedUrl} title={`Bản đồ ${ceremony.venueName || ceremony.venueAddress}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <div className="details__map-placeholder">
              <MapPin aria-hidden="true" />
              <span>Bản đồ sẽ hiển thị khi địa điểm được xác nhận.</span>
            </div>
          )}
          {mapNavigationUrl ? (
            <a className="button button--outline-light" href={mapNavigationUrl} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" /> Chỉ đường</a>
          ) : (
            <button className="button button--outline-light" type="button" disabled title="Địa điểm sẽ cập nhật"><MapPin aria-hidden="true" /> Chỉ đường · sẽ cập nhật</button>
          )}
        </div>
      </div>
    </article>
  )
}

export function DateSection() {
  const { year, monthIndex, day } = parseIsoDateParts(config.date.iso)
  const monthName = `Tháng ${monthIndex + 1}`
  const mapEmbedUrl = safeExternalUrl(config.venue.mapEmbedUrl)
  const mapNavigationUrl = safeExternalUrl(config.venue.mapNavigationUrl)
  const calendarHref = calendarDataUri({
    title: `Đám cưới ${config.couple.groom.fullName} & ${config.couple.bride.fullName}`,
    date: config.date.iso,
    description: config.seo.description,
    location: config.venue.address || undefined,
    startIso: config.date.eventStartIso || undefined,
    endIso: config.date.eventEndIso || undefined,
  })
  const ceremonies: CeremonyCardProps['ceremony'][] = [
    {
      id: 'wedding-ceremony',
      label: 'Hôn lễ',
      dateIso: config.date.iso,
      dateLabel: `${config.date.weekday}, ${config.date.displayLong}`,
      lunarLabel: config.date.lunarLong,
      venueName: config.venue.name,
      venueAddress: config.venue.address,
      note: config.copy.detailsNote,
    },
  ]

  return (
    <section className="date-suite section" id="wedding-details" aria-labelledby="date-title">
      <div className="container date-suite__save-shell">
        <OrientalReveal className="date-suite__lead" variant="up">
          <div className="date-suite__title-lockup">
            <p className="eyebrow" lang="en">Save the date</p>
            <h2 id="date-title">Ngày chung đôi</h2>
            <DongSonDivider className="date-suite__title-divider" center="diamond" tone="red" />
          </div>
          <time className="date-suite__seal" dateTime={config.date.iso}>
            <GoldReveal className="date-suite__number" tone="inherit">{day}</GoldReveal>
          </time>
          <div className="date-suite__month">
            <span>{monthName}</span>
            <span>{year}</span>
            <small>{config.date.lunar}</small>
          </div>
        </OrientalReveal>

        <div className="date-suite__tools">
          <OrientalReveal className="date-suite__calendar-shell" variant="left">
            <WeddingCalendar isoDate={config.date.iso} />
          </OrientalReveal>
          <OrientalReveal className="date-suite__countdown" variant="right" delay={120}>
            <Lotus className="date-suite__countdown-lotus" tone="gold" withWater={false} />
            <p className="eyebrow">Đếm từng khoảnh khắc</p>
            <h3>Cho đến ngày mình chung đôi</h3>
            <Countdown target={config.date.countdownIso} />
            <a className="button button--light" href={calendarHref} download={`wedding-${config.date.iso}.ics`}>
              <CalendarPlus aria-hidden="true" /> Thêm vào lịch
            </a>
          </OrientalReveal>
        </div>
      </div>

      <div className="details details--ceremonial">
        <EasternCloud className="details__cloud details__cloud--left" direction="left" tone="champagne" />
        <EasternCloud className="details__cloud details__cloud--right" direction="right" tone="champagne" />
        <div className="container details__ceremonies">
          {ceremonies.map((ceremony, index) => (
            <OrientalReveal className="details__ceremony-reveal" delay={index * 140} key={ceremony.id} variant="up">
              <CeremonyCard ceremony={ceremony} mapEmbedUrl={mapEmbedUrl} mapNavigationUrl={mapNavigationUrl} />
            </OrientalReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
