import { useMemo, useRef, useState } from 'react'
import { FloatingControls } from './components/wedding/FloatingControls'
import { CoverSection } from './sections/CoverSection'
import { InvitationPageSection } from './sections/InvitationPageSection'
import { CeremonySection } from './sections/CeremonySection'
import { StorySection } from './sections/StorySection'
import { RSVPSection } from './sections/RSVPSection'
import { FinaleSection } from './sections/FinaleSection'
import { weddingConfig as config } from './config/wedding'
import { getGuestNameFromUrl, getGuestSideFromUrl } from './utils/guest'

export default function App() {
  const [opened, setOpened] = useState(false)
  const heroHeadingRef = useRef<HTMLHeadingElement>(null)
  const guestName = useMemo(() => config.features.personalizedGuest ? getGuestNameFromUrl() : null, [])
  const guestSide = useMemo(() => getGuestSideFromUrl(), [])

  const completeOpening = () => {
    setOpened(true)
    window.setTimeout(() => heroHeadingRef.current?.focus(), 30)
  }

  return (
    <>
      {opened && <a className="skip-link" href="#ceremony">Bỏ qua lời mời</a>}
      {!opened && <CoverSection onOpened={completeOpening} />}
      <div className="site" aria-hidden={!opened} inert={!opened}>
        {opened && (
          <main>
            <h2 ref={heroHeadingRef} className="sr-only" tabIndex={-1}>Lời mời của {config.couple.groom.fullName} và {config.couple.bride.fullName}</h2>
            <InvitationPageSection guestName={guestName} />
            <CeremonySection side={guestSide} />
            <StorySection />
            <RSVPSection guestName={guestName} side={guestSide} />
            <FinaleSection />
          </main>
        )}
        <FloatingControls />
      </div>
    </>
  )
}
