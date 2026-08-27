import { describe, expect, it } from 'vitest'
import { weddingConfig } from '../config/wedding'
import type { WeddingConfig, WeddingEvent } from '../types/wedding'
import {
  eventHasMeaningfulDetails,
  getDisplayableEvents,
  orderEventsForGuest,
  resolveWeddingEvent,
  safeExternalUrl,
} from '../utils/ceremony'

function event(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    id: 'event',
    title: 'Lễ cưới',
    ...overrides,
  }
}

describe('wedding event content helpers', () => {
  it('recognizes meaningful optional fields without treating metadata as content', () => {
    expect(eventHasMeaningfulDetails(event({ title: ' ', side: 'bride', type: 'vu-quy' }))).toBe(false)
    expect(eventHasMeaningfulDetails(event({ title: 'Tiệc cưới' }))).toBe(true)
    expect(eventHasMeaningfulDetails(event({ title: '', guestArrivalTime: '17:30' }))).toBe(true)
    expect(eventHasMeaningfulDetails(event({ title: '', parkingNote: 'Gửi xe phía sau nhà hàng' }))).toBe(true)
  })

  it('returns only titled events and orders a copy for the personalized guest side', () => {
    const groom = event({ id: 'groom', side: 'groom', title: 'Lễ Thành Hôn' })
    const shared = event({ id: 'shared', side: 'both', title: 'Tiệc Cưới' })
    const bride = event({ id: 'bride', side: 'bride', title: 'Lễ Vu Quy' })
    const untitled = event({ id: 'untitled', title: '', address: 'Địa chỉ không đủ để public event' })
    const missingId = event({ id: '', title: 'Thiếu id' })
    const config: WeddingConfig = {
      ...structuredClone(weddingConfig),
      events: [groom, shared, bride, untitled, missingId],
    }

    expect(getDisplayableEvents(config).map(({ id }) => id)).toEqual(['groom', 'shared', 'bride'])
    const displayable = getDisplayableEvents(config)
    expect(orderEventsForGuest(displayable, 'bride').map(({ id }) => id)).toEqual(['bride', 'shared', 'groom'])
    expect(orderEventsForGuest(displayable, 'groom').map(({ id }) => id)).toEqual(['groom', 'shared', 'bride'])
    expect(orderEventsForGuest(displayable, 'both').map(({ id }) => id)).toEqual(['groom', 'shared', 'bride'])
    expect(displayable.map(({ id }) => id)).toEqual(['groom', 'shared', 'bride'])
  })

  it('resolves only confirmed fields and never assumes a ceremony title or date', () => {
    const invalidDate = resolveWeddingEvent(event({
      id: 'invalid-date',
      title: '  Lễ Báo Hỷ  ',
      date: '2026-02-30',
    }))
    expect(invalidDate.title).toBe('Lễ Báo Hỷ')
    expect(invalidDate.dateDisplay).toBe('')
    expect(invalidDate.weekday).toBe('')

    const confirmed = resolveWeddingEvent(event({
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
