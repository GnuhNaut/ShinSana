import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Countdown } from '../components/wedding/Countdown'
import { FloatingControls } from '../components/wedding/FloatingControls'
import { weddingConfig } from '../config/wedding'
import { CeremonySection } from '../sections/CeremonySection'
import { CoverSection } from '../sections/CoverSection'
import { InvitationPageSection } from '../sections/InvitationPageSection'
import type { CeremonyEvent } from '../types/wedding'

function cloneEvents(events: readonly CeremonyEvent[]): CeremonyEvent[] {
  return events.map((event) => ({
    ...event,
    calendar: { ...event.calendar },
  }))
}

const originalEvents = cloneEvents(weddingConfig.events)
const originalFamilies = {
  groomParents: { ...weddingConfig.families.groomParents },
  brideParents: { ...weddingConfig.families.brideParents },
}
const originalMusicFeature = weddingConfig.features.music
const originalMusic = { ...weddingConfig.music }

afterEach(() => {
  weddingConfig.events.splice(0, weddingConfig.events.length, ...cloneEvents(originalEvents))
  Object.assign(weddingConfig.families.groomParents, originalFamilies.groomParents)
  Object.assign(weddingConfig.families.brideParents, originalFamilies.brideParents)
  weddingConfig.features.music = originalMusicFeature
  Object.assign(weddingConfig.music, originalMusic)
})

describe('CoverSection editorial hero', () => {
  it('shows the couple and date in the H1 hero with an eager high-priority image', () => {
    render(<CoverSection onOpened={vi.fn()} />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeVisible()
    expect(heading).toHaveTextContent('Tuấn Hùng')
    expect(heading).toHaveTextContent('Sao Mai')
    expect(screen.getByText('19 · 10 · 2026')).toBeVisible()
    expect(screen.getByText('10/09 âm lịch')).toBeVisible()

    const hero = screen.getByRole('img', { name: weddingConfig.hero.alt })
    expect(hero).toHaveAttribute('src', weddingConfig.hero.src)
    expect(hero).toHaveAttribute('loading', 'eager')
    expect(hero).toHaveAttribute('fetchpriority', 'high')
    expect(hero).toHaveAttribute('decoding', 'sync')
  })
})

describe('InvitationPageSection optional family details', () => {
  it('does not expose empty Nhà Trai or Nhà Gái parent blocks by default', () => {
    render(<InvitationPageSection guestName={null} />)

    expect(screen.queryByText('Nhà Trai')).not.toBeInTheDocument()
    expect(screen.queryByText('Nhà Gái')).not.toBeInTheDocument()
    expect(document.querySelector('.invite__families')).not.toBeInTheDocument()
  })

  it('renders only the family block that has confirmed parent data', () => {
    weddingConfig.families.groomParents.father = 'Nguyễn Văn Minh'
    render(<InvitationPageSection guestName={null} />)

    const groomFamily = screen.getByText('Nhà Trai').closest<HTMLElement>('.invite__family')
    expect(groomFamily).not.toBeNull()
    expect(within(groomFamily!).getByText('Ông')).toBeVisible()
    expect(within(groomFamily!).getByText('Nguyễn Văn Minh')).toBeVisible()
    expect(screen.queryByText('Nhà Gái')).not.toBeInTheDocument()
  })
})

describe('CeremonySection', () => {
  it('shows the confirmed date and calendar while omitting unconfirmed event cards', () => {
    render(<CeremonySection side="both" />)

    const section = document.querySelector<HTMLElement>('#wedding-day')!
    expect(within(section).getByRole('heading', { name: 'Ngày mình chung đôi' })).toBeVisible()
    expect(section).toHaveTextContent('Tháng 10')
    expect(section).toHaveTextContent('2026')
    expect(section).toHaveTextContent('Tức ngày 10/09 âm lịch')

    const calendar = within(section).getByRole('table', {
      name: 'Lịch tháng 10 năm 2026; ngày 19 là ngày cưới',
    })
    expect(within(calendar).getByRole('cell', { name: '19, ngày cưới' })).toHaveAttribute('aria-current', 'date')
    expect(section.querySelectorAll('article.event-card')).toHaveLength(0)
    expect(within(section).queryByRole('heading', { name: 'Hẹn bạn tại ngày vui' })).not.toBeInTheDocument()
  })

  it('renders one enabled event and only its configured navigation map action', () => {
    Object.assign(weddingConfig.events[1]!, {
      enabled: true,
      label: 'Nhà Trai',
      eventTitle: 'Lễ Thành Hôn',
      date: '2026-10-19',
      guestArrivalTime: '10:30',
      venueName: 'Tư gia Nhà Trai',
      address: '123 Đường Hoa Hồng',
      mapNavigationUrl: 'https://maps.example.com/?q=nha-trai',
    })

    render(<CeremonySection side="both" />)

    const cards = document.querySelectorAll('article.event-card')
    expect(cards).toHaveLength(1)
    expect(within(cards[0] as HTMLElement).getByRole('heading', { name: 'Lễ Thành Hôn' })).toBeVisible()
    expect(within(cards[0] as HTMLElement).getByText('Tư gia Nhà Trai')).toBeVisible()
    expect(within(cards[0] as HTMLElement).getByRole('link', { name: /Chỉ đường/ })).toHaveAttribute(
      'href',
      'https://maps.example.com/?q=nha-trai',
    )
    expect(document.querySelector('iframe')).not.toBeInTheDocument()
  })

  it('supports two enabled events, guest-side ordering, and a lazy map embed', () => {
    Object.assign(weddingConfig.events[0]!, {
      enabled: true,
      label: 'Nhà Gái',
      eventTitle: 'Lễ Vu Quy',
      date: '2026-10-19',
      venueName: 'Tư gia Nhà Gái',
      mapEmbedUrl: 'https://maps.example.com/embed/bride',
    })
    Object.assign(weddingConfig.events[1]!, {
      enabled: true,
      label: 'Nhà Trai',
      eventTitle: 'Lễ Thành Hôn',
      date: '2026-10-19',
      venueName: 'Tư gia Nhà Trai',
    })

    render(<CeremonySection side="bride" />)

    const cards = [...document.querySelectorAll<HTMLElement>('article.event-card')]
    expect(cards).toHaveLength(2)
    expect(within(cards[0]!).getByRole('heading', { name: 'Lễ Vu Quy' })).toBeVisible()
    expect(within(cards[1]!).getByRole('heading', { name: 'Lễ Thành Hôn' })).toBeVisible()
    expect(within(cards[0]!).getByTitle('Bản đồ Tư gia Nhà Gái')).toHaveAttribute('loading', 'lazy')
    expect(within(cards[0]!).getByTitle('Bản đồ Tư gia Nhà Gái')).toHaveAttribute(
      'src',
      'https://maps.example.com/embed/bride',
    )
  })
})

describe('Countdown', () => {
  it('renders a graceful post-wedding state instead of negative units', () => {
    render(<Countdown target="2000-01-01T00:00:00+07:00" />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('Ngày hạnh phúc của chúng mình đã đến')
    expect(status).not.toHaveTextContent('-')
    expect(screen.queryByRole('timer')).not.toBeInTheDocument()
  })
})

describe('FloatingControls music', () => {
  it('omits the music control when no source has been configured', () => {
    weddingConfig.features.music = true
    weddingConfig.music.src = ''
    render(<FloatingControls />)

    expect(document.querySelector('audio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /nhạc/i })).not.toBeInTheDocument()
  })

  it('plays and pauses configured music while exposing the current state', async () => {
    weddingConfig.features.music = true
    Object.assign(weddingConfig.music, { src: '/assets/music/test.mp3', title: 'Nhạc cưới' })
    const user = userEvent.setup()
    render(<FloatingControls />)

    const audio = document.querySelector<HTMLAudioElement>('audio')!
    let paused = true
    const play = vi.fn(async () => { paused = false })
    const pause = vi.fn(() => { paused = true })
    Object.defineProperty(audio, 'paused', { configurable: true, get: () => paused })
    Object.defineProperty(audio, 'play', { configurable: true, value: play })
    Object.defineProperty(audio, 'pause', { configurable: true, value: pause })

    const playButton = screen.getByRole('button', { name: 'Bật nhạc' })
    expect(playButton).toHaveAttribute('aria-pressed', 'false')
    await user.click(playButton)

    const pauseButton = await screen.findByRole('button', { name: 'Tắt nhạc' })
    expect(play).toHaveBeenCalledOnce()
    expect(pauseButton).toHaveAttribute('aria-pressed', 'true')
    await user.click(pauseButton)

    expect(pause).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Bật nhạc' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('keeps the control off when the browser rejects playback', async () => {
    weddingConfig.features.music = true
    weddingConfig.music.src = '/assets/music/test.mp3'
    const user = userEvent.setup()
    render(<FloatingControls />)

    const audio = document.querySelector<HTMLAudioElement>('audio')!
    const play = vi.fn().mockRejectedValue(new DOMException('Autoplay blocked', 'NotAllowedError'))
    Object.defineProperty(audio, 'paused', { configurable: true, get: () => true })
    Object.defineProperty(audio, 'play', { configurable: true, value: play })

    await user.click(screen.getByRole('button', { name: 'Bật nhạc' }))

    await waitFor(() => expect(play).toHaveBeenCalledOnce())
    expect(screen.getByRole('button', { name: 'Bật nhạc' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('returns to the off state when the media element emits pause', async () => {
    weddingConfig.features.music = true
    weddingConfig.music.src = '/assets/music/test.mp3'
    const user = userEvent.setup()
    render(<FloatingControls />)

    const audio = document.querySelector<HTMLAudioElement>('audio')!
    let paused = true
    Object.defineProperty(audio, 'paused', { configurable: true, get: () => paused })
    Object.defineProperty(audio, 'play', {
      configurable: true,
      value: vi.fn(async () => { paused = false }),
    })

    await user.click(screen.getByRole('button', { name: 'Bật nhạc' }))
    expect(await screen.findByRole('button', { name: 'Tắt nhạc' })).toBeVisible()
    paused = true
    fireEvent.pause(audio)

    expect(screen.getByRole('button', { name: 'Bật nhạc' })).toHaveAttribute('aria-pressed', 'false')
  })
})
