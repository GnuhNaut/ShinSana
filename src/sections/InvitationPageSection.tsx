import { OrientalReveal } from '../components/motion'
import { DoubleHappiness, FloralCorner, HairlineDivider } from '../components/ornaments'
import { weddingConfig as config } from '../config/wedding'

interface InvitationPageSectionProps {
  guestName: string | null
}

interface ParentDetails {
  father: string
  mother: string
}

function FamilyColumn({ label, family }: { label: string; family: ParentDetails }) {
  if (!family.father && !family.mother) return null
  return (
    <div className="invite__family">
      <p>{label}</p>
      <dl>
        {family.father && <div><dt>Ông</dt><dd>{family.father}</dd></div>}
        {family.mother && <div><dt>Bà</dt><dd>{family.mother}</dd></div>}
      </dl>
    </div>
  )
}

export function InvitationPageSection({ guestName }: InvitationPageSectionProps) {
  const showPersonalized = config.features.personalizedGuest && Boolean(guestName)
  const hasFamilies = Boolean(
    config.families.groomParents.father ||
    config.families.groomParents.mother ||
    config.families.brideParents.father ||
    config.families.brideParents.mother,
  )

  return (
    <section className="invite" aria-labelledby="invite-title">
      <FloralCorner className="invite__floral invite__floral--top" corner="top-left" tone="rose" variant="trail" />
      <FloralCorner className="invite__floral invite__floral--bottom" corner="bottom-right" tone="rose" variant="trail" />

      <div className="container invite__container">
        <article className="invite__paper">
          <OrientalReveal className="invite__intro" variant="up">
            <DoubleHappiness className="invite__seal" tone="primary" size="3rem" />
            <p className="invite__eyebrow">Lời kính mời</p>
            <p className="invite__salutation">
              {showPersonalized ? <>Trân trọng kính mời <strong>{guestName}</strong></> : config.copy.invitationGeneric}
            </p>
            <p className="invite__body">{config.copy.invitationBody}</p>
          </OrientalReveal>

          {hasFamilies && (
            <OrientalReveal className="invite__families" variant="fade" delay={80}>
              <FamilyColumn label="Nhà Trai" family={config.families.groomParents} />
              <FamilyColumn label="Nhà Gái" family={config.families.brideParents} />
            </OrientalReveal>
          )}

          <OrientalReveal variant="up" delay={120}>
            <h1 className="invite__names" id="invite-title" aria-label={`${config.couple.groom.fullName} và ${config.couple.bride.fullName}`}>
              <span>{config.couple.groom.fullName}</span>
              <i>&amp;</i>
              <span>{config.couple.bride.fullName}</span>
            </h1>
            <p className="invite__roles">
              <span>{config.couple.groom.role}</span>
              <span aria-hidden="true">•</span>
              <span>{config.couple.bride.role}</span>
            </p>
          </OrientalReveal>

          <HairlineDivider className="invite__divider" center="diamond" tone="rose" />

          <OrientalReveal className="invite__date" variant="up" delay={180}>
            <time dateTime={config.date.iso}>{config.date.display.replaceAll('.', ' · ')}</time>
            <span>{config.date.lunar}</span>
          </OrientalReveal>

          <a className="text-button invite__continue" href="#wedding-day">Xem ngày vui</a>
        </article>
      </div>
    </section>
  )
}
