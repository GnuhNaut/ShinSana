import { describe, expect, it } from 'vitest'
import { validateWeddingConfig, weddingConfig } from '../config/wedding'
import type { WeddingConfig } from '../types/wedding'

const cloneConfig = (): WeddingConfig => structuredClone(weddingConfig)

describe('weddingConfig', () => {
  it('contains the canonical couple, date, and replaceable content', () => {
    expect(validateWeddingConfig(weddingConfig)).toEqual([])
    expect(weddingConfig.couple.groom.fullName).toBe('Tuấn Hùng')
    expect(weddingConfig.couple.bride.fullName).toBe('Sao Mai')
    expect(weddingConfig.date).toMatchObject({
      iso: '2026-10-19',
      countdownIso: '2026-10-19T00:00:00+07:00',
      lunar: '10/09 âm lịch',
      timezone: 'Asia/Ho_Chi_Minh',
    })
    expect(weddingConfig.families).toEqual({
      groomParents: { father: '', mother: '' },
      brideParents: { father: '', mother: '' },
    })
    expect(weddingConfig.events).toHaveLength(2)
    expect(weddingConfig.events.map(({ id, side, enabled }) => ({ id, side, enabled }))).toEqual([
      { id: 'bride-event', side: 'bride', enabled: false },
      { id: 'groom-event', side: 'groom', enabled: false },
    ])
    expect(weddingConfig.events.every((event) => [
      event.label,
      event.eventTitle,
      event.date,
      event.lunarDate,
      event.guestArrivalTime,
      event.ceremonyTime,
      event.banquetTime,
      event.venueName,
      event.address,
      event.phone,
      event.mapNavigationUrl,
      event.mapEmbedUrl,
      event.calendar.eventStartIso,
      event.calendar.eventEndIso,
    ].every((value) => value === ''))).toBe(true)
    expect(weddingConfig.gift.enabled).toBe(false)
    expect(weddingConfig.gift.groom.accountNumber).toBe('')
    expect(weddingConfig.gallery.length).toBeLessThanOrEqual(4)
    expect(weddingConfig.gallery.every((image) => image.src && image.alt)).toBe(true)
  })

  it('reports the canonical required fields', () => {
    const invalidConfig = cloneConfig()
    invalidConfig.couple.groom.fullName = ' '
    invalidConfig.date.iso = '19-10-2026'
    invalidConfig.date.timezone = ''
    invalidConfig.seo.description = ''

    expect(validateWeddingConfig(invalidConfig)).toEqual([
      'Missing groom name',
      'Invalid ISO wedding date',
      'Missing timezone',
      'Missing SEO metadata',
    ])
  })

  it('rejects incomplete times, reversed ranges, and invalid launch URLs', () => {
    const incompleteTime = cloneConfig()
    incompleteTime.date.eventStartIso = '2026-10-19T10:00:00+07:00'
    expect(validateWeddingConfig(incompleteTime)).toContain('Wedding event requires both start and end times')

    const reversedTime = cloneConfig()
    reversedTime.date.eventStartIso = '2026-10-19T12:00:00+07:00'
    reversedTime.date.eventEndIso = '2026-10-19T10:00:00+07:00'
    expect(validateWeddingConfig(reversedTime)).toContain('Invalid wedding event time range')

    const invalidUrl = cloneConfig()
    invalidUrl.seo.siteUrl = 'wedding.local'
    expect(validateWeddingConfig(invalidUrl)).toContain('Invalid wedding site URL')
  })

  it('validates each ceremony in the flexible event array', () => {
    const invalidBride = cloneConfig()
    invalidBride.events[0].enabled = true
    invalidBride.events[0].eventTitle = 'Tiệc cưới'
    invalidBride.events[0].date = '2026-02-30'
    invalidBride.events[0].mapNavigationUrl = 'http://maps.local'
    expect(validateWeddingConfig(invalidBride)).toContain('Invalid ISO date for bride-event')
    expect(validateWeddingConfig(invalidBride)).toContain('bride-event map URL must be a safe HTTPS URL')

    const invalidGroom = cloneConfig()
    invalidGroom.events[1].calendar.eventStartIso = '2026-10-19T10:00:00+07:00'
    expect(validateWeddingConfig(invalidGroom)).toContain('groom-event event requires both start and end times')
  })

  it('rejects empty enabled events, duplicate ids, and oversized galleries', () => {
    const invalidConfig = cloneConfig()
    invalidConfig.events[0].enabled = true
    invalidConfig.events[1].id = invalidConfig.events[0].id
    invalidConfig.gallery.push(structuredClone(invalidConfig.gallery[0]))

    expect(validateWeddingConfig(invalidConfig)).toEqual(expect.arrayContaining([
      'bride-event is enabled without ceremony details',
      'Duplicate ceremony event id: bride-event',
      'Gallery must contain at most 4 images',
    ]))
  })
})
