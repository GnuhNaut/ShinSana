import { MapPin } from 'lucide-react'
import { OrientalReveal } from '../components/motion'
import { DoubleHappiness, FloralCorner, HairlineDivider } from '../components/ornaments'
import { useWeddingConfig } from '../config/WeddingConfigContext'
import type { WeddingFamily } from '../types/wedding'
import { familyHasMeaningfulDetails } from '../utils/ceremony'

interface InvitationPageSectionProps {
  guestName: string | null
}

function FamilyColumn({
  defaultLabel,
  family,
}: {
  defaultLabel: string
  family: WeddingFamily
}) {
  if (!familyHasMeaningfulDetails(family)) return null

  const label = family.label?.trim() || defaultLabel
  const hasParents = Boolean(family.father?.trim() || family.mother?.trim())

  return (
    <div className="invite__family">
      <p>{label}</p>
      {hasParents && (
        <dl>
          {family.father?.trim() && <div><dt>Ông</dt><dd>{family.father}</dd></div>}
          {family.mother?.trim() && <div><dt>Bà</dt><dd>{family.mother}</dd></div>}
        </dl>
      )}
      {family.location?.trim() && (
        <p className="invite__family-location">
          <MapPin aria-hidden="true" />
          <span>{family.location}</span>
        </p>
      )}
    </div>
  )
}

export function InvitationPageSection({ guestName }: InvitationPageSectionProps) {
  const config = useWeddingConfig()
  const showPersonalized = config.features.personalizedGuest && Boolean(guestName)
  const groomFamilyVisible = familyHasMeaningfulDetails(config.families.groom)
  const brideFamilyVisible = familyHasMeaningfulDetails(config.families.bride)
  const visibleFamilyCount = Number(groomFamilyVisible) + Number(brideFamilyVisible)

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

          {visibleFamilyCount > 0 && (
            <OrientalReveal
              className={`invite__families${visibleFamilyCount === 1 ? ' invite__families--single' : ''}`}
              variant="fade"
              delay={80}
            >
              <FamilyColumn defaultLabel="Nhà Trai" family={config.families.groom} />
              <FamilyColumn defaultLabel="Nhà Gái" family={config.families.bride} />
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

          <HairlineDivider className="invite__divider" center="star" tone="rose" />

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
