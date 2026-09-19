import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FloatingControls } from './components/wedding/FloatingControls'
import { WeddingConfigContext } from './config/WeddingConfigContext'
import { weddingConfig } from './config/wedding'
import { applyRuntimeRobots } from './config/weddingRuntime'
import { CoverSection } from './sections/CoverSection'
import { CeremonySection } from './sections/CeremonySection'
import { FinaleSection } from './sections/FinaleSection'
import { GiftSection } from './sections/GiftSection'
import { InvitationPageSection } from './sections/InvitationPageSection'
import { PhotoBreakSection } from './sections/PhotoBreakSection'
import { RSVPSection } from './sections/RSVPSection'
import { StorySection } from './sections/StorySection'
import { WishSection } from './sections/WishSection'
import type { WeddingConfig } from './types/wedding'
import { getGuestNameFromUrl, getGuestSideFromUrl } from './utils/guest'

interface AppProps {
  config?: WeddingConfig
}

export default function App({ config = weddingConfig }: AppProps) {
  const [opened, setOpened] = useState(false)
  const [contentPrepared, setContentPrepared] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioFailed, setAudioFailed] = useState(false)
  const invitationRef = useRef<HTMLElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const guestName = useMemo(() => getGuestNameFromUrl(), [])
  const guestSide = useMemo(() => getGuestSideFromUrl(), [])

  useEffect(() => applyRuntimeRobots(config.seo.robots), [config.seo.robots])

  const startMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio || audioFailed || !audio.paused) return
    void audio.play().then(() => setIsPlaying(true)).catch(() => setAudioFailed(true))
  }, [audioFailed])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio || audioFailed) return
    if (audio.paused) {
      void audio.play().then(() => setIsPlaying(true)).catch(() => setAudioFailed(true))
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [audioFailed])

  const completeOpening = () => {
    setOpened(true)
    setContentPrepared(true)
    window.setTimeout(() => invitationRef.current?.focus(), 30)
  }

  return (
    <WeddingConfigContext.Provider value={config}>
      {config.music.src && (
        <audio
          ref={audioRef}
          src={config.music.src}
          loop
          preload="none"
          onPause={() => setIsPlaying(false)}
          onError={() => {
            setAudioFailed(true)
            setIsPlaying(false)
          }}
        />
      )}
      {!opened && <CoverSection onOpening={startMusic} onReveal={() => setContentPrepared(true)} onOpened={completeOpening} />}
      {opened && <a className="skip-link" href="#locations">Đến thông tin buổi lễ</a>}
      <div className="site" aria-hidden={!opened} inert={!opened}>
        {contentPrepared && (
          <main id="invitation-content" ref={invitationRef} tabIndex={-1} aria-label="Nội dung thiệp cưới">
            <InvitationPageSection guestName={guestName} />
            <CeremonySection side={guestSide} />
            <PhotoBreakSection />
            <StorySection />
            <RSVPSection guestName={guestName} side={guestSide} />
            <WishSection guestName={guestName} side={guestSide} />
            <GiftSection side={guestSide} />
            <FinaleSection />
          </main>
        )}
      </div>
      {opened && (
        <FloatingControls
          hasMusic={Boolean(config.music.src)}
          isPlaying={isPlaying}
          audioFailed={audioFailed}
          onToggleMusic={toggleMusic}
        />
      )}
    </WeddingConfigContext.Provider>
  )
}
