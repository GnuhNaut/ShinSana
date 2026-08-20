import { describe, expect, it } from 'vitest'
import { weddingConfig } from '../config/wedding'
import type { CeremonyEvent, WeddingConfig } from '../types/wedding'
import {
  ceremonyTitle,
  eventHasMeaningfulDetails,
  getEnabledEvents,
  orderEventsForGuest,
  resolveCeremony,
  safeExternalUrl,
} from '../utils/ceremony'

function ceremony(overrides: Partial<CeremonyEvent> = {}): CeremonyEvent {
  return {
    id: 'event',
    enabled: false,
    label: '',
    eventTitle: '',
    date: '',
    lunarDate: '',
    guestArrivalTime: '',
    ceremonyTime: '',
    banquetTime: '',
    venueName: '',
    address: '',
    phone: '',
    mapNavigationUrl: '',
    mapEmbedUrl: '',
    calendar: { eventStartIso: '', eventEndIso: '' },
    ...overrides,
  }
}

describe('ceremony content helpers', () => {
  it('recognizes meaningful event details without treating metadata as content', () => {
    expect(eventHasMeaningfulDetails(ceremony({ label: 'Nhà gái', side: 'bride' }))).toBe(false)
    expect(eventHasMeaningfulDetails(ceremony({ eventTitle: 'Tiệc cưới' }))).toBe(true)
    expect(eventHasMeaningfulDetails(ceremony({ guestArrivalTime: '17:30' }))).toBe(true)
    expect(eventHasMeaningfulDetails(ceremony({ calendar: {
      eventStartIso: '2026-10-19T17:30:00+07:00',
      eventEndIso: '',
    } }))).toBe(true)
  })

  it('returns enabled events and orders a copy for the personalized guest side', () => {
    const groomOne = ceremony({ id: 'groom-one', side: 'groom', enabled: true, eventTitle: 'A' })
    const neutral = ceremony({ id: 'neutral', enabled: true, eventTitle: 'B' })
    const bride = ceremony({ id: 'bride', side: 'bride', enabled: true, eventTitle: 'C' })
    const groomTwo = ceremony({ id: 'groom-two', side: 'groom', enabled: false, eventTitle: 'D' })
    const config: WeddingConfig = { ...structuredClone(weddingConfig), events: [groomOne, neutral, bride, groomTwo] }

    expect(getEnabledEvents(config).map((event) => event.id)).toEqual(['groom-one', 'neutral', 'bride'])

    const enabled = getEnabledEvents(config)
    expect(orderEventsForGuest(enabled, 'bride').map((event) => event.id)).toEqual(['bride', 'neutral', 'groom-one'])
    expect(orderEventsForGuest(enabled, 'groom').map((event) => event.id)).toEqual(['groom-one', 'neutral', 'bride'])
    expect(orderEventsForGuest(enabled, 'both').map((event) => event.id)).toEqual(['groom-one', 'neutral', 'bride'])
    expect(enabled.map((event) => event.id)).toEqual(['groom-one', 'neutral', 'bride'])
  })

  it('resolves only confirmed event fields and never assumes a ceremony title or date', () => {
    const empty = ceremony({ id: 'empty', side: 'bride', label: 'Nhà gái' })
    const unresolved = resolveCeremony(weddingConfig, empty)
    expect(unresolved.date).toBe('')
    expect(unresolved.dateDisplay).toBe('')
    expect(unresolved.weekday).toBe('')
    expect(ceremonyTitle(empty)).toBe('')

    const confirmed = resolveCeremony(weddingConfig, ceremony({
      date: '2026-10-19',
      guestArrivalTime: '17:30',
      venueName: 'Địa điểm đã xác nhận',
    }))
    expect(confirmed).toMatchObject({
      dateDisplay: '19.10.2026',
      dateDisplayLong: '19 tháng 10 năm 2026',
      weekday: 'Thứ Hai',
      hasLocation: true,
      hasTime: true,
    })
  })

  it('allows only credential-free HTTPS external links', () => {
    expect(safeExternalUrl(' https://maps.google.com/?q=venue ')).toBe('https://maps.google.com/?q=venue')
    expect(safeExternalUrl('http://maps.google.com')).toBeNull()
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeExternalUrl('https://user:secret@example.com')).toBeNull()
    expect(safeExternalUrl('not a URL')).toBeNull()
    expect(safeExternalUrl('')).toBeNull()
  })
})
