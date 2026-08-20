import { lazy, Suspense, useMemo, useRef, useState } from 'react'
import { CoverSection } from './sections/CoverSection'
import { weddingConfig as config } from './config/wedding'
import { getGuestNameFromUrl, getGuestSideFromUrl } from './utils/guest'

const InvitationPageSection = lazy(() => import('./sections/InvitationPageSection').then((module) => ({ default: module.InvitationPageSection })))
const CeremonySection = lazy(() => import('./sections/CeremonySection').then((module) => ({ default: module.CeremonySection })))
const StorySection = lazy(() => import('./sections/StorySection').then((module) => ({ default: module.StorySection })))
const RSVPSection = lazy(() => import('./sections/RSVPSection').then((module) => ({ default: module.RSVPSection })))
const FinaleSection = lazy(() => import('./sections/FinaleSection').then((module) => ({ default: module.FinaleSection })))
const FloatingControls = lazy(() => import('./components/wedding/FloatingControls').then((module) => ({ default: module.FloatingControls })))

export default function App() {
  const [opened, setOpened] = useState(false)
  const invitationRef = useRef<HTMLElement>(null)
  const guestName = useMemo(() => config.features.personalizedGuest ? getGuestNameFromUrl() : null, [])
  const guestSide = useMemo(() => getGuestSideFromUrl(), [])

  const completeOpening = () => {
    setOpened(true)
    window.setTimeout(() => invitationRef.current?.focus(), 30)
  }

  return (
    <>
      {opened && <a className="skip-link" href="#wedding-day">Bỏ qua đến ngày cưới</a>}
      {!opened && <CoverSection onOpened={completeOpening} />}
      <div className="site" aria-hidden={!opened} inert={!opened}>
        {opened && (
          <main id="invitation-content" ref={invitationRef} tabIndex={-1} aria-label="Nội dung thiệp cưới">
            <Suspense fallback={<p className="opening-fallback" role="status">Đang mở lời mời…</p>}>
              <InvitationPageSection guestName={guestName} />
              <CeremonySection side={guestSide} />
              <StorySection />
              <RSVPSection guestName={guestName} />
              <FinaleSection />
              <FloatingControls />
            </Suspense>
          </main>
        )}
      </div>
    </>
  )
}
