import { GiftExperience } from '../components/wedding/GiftExperience'
import { DecorativeSticker } from '../components/wedding/DecorativeSticker'
import { useWeddingConfig } from '../config/WeddingConfigContext'

/** Kept separate from RSVP so gifting stays an optional, distinct part of the invitation. */
export function GiftSection() {
  const config = useWeddingConfig()
  return (
    <div className="gift-section-wrap">
      <GiftExperience
        gift={config.gift}
        heading={config.copy.giftLabel}
        intro={config.copy.giftIntro}
        ctaLabel={config.copy.giftCta}
      />
      <DecorativeSticker placement="gift" className="gift-section__sticker" />
    </div>
  )
}
