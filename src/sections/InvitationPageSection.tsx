import { useMemo } from 'react'
import { GoldReveal, OrientalReveal } from '../components/motion'
import { DoubleHappiness, FloralCorner, HairlineDivider } from '../components/ornaments'
import { WeddingImage } from '../components/ui/WeddingImage'
import { weddingConfig as config } from '../config/wedding'
import { getCountdownParts } from '../utils/countdown'
import { parseIsoDateParts } from '../utils/dateFormat'
import { calendarDataUri } from '../utils/ics'

interface InvitationPageSectionProps {
  guestName: string | null
}

export function InvitationPageSection({ guestName }: InvitationPageSectionProps) {
  const showPersonalized = config.features.personalizedGuest && Boolean(guestName)
  const { monthIndex, day: weddingDay } = useMemo(() => parseIsoDateParts(config.date.iso), [])
  const monthName = `Tháng ${monthIndex + 1}`
  const countdown = useMemo(() => getCountdownParts(config.date.countdownIso, new Date()), [])
  const calendarHref = calendarDataUri({
    title: `Đám cưới ${config.couple.groom.fullName} & ${config.couple.bride.fullName}`,
    date: config.date.iso,
    description: config.seo.description,
    location: undefined,
    startIso: config.date.eventStartIso || undefined,
    endIso: config.date.eventEndIso || undefined,
  })

  return (
    <section className="invite" aria-labelledby="invite-title">
      <FloralCorner className="invite__floral invite__floral--top" corner="top-left" tone="rose" variant="trail" />
      <FloralCorner className="invite__floral invite__floral--bottom" corner="bottom-right" tone="rose" variant="trail" />
      <FloralCorner className="invite__floral invite__floral--right" corner="bottom-right" tone="rose" variant="wreath" />

      <div className="invite__composition">
        <OrientalReveal className="invite__kicker" variant="fade">Trân trọng kính mời</OrientalReveal>
        {showPersonalized && (
          <p className="invite__kicker--guest">
            <em>Thân mời</em> <strong>{guestName}</strong>
          </p>
        )}

        <div className="invite__photo-wrap">
          <OrientalReveal className="invite__photo" variant="scale">
            <GoldReveal block>
              <WeddingImage {...config.hero} eager wrapperClassName="invite__photo-image" />
            </GoldReveal>
          </OrientalReveal>
        </div>

        <article className="invite__card">
          <OrientalReveal variant="up">
            <p className="invite__eyebrow">Lễ thành hôn</p>
            <h2 id="invite-title" className="invite__heading">
              Trân trọng kính mời bạn đến chung vui cùng hai người trong ngày trọng đại.
            </h2>
            <HairlineDivider className="invite__divider" center="diamond" tone="rose" />
          </OrientalReveal>

          <OrientalReveal variant="up" delay={120}>
            <p className="invite__names">
              <span className="invite__name">{config.couple.groom.fullName}</span>
              <i className="invite__name-amp">&amp;</i>
              <span className="invite__name">{config.couple.bride.fullName}</span>
            </p>
            <p className="invite__roles">
              <span>{config.couple.groom.role}</span>
              <span aria-hidden="true">•</span>
              <span>{config.couple.bride.role}</span>
            </p>
          </OrientalReveal>

          <OrientalReveal variant="up" delay={200}>
            <div className="invite__date">
              <div className="invite__date-strip">
                <b>{weddingDay}</b>
                <span>{monthName}</span>
                <b>2026</b>
              </div>
              <p className="invite__date-lunar">{config.date.lunar}</p>
            </div>
          </OrientalReveal>

          <OrientalReveal variant="up" delay={260}>
            <p className="invite__countdown">
              <span>Còn</span>
              <span className="invite__countdown-value">{countdown.days}</span>
              <span>ngày</span>
              <span className="invite__countdown-value">{countdown.hours}</span>
              <span>giờ</span>
              <span className="invite__countdown-value">{countdown.minutes}</span>
              <span>phút</span>
              <span>đến ngày chung đôi.</span>
            </p>
            <div className="invite__actions">
              <a className="button button--primary invite__actions-primary" href={calendarHref} download={`wedding-${config.date.iso}.ics`}>
                Thêm vào lịch
              </a>
              <a className="button invite__button--quiet" href="#ceremony">
                Xem địa điểm
              </a>
            </div>
          </OrientalReveal>
        </article>

        <DoubleHappiness className="invite__seal-mark" tone="rose" size="2.75rem" />
      </div>
    </section>
  )
}
