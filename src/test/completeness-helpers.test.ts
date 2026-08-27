import { afterEach, describe, expect, it, vi } from 'vitest'
import { weddingConfig } from '../config/wedding'
import type { WeddingEvent, WeddingFamily, WeddingGiftAccount } from '../types/wedding'
import { copyPlainText } from '../utils/clipboard'
import {
  eventHasMeaningfulDetails,
  familyHasMeaningfulDetails,
  getDisplayableEvents,
  orderEventsForGuest,
  resolveWeddingEvent,
  safeCalendarRange,
} from '../utils/ceremony'
import {
  cleanOptionalText,
  safeAssetUrl,
  safeExternalUrl,
  safePhoneHref,
} from '../utils/contentSafety'
import {
  getDisplayableGiftAccounts,
  giftAccountHasRequiredDetails,
  safeGiftQrImage,
} from '../utils/gift'

function weddingEvent(overrides: Partial<WeddingEvent> = {}): WeddingEvent {
  return {
    id: 'event',
    title: 'Lễ cưới',
    ...overrides,
  }
}

function giftAccount(overrides: Partial<WeddingGiftAccount> = {}): WeddingGiftAccount {
  return {
    id: 'gift-account',
    label: 'Nhà Trai',
    bankName: 'Ngân hàng Việt Nam',
    accountNumber: '123456789',
    accountHolder: 'TUAN HUNG',
    ...overrides,
  }
}

describe('optional wedding content safety', () => {
  it('trims author-entered content and rejects unsafe external or asset URLs', () => {
    expect(cleanOptionalText('  Nhà Gái  ')).toBe('Nhà Gái')
    expect(cleanOptionalText(undefined)).toBe('')

    expect(safeExternalUrl(' https://maps.google.com/?q=venue ')).toBe('https://maps.google.com/?q=venue')
    expect(safeExternalUrl('http://maps.google.com')).toBeNull()
    expect(safeExternalUrl('https://user:secret@example.com')).toBeNull()
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()

    expect(safeAssetUrl('/images/qr.webp')).toBe('/images/qr.webp')
    expect(safeAssetUrl('//untrusted.example/qr.webp')).toBeNull()
    expect(safeAssetUrl('https://cdn.example.com/qr.webp')).toBe('https://cdn.example.com/qr.webp')
  })

  it('creates mobile-safe phone links only for plausible phone values', () => {
    expect(safePhoneHref(' +84 901-234-567 ')).toBe('tel:+84901234567')
    expect(safePhoneHref('(090) 123.4567')).toBe('tel:0901234567')
    expect(safePhoneHref('Gọi gia đình')).toBeNull()
    expect(safePhoneHref('123')).toBeNull()
    expect(safePhoneHref('')).toBeNull()
  })
})

describe('flexible wedding event helpers', () => {
  it('does not treat metadata or whitespace as guest-facing event content', () => {
    expect(eventHasMeaningfulDetails(weddingEvent({
      id: 'bride-event',
      side: 'bride',
      type: 'vu-quy',
      title: '   ',
    }))).toBe(false)
    expect(eventHasMeaningfulDetails(weddingEvent({ title: 'Lễ Vu Quy' }))).toBe(true)
    expect(eventHasMeaningfulDetails(weddingEvent({ title: '', parkingNote: 'Có chỗ gửi xe' }))).toBe(true)
    expect(eventHasMeaningfulDetails(weddingEvent({ title: '', contactPhone: '0901234567' }))).toBe(true)
  })

  it('orders any number of events by guest side without dropping or mutating them', () => {
    const groom = weddingEvent({ id: 'groom', side: 'groom', title: 'Lễ Thành Hôn' })
    const shared = weddingEvent({ id: 'shared', side: 'both', title: 'Tiệc Cưới' })
    const bride = weddingEvent({ id: 'bride', side: 'bride', title: 'Lễ Vu Quy' })
    const neutral = weddingEvent({ id: 'neutral', side: undefined, title: 'Lễ Báo Hỷ' })
    const events = [groom, shared, bride, neutral]

    expect(orderEventsForGuest(events, 'bride').map(({ id }) => id)).toEqual([
      'bride', 'shared', 'neutral', 'groom',
    ])
    expect(orderEventsForGuest(events, 'groom').map(({ id }) => id)).toEqual([
      'groom', 'shared', 'neutral', 'bride',
    ])
    expect(orderEventsForGuest(events, 'both').map(({ id }) => id)).toEqual([
      'groom', 'shared', 'bride', 'neutral',
    ])
    expect(events.map(({ id }) => id)).toEqual(['groom', 'shared', 'bride', 'neutral'])
  })

  it('resolves sparse and invalid-date events without inventing data or rendering NaN', () => {
    const sparse = resolveWeddingEvent(weddingEvent({
      id: '  restaurant  ',
      title: '  Tiệc Cưới  ',
      date: '2026-02-30',
      ceremonyTime: '11:00',
      venueName: ' ',
    }))

    expect(sparse).toMatchObject({
      id: 'restaurant',
      title: 'Tiệc Cưới',
      dateDisplay: '',
      dateDisplayLong: '',
      weekday: '',
      hasLocation: false,
      hasTime: true,
    })
  })

  it('accepts only complete forward calendar ranges', () => {
    expect(safeCalendarRange(
      '2026-10-19T10:00:00+07:00',
      '2026-10-19T12:00:00+07:00',
    )).toEqual({
      startIso: '2026-10-19T10:00:00+07:00',
      endIso: '2026-10-19T12:00:00+07:00',
    })
    expect(safeCalendarRange('not-a-date', '2026-10-19T12:00:00+07:00')).toBeNull()
    expect(safeCalendarRange('2026-10-19T10:00:00+07:00', '')).toBeNull()
    expect(safeCalendarRange(
      '2026-10-19T12:00:00+07:00',
      '2026-10-19T10:00:00+07:00',
    )).toBeNull()
  })

  it('filters blank and duplicate trimmed event ids while preserving the first valid event', () => {
    const first = weddingEvent({ id: '  shared-event  ', title: 'Lễ Thành Hôn' })
    const duplicate = weddingEvent({ id: 'shared-event', title: 'Bản trùng không hiển thị' })
    const blankId = weddingEvent({ id: '   ', title: 'Thiếu mã sự kiện' })
    const second = weddingEvent({ id: 'party', title: 'Tiệc Cưới' })

    expect(getDisplayableEvents({
      ...weddingConfig,
      events: [first, duplicate, blankId, second],
    })).toEqual([first, second])
  })

  it('recognizes empty, partial, and location-only family content', () => {
    const empty: WeddingFamily = { label: 'Nhà Trai', father: ' ', mother: '', location: undefined }
    expect(familyHasMeaningfulDetails(empty)).toBe(false)
    expect(familyHasMeaningfulDetails({ father: 'Nguyễn Văn Minh' })).toBe(true)
    expect(familyHasMeaningfulDetails({ location: 'Hà Nội' })).toBe(true)
    expect(familyHasMeaningfulDetails(undefined)).toBe(false)
  })
})

describe('gift account safety', () => {
  it('requires complete bank details; a QR image alone is never a valid account', () => {
    expect(giftAccountHasRequiredDetails(giftAccount())).toBe(true)
    expect(giftAccountHasRequiredDetails(giftAccount({ accountHolder: ' ' }))).toBe(false)
    expect(giftAccountHasRequiredDetails(giftAccount({
      bankName: '', accountNumber: '', accountHolder: '', qrImage: '/qr.webp',
    }))).toBe(false)
  })

  it('hides disabled, empty, incomplete, and duplicate gift accounts', () => {
    const valid = giftAccount({ id: 'groom' })
    const incomplete = giftAccount({ id: 'bride', accountNumber: '' })
    const duplicate = giftAccount({ id: 'groom', label: 'Bản trùng' })

    expect(getDisplayableGiftAccounts({ enabled: false, accounts: [valid] })).toEqual([])
    expect(getDisplayableGiftAccounts({ enabled: true, accounts: [] })).toEqual([])
    expect(getDisplayableGiftAccounts({ enabled: true, accounts: [incomplete] })).toEqual([])
    expect(getDisplayableGiftAccounts({ enabled: true, accounts: [valid, incomplete, duplicate] })).toEqual([valid])
  })

  it('omits missing or unsafe QR images while keeping valid local and HTTPS assets', () => {
    expect(safeGiftQrImage(giftAccount({ qrImage: undefined }))).toBeNull()
    expect(safeGiftQrImage(giftAccount({ qrImage: 'javascript:alert(1)' }))).toBeNull()
    expect(safeGiftQrImage(giftAccount({ qrImage: '/images/groom-qr.webp' }))).toBe('/images/groom-qr.webp')
    expect(safeGiftQrImage(giftAccount({ qrImage: 'https://cdn.example.com/bride-qr.webp' }))).toBe(
      'https://cdn.example.com/bride-qr.webp',
    )
  })
})

describe('clipboard fallback', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand')

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
    else Reflect.deleteProperty(navigator, 'clipboard')
    if (originalExecCommand) Object.defineProperty(document, 'execCommand', originalExecCommand)
    else Reflect.deleteProperty(document, 'execCommand')
  })

  it('uses the modern Clipboard API with trimmed plain text', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    await expect(copyPlainText('  123 456 789  ')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledWith('123 456 789')
  })

  it('falls back after Clipboard permission failure and restores focus', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const writeText = vi.fn().mockRejectedValue(new Error('permission denied'))
    const execCommand = vi.fn().mockReturnValue(true)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    })

    await expect(copyPlainText('Địa chỉ cưới')).resolves.toBe(true)
    expect(writeText).toHaveBeenCalledOnce()
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('fails safely when there is no text or no clipboard implementation', async () => {
    Reflect.deleteProperty(navigator, 'clipboard')
    Reflect.deleteProperty(document, 'execCommand')

    await expect(copyPlainText('')).resolves.toBe(false)
    await expect(copyPlainText('123456789')).resolves.toBe(false)
  })

  it('returns false when the fallback field cannot be appended', async () => {
    Reflect.deleteProperty(navigator, 'clipboard')
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    })
    const activeButton = document.createElement('button')
    document.body.append(activeButton)
    activeButton.focus()
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
      throw new Error('append failed')
    })

    try {
      await expect(copyPlainText('123456789')).resolves.toBe(false)
    } finally {
      activeButton.remove()
    }
  })

  it('returns false when both fallback focus attempts throw', async () => {
    Reflect.deleteProperty(navigator, 'clipboard')
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    })
    vi.spyOn(HTMLTextAreaElement.prototype, 'focus').mockImplementation(() => {
      throw new Error('focus failed')
    })

    await expect(copyPlainText('123456789')).resolves.toBe(false)
  })

  it('returns false when selecting the fallback field throws', async () => {
    Reflect.deleteProperty(navigator, 'clipboard')
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    })
    vi.spyOn(HTMLTextAreaElement.prototype, 'select').mockImplementation(() => {
      throw new Error('select failed')
    })

    await expect(copyPlainText('123456789')).resolves.toBe(false)
  })

  it('returns false and cleans up when the fallback copy command throws', async () => {
    Reflect.deleteProperty(navigator, 'clipboard')
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('copy command failed')
      }),
    })

    await expect(copyPlainText('123456789')).resolves.toBe(false)
    expect(document.querySelector('textarea[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('keeps a successful copy result and cleans up when focus restoration throws', async () => {
    Reflect.deleteProperty(navigator, 'clipboard')
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockReturnValue(true),
    })
    const activeButton = document.createElement('button')
    document.body.append(activeButton)
    activeButton.focus()
    vi.spyOn(activeButton, 'focus').mockImplementation(() => {
      throw new Error('restore failed')
    })

    try {
      await expect(copyPlainText('123456789')).resolves.toBe(true)
      expect(activeButton.focus).toHaveBeenCalledTimes(2)
      expect(document.querySelector('textarea[aria-hidden="true"]')).not.toBeInTheDocument()
    } finally {
      activeButton.remove()
    }
  })
})
