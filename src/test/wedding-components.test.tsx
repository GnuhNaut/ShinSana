import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Countdown } from '../components/wedding/Countdown'
import { FloatingControls } from '../components/wedding/FloatingControls'
import { weddingConfig } from '../config/wedding'
import { CeremonySection } from '../sections/CeremonySection'
import { CoverSection } from '../sections/CoverSection'
import { InvitationPageSection } from '../sections/InvitationPageSection'
import type { WeddingEvent } from '../types/wedding'

function weddingEvent(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    id: 'event',
    title: 'Lễ cưới',
    ...overrides,
  }
}

function cloneEvents(events: readonly WeddingEvent[]): WeddingEvent[] {
  return events.map((event) => ({
    ...event,
    ...(event.calendar ? { calendar: { ...event.calendar } } : {}),
  }))
}

const originalEvents = cloneEvents(weddingConfig.events)
const originalFamilies = {
  groom: { ...weddingConfig.families.groom },
  bride: { ...weddingConfig.families.bride },
}
const originalMusicFeature = weddingConfig.features.music
const originalMusic = { ...weddingConfig.music }
const originalMainCalendar = {
  eventStartIso: weddingConfig.date.eventStartIso,
  eventEndIso: weddingConfig.date.eventEndIso,
}
const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

afterEach(() => {
  weddingConfig.events.splice(0, weddingConfig.events.length, ...cloneEvents(originalEvents))
  weddingConfig.families.groom = { ...originalFamilies.groom }
  weddingConfig.families.bride = { ...originalFamilies.bride }
  weddingConfig.features.music = originalMusicFeature
  Object.assign(weddingConfig.music, originalMusic)
  weddingConfig.date.eventStartIso = originalMainCalendar.eventStartIso
  weddingConfig.date.eventEndIso = originalMainCalendar.eventEndIso
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
  if (originalExecCommand) Object.defineProperty(document, 'execCommand', originalExecCommand)
  else Reflect.deleteProperty(document, 'execCommand')
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
  it('does not expose empty or whitespace-only family blocks or production placeholders', () => {
    weddingConfig.families.groom = {
      label: 'Nhà Trai',
      father: ' ',
      mother: '',
      location: '   ',
    }
    weddingConfig.families.bride = { label: 'Nhà Gái' }
    render(<InvitationPageSection guestName={null} />)

    expect(screen.queryByText('Nhà Trai')).not.toBeInTheDocument()
    expect(screen.queryByText('Nhà Gái')).not.toBeInTheDocument()
    expect(document.querySelector('.invite__families')).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/Chưa cập nhật|Đang cập nhật|TBD/i)
  })

  it('renders only confirmed fields in one partial family block', () => {
    weddingConfig.families.groom = {
      label: 'Nhà Trai',
      father: 'Nguyễn Văn Minh',
      location: 'Hà Nội',
    }
    render(<InvitationPageSection guestName={null} />)

    const families = document.querySelector<HTMLElement>('.invite__families')!
    const groomFamily = screen.getByText('Nhà Trai').closest<HTMLElement>('.invite__family')!
    expect(families).toHaveClass('invite__families--single')
    expect(within(groomFamily).getByText('Ông')).toBeVisible()
    expect(within(groomFamily).getByText('Nguyễn Văn Minh')).toBeVisible()
    expect(within(groomFamily).getByText('Hà Nội')).toBeVisible()
    expect(within(groomFamily).queryByText('Bà')).not.toBeInTheDocument()
    expect(screen.queryByText('Nhà Gái')).not.toBeInTheDocument()
  })

  it('renders complete information for both families', () => {
    weddingConfig.families.groom = {
      label: 'Nhà Trai',
      father: 'Nguyễn Văn Minh',
      mother: 'Trần Thị Lan',
      location: 'Hà Nội',
    }
    weddingConfig.families.bride = {
      label: 'Nhà Gái',
      father: 'Lê Văn An',
      mother: 'Phạm Thị Hoa',
      location: 'Đà Nẵng',
    }
    render(<InvitationPageSection guestName={null} />)

    const families = document.querySelector<HTMLElement>('.invite__families')!
    const groomFamily = screen.getByText('Nhà Trai').closest<HTMLElement>('.invite__family')!
    const brideFamily = screen.getByText('Nhà Gái').closest<HTMLElement>('.invite__family')!
    expect(families).not.toHaveClass('invite__families--single')
    expect(within(groomFamily).getByText('Nguyễn Văn Minh')).toBeVisible()
    expect(within(groomFamily).getByText('Trần Thị Lan')).toBeVisible()
    expect(within(groomFamily).getByText('Hà Nội')).toBeVisible()
    expect(within(brideFamily).getByText('Lê Văn An')).toBeVisible()
    expect(within(brideFamily).getByText('Phạm Thị Hoa')).toBeVisible()
    expect(within(brideFamily).getByText('Đà Nẵng')).toBeVisible()
  })
})

describe('CeremonySection flexible events', () => {
  it('supports zero events while retaining the confirmed wedding date utility', () => {
    weddingConfig.events.splice(0)
    render(<CeremonySection side="both" />)

    const section = document.querySelector<HTMLElement>('#wedding-day')!
    expect(within(section).getByRole('heading', { name: 'Ngày mình chung đôi' })).toBeVisible()
    expect(section).toHaveTextContent('Tháng 10')
    expect(section).toHaveTextContent('2026')
    expect(section).toHaveTextContent('Tức ngày 10/09 âm lịch')
    expect(section.querySelectorAll('article.event-card')).toHaveLength(0)
    expect(within(section).queryByRole('heading', { name: 'Hẹn bạn tại ngày vui' })).not.toBeInTheDocument()
    expect(section).not.toHaveTextContent(/Chưa cập nhật|Đang cập nhật|TBD/i)
  })

  it('falls back to a valid all-day main calendar when optional timestamps are malformed', () => {
    weddingConfig.date.eventStartIso = 'not-a-timestamp'
    weddingConfig.date.eventEndIso = '2026-10-19T12:00:00+07:00'
    render(<CeremonySection side="both" />)

    const calendarLink = screen.getByRole('link', { name: 'Thêm vào lịch' })
    const calendarHref = calendarLink.getAttribute('href') ?? ''
    const calendarText = decodeURIComponent(calendarHref.slice(calendarHref.indexOf(',') + 1))

    expect(calendarText).toContain('DTSTART;VALUE=DATE:20261019')
    expect(calendarText).toContain('DTEND;VALUE=DATE:20261020')
    expect(calendarText).not.toContain('not-a-timestamp')
  })

  it('renders one sparse event without empty address, map, contact, or parking controls', () => {
    weddingConfig.events.push(weddingEvent({
      id: 'shared-event',
      side: 'both',
      title: 'Lễ Thành Hôn',
      eyebrow: 'Gia đình hai bên',
      date: '2026-10-19',
      ceremonyTime: '11:00',
    }))
    render(<CeremonySection side="both" />)

    const card = document.querySelector<HTMLElement>('article.event-card')!
    const rows = within(card).getAllByRole('term').map((row) => row.textContent)
    expect(document.querySelectorAll('article.event-card')).toHaveLength(1)
    expect(document.querySelector('.events__grid')).toHaveClass('events__grid--single', 'events__grid--count-1')
    expect(within(card).getByRole('heading', { name: 'Lễ Thành Hôn' })).toBeVisible()
    expect(within(card).getByText('Gia đình hai bên')).toBeVisible()
    expect(within(card).getByText('11:00')).toBeVisible()
    expect(rows).toEqual(['Làm lễ'])
    expect(within(card).queryByRole('link', { name: /Chỉ đường|Gọi/ })).not.toBeInTheDocument()
    expect(within(card).queryByRole('button', { name: /Sao chép địa chỉ/ })).not.toBeInTheDocument()
    expect(card.querySelector('iframe')).not.toBeInTheDocument()
  })

  it('does not render an empty definition list for title-only or map-only events', () => {
    weddingConfig.events.push(
      weddingEvent({ id: 'title-only', title: 'Lễ Báo Hỷ' }),
      weddingEvent({
        id: 'map-only',
        title: 'Tiệc Cưới',
        mapUrl: 'https://maps.example.com/?q=confirmed-venue',
      }),
    )
    render(<CeremonySection side="both" />)

    const cards = [...document.querySelectorAll<HTMLElement>('article.event-card')]
    expect(cards).toHaveLength(2)
    expect(cards[0]!.querySelector('dl')).not.toBeInTheDocument()
    expect(cards[1]!.querySelector('dl')).not.toBeInTheDocument()
    expect(within(cards[0]!).queryByRole('link')).not.toBeInTheDocument()
    expect(within(cards[1]!).getByRole('link', { name: 'Chỉ đường' })).toHaveAttribute(
      'href',
      'https://maps.example.com/?q=confirmed-venue',
    )
  })

  it('supports address copy without inventing a map action', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    weddingConfig.events.push(weddingEvent({
      id: 'address-only',
      title: 'Tiệc Cưới',
      address: '123 Đường Hoa Hồng, Phường Hạnh Phúc, Thành phố Đà Nẵng',
    }))
    render(<CeremonySection side="both" />)

    const card = document.querySelector<HTMLElement>('article.event-card')!
    expect(within(card).getByText('123 Đường Hoa Hồng, Phường Hạnh Phúc, Thành phố Đà Nẵng')).toBeVisible()
    expect(within(card).queryByRole('link', { name: 'Chỉ đường' })).not.toBeInTheDocument()

    await user.click(within(card).getByRole('button', { name: 'Sao chép địa chỉ' }))
    expect(writeText).toHaveBeenCalledWith('123 Đường Hoa Hồng, Phường Hạnh Phúc, Thành phố Đà Nẵng')
    expect(within(card).getByRole('button', { name: 'Đã sao chép' })).toBeVisible()
    expect(within(card).getByRole('status')).toHaveTextContent('Đã sao chép địa chỉ')
  })

  it('opens the lazy map modal and renders contact, parking, and timed calendar actions only when valid', async () => {
    weddingConfig.events.push(weddingEvent({
      id: 'bride-event',
      side: 'bride',
      type: 'vu-quy',
      eyebrow: 'Nhà Gái',
      title: 'Lễ Vu Quy',
      date: '2026-10-18',
      lunarDate: '09/09 âm lịch',
      guestArrivalTime: '10:30',
      receptionTime: '11:30',
      venueName: 'Tư gia Nhà Gái',
      address: '456 Đường Sen',
      mapUrl: 'https://maps.example.com/?q=nha-gai',
      mapEmbedUrl: 'https://maps.example.com/embed/bride',
      parkingNote: 'Có chỗ gửi ô tô và xe máy phía sau.',
      contactName: 'Chị Linh',
      contactPhone: '+84 901-234-567',
      calendar: {
        eventStartIso: '2026-10-18T10:30:00+07:00',
        eventEndIso: '2026-10-18T13:30:00+07:00',
      },
    }))
    render(<CeremonySection side="bride" />)

    const card = document.querySelector<HTMLElement>('article.event-card')!
    const map = within(card).getByRole('button', { name: 'Chỉ đường' })
    expect(screen.queryByTitle('Bản đồ Tư gia Nhà Gái')).not.toBeInTheDocument()
    await userEvent.setup().click(map)
    const mapDialog = screen.getByRole('dialog', { name: 'bản đồ Tư gia Nhà Gái' })
    const mapFrame = within(mapDialog).getByTitle('Bản đồ Tư gia Nhà Gái')
    expect(mapFrame).toHaveAttribute('loading', 'lazy')
    expect(mapFrame).toHaveAttribute('referrerpolicy', 'no-referrer')
    const mapExternal = within(mapDialog).getByRole('link', { name: 'Mở Google Maps' })
    expect(mapExternal).toHaveAttribute('href', 'https://maps.example.com/?q=nha-gai')
    expect(mapExternal).toHaveAttribute('target', '_blank')
    expect(within(card).getByText('Có chỗ gửi ô tô và xe máy phía sau.')).toBeVisible()
    expect(within(card).getByText('Chị Linh')).toBeVisible()
    expect(within(card).getByRole('link', { name: '+84 901-234-567' })).toHaveAttribute('href', 'tel:+84901234567')
    expect(within(card).getByRole('link', { name: 'Gọi' })).toHaveAttribute('href', 'tel:+84901234567')
    expect(within(card).getByRole('link', { name: 'Lưu ngày cưới' })).toHaveAttribute(
      'download',
      'wedding-bride-event.ics',
    )
  })

  it('supports two events on different dates and orders the requested side first', () => {
    weddingConfig.events.push(
      weddingEvent({
        id: 'groom-event',
        side: 'groom',
        eyebrow: 'Nhà Trai',
        title: 'Lễ Thành Hôn',
        date: '2026-10-19',
      }),
      weddingEvent({
        id: 'bride-event',
        side: 'bride',
        eyebrow: 'Nhà Gái',
        title: 'Lễ Vu Quy',
        date: '2026-10-18',
      }),
    )
    render(<CeremonySection side="bride" />)

    const cards = [...document.querySelectorAll<HTMLElement>('article.event-card')]
    expect(cards).toHaveLength(2)
    expect(document.querySelector('.events__grid')).toHaveClass('events__grid--double', 'events__grid--count-2')
    expect(within(cards[0]!).getByRole('heading', { name: 'Lễ Vu Quy' })).toBeVisible()
    expect(cards[0]!.querySelector('time[datetime="2026-10-18"]')).toBeVisible()
    expect(within(cards[1]!).getByRole('heading', { name: 'Lễ Thành Hôn' })).toBeVisible()
    expect(cards[1]!.querySelector('time[datetime="2026-10-19"]')).toBeVisible()
  })

  it('renders a third restaurant event without assuming only two ceremonies', () => {
    weddingConfig.events.push(
      weddingEvent({ id: 'bride', side: 'bride', title: 'Lễ Vu Quy' }),
      weddingEvent({ id: 'groom', side: 'groom', title: 'Lễ Thành Hôn' }),
      weddingEvent({ id: 'party', side: 'both', type: 'wedding-party', title: 'Tiệc Cưới' }),
    )
    render(<CeremonySection side="groom" />)

    const cards = [...document.querySelectorAll<HTMLElement>('article.event-card')]
    expect(cards).toHaveLength(3)
    expect(document.querySelector('.events__grid')).toHaveClass('events__grid--multiple', 'events__grid--count-3')
    expect(cards.map((card) => within(card).getByRole('heading').textContent)).toEqual([
      'Lễ Thành Hôn',
      'Tiệc Cưới',
      'Lễ Vu Quy',
    ])
  })

  it('does not expose unsafe map, phone, or invalid calendar actions', () => {
    weddingConfig.events.push(weddingEvent({
      id: 'unsafe',
      title: 'Lễ Báo Hỷ',
      mapUrl: 'javascript:alert(1)',
      mapEmbedUrl: 'http://maps.example.com/embed',
      contactName: 'Người hỗ trợ',
      contactPhone: 'gọi gia đình',
      calendar: {
        eventStartIso: '2026-10-19T10:00:00+07:00',
        eventEndIso: '',
      },
    }))
    render(<CeremonySection side="both" />)

    const card = document.querySelector<HTMLElement>('article.event-card')!
    expect(within(card).getByText('Người hỗ trợ')).toBeVisible()
    expect(within(card).queryByRole('link')).not.toBeInTheDocument()
    expect(card.querySelector('iframe')).not.toBeInTheDocument()
    expect(within(card).queryByRole('button')).not.toBeInTheDocument()
  })

  it('does not throw or create event calendar links for malformed or reversed ranges', () => {
    weddingConfig.events.push(
      weddingEvent({
        id: 'malformed-calendar',
        title: 'Lễ Thành Hôn',
        date: '2026-10-19',
        calendar: {
          eventStartIso: 'not-a-timestamp',
          eventEndIso: '2026-10-19T12:00:00+07:00',
        },
      }),
      weddingEvent({
        id: 'reversed-calendar',
        title: 'Tiệc Cưới',
        date: '2026-10-19',
        calendar: {
          eventStartIso: '2026-10-19T13:00:00+07:00',
          eventEndIso: '2026-10-19T10:00:00+07:00',
        },
      }),
    )

    expect(() => render(<CeremonySection side="both" />)).not.toThrow()
    const cards = [...document.querySelectorAll<HTMLElement>('article.event-card')]
    expect(cards).toHaveLength(2)
    for (const card of cards) {
      expect(within(card).queryByRole('link', { name: 'Lưu ngày cưới' })).not.toBeInTheDocument()
    }
  })

  it('derives accessible heading ids independently from author-entered event ids', () => {
    weddingConfig.events.push(weddingEvent({
      id: '  Nhà Gái / lễ<script>  ',
      title: 'Lễ Vu Quy',
      date: '2026-10-18',
      calendar: {
        eventStartIso: '2026-10-18T09:00:00+07:00',
        eventEndIso: '2026-10-18T11:00:00+07:00',
      },
    }))
    render(<CeremonySection side="bride" />)

    const card = document.querySelector<HTMLElement>('article.event-card')!
    const heading = within(card).getByRole('heading', { name: 'Lễ Vu Quy' })
    expect(card).toHaveAttribute('aria-labelledby', heading.id)
    expect(heading.id).not.toContain('Nhà Gái')
    expect(heading.id).not.toContain('<')
    expect(within(card).getByRole('link', { name: 'Lưu ngày cưới' }).getAttribute('download')).toMatch(
      /^wedding-[A-Za-z0-9_-]+\.ics$/,
    )
  })

  it('omits an impossible calendar date rather than showing a misleading day', () => {
    weddingConfig.events.push(weddingEvent({
      id: 'invalid-date',
      title: 'Lễ Cưới',
      date: '2026-02-30',
    }))
    render(<CeremonySection side="both" />)

    const card = document.querySelector<HTMLElement>('article.event-card')!
    expect(card.querySelector('time')).not.toBeInTheDocument()
    expect(card).not.toHaveTextContent('NaN')
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

describe('FloatingControls', () => {
  it('keeps the back-to-top control hidden while event information intersects the viewport', async () => {
    const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY')
    const originalInnerHeight = Object.getOwnPropertyDescriptor(window, 'innerHeight')
    const originalScrollHeight = Object.getOwnPropertyDescriptor(document.documentElement, 'scrollHeight')
    const eventSection = document.createElement('section')
    eventSection.className = 'wedding-day__events'
    let eventRect = {
      top: 100,
      bottom: 700,
      left: 0,
      right: 390,
      width: 390,
      height: 600,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    }
    Object.defineProperty(eventSection, 'getBoundingClientRect', {
      configurable: true,
      value: vi.fn(() => eventRect),
    })
    document.body.append(eventSection)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 2_000 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 })
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4_000 })

    try {
      render(<FloatingControls />)
      expect(screen.queryByRole('button', { name: 'Về đầu trang' })).not.toBeInTheDocument()

      eventRect = { ...eventRect, top: -900, bottom: -100, y: -900 }
      fireEvent.scroll(window)
      await waitFor(() => expect(screen.getByRole('button', { name: 'Về đầu trang' })).toBeVisible())

      eventRect = { ...eventRect, top: 40, bottom: 640, y: 40 }
      fireEvent.scroll(window)
      await waitFor(() => expect(screen.queryByRole('button', { name: 'Về đầu trang' })).not.toBeInTheDocument())
    } finally {
      eventSection.remove()
      if (originalScrollY) Object.defineProperty(window, 'scrollY', originalScrollY)
      else Reflect.deleteProperty(window, 'scrollY')
      if (originalInnerHeight) Object.defineProperty(window, 'innerHeight', originalInnerHeight)
      else Reflect.deleteProperty(window, 'innerHeight')
      if (originalScrollHeight) Object.defineProperty(document.documentElement, 'scrollHeight', originalScrollHeight)
      else Reflect.deleteProperty(document.documentElement, 'scrollHeight')
    }
  })

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
