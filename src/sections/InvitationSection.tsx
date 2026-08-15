import { GoldReveal, OrientalReveal } from '../components/motion'
import { DongSonDivider, Lotus, PeonyCorner } from '../components/ornaments'
import { weddingConfig as config } from '../config/wedding'

interface InvitationSectionProps { guestName: string | null }

export function InvitationSection({ guestName }: InvitationSectionProps) {
  const personalized = config.features.personalizedGuest && guestName
  return (
    <section className="invitation section" id="invitation" aria-labelledby="invitation-title">
      <div className="container">
        <OrientalReveal className="invitation__card" variant="scale">
          <span className="invitation__edge invitation__edge--outer" aria-hidden="true" />
          <span className="invitation__edge invitation__edge--inner" aria-hidden="true" />
          <PeonyCorner className="invitation__peony" corner="bottom-right" tone="red" />
          <Lotus className="invitation__lotus" tone="red" withWater={false} />
          <div className="invitation__letter">
            <p className="eyebrow">Lời mời thân tình</p>
            <h2 id="invitation-title">
              {personalized ? <>{config.copy.invitationPersonalized}<br /><GoldReveal tone="inherit"><em>{guestName},</em></GoldReveal></> : config.copy.invitationGeneric}
            </h2>
            <p>{config.copy.invitationBody}</p>
            <DongSonDivider className="invitation__divider" tone="red" center="diamond" />
            <div className="invitation__signature"><span>{config.couple.signature}</span><small>{config.date.display}</small></div>
          </div>
          <p className="invitation__aside" aria-hidden="true">Song duyên · Đồng tâm</p>
        </OrientalReveal>
      </div>
    </section>
  )
}
