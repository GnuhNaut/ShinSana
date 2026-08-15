import { describe, expect, it } from 'vitest'
import { validateWeddingConfig, weddingConfig } from '../config/wedding'

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
    expect(weddingConfig.gift.groom.accountNumber).toBe('')
    expect(weddingConfig.gallery.every((image) => image.src && image.alt)).toBe(true)
  })

  it('reports the canonical required fields', () => {
    const invalidConfig = structuredClone(weddingConfig)
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
    const incompleteTime = structuredClone(weddingConfig)
    incompleteTime.date.eventStartIso = '2026-10-19T10:00:00+07:00'
    expect(validateWeddingConfig(incompleteTime)).toContain('Wedding event requires both start and end times')

    const reversedTime = structuredClone(weddingConfig)
    reversedTime.date.eventStartIso = '2026-10-19T12:00:00+07:00'
    reversedTime.date.eventEndIso = '2026-10-19T10:00:00+07:00'
    expect(validateWeddingConfig(reversedTime)).toContain('Invalid wedding event time range')

    const invalidUrl = structuredClone(weddingConfig)
    invalidUrl.seo.siteUrl = 'wedding.local'
    expect(validateWeddingConfig(invalidUrl)).toContain('Invalid wedding site URL')
  })

  it('validates bride and groom side ceremonies independently', () => {
    const invalidBride = structuredClone(weddingConfig)
    invalidBride.events.brideSide.date = '21-10-2026'
    invalidBride.events.brideSide.mapNavigationUrl = 'http://maps.local'
    expect(validateWeddingConfig(invalidBride)).toContain('Invalid ISO date for Nhà Gái')
    expect(validateWeddingConfig(invalidBride)).toContain('Nhà Gái map URL must use HTTPS')

    const invalidGroom = structuredClone(weddingConfig)
    invalidGroom.events.groomSide.calendar.eventStartIso = '2026-10-19T10:00:00+07:00'
    expect(validateWeddingConfig(invalidGroom)).toContain('Nhà Trai event requires both start and end times')
  })
})
