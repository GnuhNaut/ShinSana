import { useMemo, useRef, useState } from 'react'
import { FloatingControls } from './components/wedding/FloatingControls'
import { DongSonDivider } from './components/ornaments'
import { CoupleSection } from './sections/CoupleSection'
import { DateSection } from './sections/DateSection'
import { FinalSection } from './sections/FinalSection'
import { GallerySection } from './sections/GallerySection'
import { GiftSection } from './sections/GiftSection'
import { GuestbookSection } from './sections/GuestbookSection'
import { HeroSection } from './sections/HeroSection'
import { InvitationSection } from './sections/InvitationSection'
import { OpeningInvitation } from './sections/OpeningInvitation'
import { RSVPSection } from './sections/RSVPSection'
import { StorySection } from './sections/StorySection'
import { weddingConfig as config } from './config/wedding'
import { getGuestNameFromUrl } from './utils/guest'

export default function App() {
  const [opened, setOpened] = useState(false)
  const heroHeadingRef = useRef<HTMLHeadingElement>(null)
  const guestName = useMemo(() => config.features.personalizedGuest ? getGuestNameFromUrl() : null, [])

  const completeOpening = () => {
    setOpened(true)
    window.setTimeout(() => heroHeadingRef.current?.focus(), 30)
  }

  return (
    <>
      {opened && <a className="skip-link" href="#invitation">Bỏ qua ảnh mở đầu</a>}
      {!opened && <OpeningInvitation onOpened={completeOpening} />}
      <div className="site" aria-hidden={!opened} inert={!opened}>
        <HeroSection ref={heroHeadingRef} />
        {opened && (
          <>
            <main>
              <InvitationSection guestName={guestName} />
              <CoupleSection />
              <StorySection />
              <GallerySection />
              <DateSection />
              <RSVPSection guestName={guestName} />
              <GiftSection />
              <GuestbookSection />
              <FinalSection />
            </main>
            <footer className="footer">
              <div className="container footer__inner">
                <DongSonDivider className="footer__divider" tone="champagne" center="diamond" />
                <p>{config.couple.groom.fullName} &amp; {config.couple.bride.fullName}</p>
                <time dateTime={config.date.iso}>{config.date.display}</time>
              </div>
            </footer>
            <FloatingControls />
          </>
        )}
      </div>
    </>
  )
}
