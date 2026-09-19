import { WeddingImage } from '../components/ui/WeddingImage'
import { useWeddingConfig } from '../config/WeddingConfigContext'

interface InvitationPageSectionProps {
  guestName: string | null
}

export function InvitationPageSection({ guestName }: InvitationPageSectionProps) {
  const config = useWeddingConfig()
  const bridePortrait = config.gallery.find((image) => image.id === '02-mai-portrait')
  const groomPortrait = config.gallery.find((image) => image.id === '03-hung-portrait')

  return (
    <section className="invitation" aria-labelledby="invitation-title">
      <div className="shell invitation__grid">
        <div className="invitation__copy">
          <p className="section-kicker">{config.content.invitationEyebrow}</p>
          <p className="invitation__mark" aria-hidden="true">{config.couple.monogram}</p>
          {guestName && (
            <p className="invitation__guest">
              <span>Thân mời</span>
              <strong>{guestName}</strong>
            </p>
          )}
          <h2 id="invitation-title">{config.content.invitationTitle}</h2>
          <p>{config.content.invitationBody}</p>
          <div className="invitation__signature">
            <strong>{config.couple.groom}</strong>
            <i>&amp;</i>
            <strong>{config.couple.bride}</strong>
          </div>
          <a className="text-link" href="#locations">Xem thông tin buổi lễ <span aria-hidden="true">↓</span></a>
        </div>

        <div className="invitation__portraits" aria-label="Ảnh cưới của cô dâu và chú rể">
          {groomPortrait && <WeddingImage {...groomPortrait} wrapperClassName="invitation__portrait invitation__portrait--groom" />}
          {bridePortrait && <WeddingImage {...bridePortrait} wrapperClassName="invitation__portrait invitation__portrait--bride" />}
        </div>
      </div>
    </section>
  )
}
