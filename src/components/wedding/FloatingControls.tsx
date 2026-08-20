import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Volume2, VolumeX } from 'lucide-react'
import { weddingConfig as config } from '../../config/wedding'

export function FloatingControls() {
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      setShowTop(window.scrollY > window.innerHeight * 1.2)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])

  const toggleMusic = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try { await audio.play(); setPlaying(true) } catch { setPlaying(false) }
    } else { audio.pause(); setPlaying(false) }
  }

  return (
    <>
      <div className="scroll-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
      <div className="floating-controls">
        {config.features.music && config.music.src && (
          <><audio ref={audioRef} src={config.music.src} loop preload="none" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />
          <button className="icon-button" type="button" onClick={toggleMusic} aria-label={playing ? 'Tắt nhạc' : 'Bật nhạc'} aria-pressed={playing} title={config.music.title || 'Nhạc nền'}>{playing ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}</button></>
        )}
        {showTop && <button className="icon-button" type="button" aria-label="Về đầu trang" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}><ArrowUp aria-hidden="true" /></button>}
      </div>
    </>
  )
}
