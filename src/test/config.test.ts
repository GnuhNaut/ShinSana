import { describe, expect, it } from 'vitest'
import { validateWeddingConfig, weddingConfig } from '../config/wedding'
import type { WeddingConfig, WeddingEvent, WeddingGiftAccount } from '../types/wedding'

const cloneConfig = (): WeddingConfig => structuredClone(weddingConfig)

const weddingEvent = (overrides: Partial<WeddingEvent> = {}): WeddingEvent => ({
  id: 'event',
  title: 'Lễ cưới',
  ...overrides,
})

const giftAccount = (overrides: Partial<WeddingGiftAccount> = {}): WeddingGiftAccount => ({
  id: 'gift-account',
  label: 'Nhà Trai',
  bankName: 'Ngân hàng Việt Nam',
  accountNumber: '123456789',
  accountHolder: 'TUAN HUNG',
  ...overrides,
})

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
      groom: { label: 'Nhà Trai' },
      bride: { label: 'Nhà Gái' },
    })
    expect(weddingConfig.events).toEqual([])
    expect(weddingConfig.gift.enabled).toBe(false)
    expect(weddingConfig.gift.accounts).toEqual([])
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
      'Invalid wedding timezone',
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
    expect(validateWeddingConfig(reversedTime)).toContain('Invalid Wedding event time range')

    const invalidUrl = cloneConfig()
    invalidUrl.seo.siteUrl = 'wedding.local'
    expect(validateWeddingConfig(invalidUrl)).toContain('Invalid wedding site URL')
  })

  it('validates every optional field in the flexible event array', () => {
    const invalid = cloneConfig()
    invalid.events = [weddingEvent({
      id: 'bride-event',
      side: 'bride',
      type: 'vu-quy',
      title: 'Lễ Vu Quy',
      date: '2026-02-30',
      mapUrl: 'http://maps.local',
      mapEmbedUrl: 'javascript:alert(1)',
      contactPhone: 'gọi gia đình',
      calendar: {
        eventStartIso: '2026-10-19T10:00:00+07:00',
        eventEndIso: '',
      },
    })]

    expect(validateWeddingConfig(invalid)).toEqual(expect.arrayContaining([
      'Invalid ISO date for Lễ Vu Quy',
      'Lễ Vu Quy map URL must be a safe HTTPS URL',
      'Lễ Vu Quy map embed must be a safe HTTPS URL',
      'Invalid contact phone for Lễ Vu Quy',
      'Lễ Vu Quy calendar requires both start and end times',
    ]))
  })

  it('rejects missing event content, duplicate ids, and oversized galleries', () => {
    const invalidConfig = cloneConfig()
    invalidConfig.events = [
      weddingEvent({ id: '', title: '' }),
      weddingEvent({ id: 'duplicate', title: 'Lễ Một' }),
      weddingEvent({ id: 'duplicate', title: 'Lễ Hai' }),
    ]
    invalidConfig.gallery.push(structuredClone(invalidConfig.gallery[0]))

    expect(validateWeddingConfig(invalidConfig)).toEqual(expect.arrayContaining([
      'Missing wedding event id at index 0',
      'Missing wedding event title at index 0',
      'Duplicate wedding event id: duplicate',
      'Gallery must contain at most 4 images',
    ]))
  })

  it('warns through validation when online gifts are enabled without valid accounts', () => {
    const emptyGift = cloneConfig()
    emptyGift.gift = { enabled: true, accounts: [] }
    expect(validateWeddingConfig(emptyGift)).toContain('Online gift is enabled without accounts')

    const invalidGift = cloneConfig()
    invalidGift.gift = {
      enabled: true,
      accounts: [
        giftAccount({ id: 'gift', accountHolder: '', qrImage: 'javascript:alert(1)' }),
        giftAccount({ id: 'gift', label: 'Nhà Gái' }),
      ],
    }
    expect(validateWeddingConfig(invalidGift)).toEqual(expect.arrayContaining([
      'Nhà Trai is missing required bank details',
      'Nhà Trai QR image must be a safe asset URL',
      'Duplicate gift account id: gift',
    ]))
  })
})
