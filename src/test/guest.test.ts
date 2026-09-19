import { describe, expect, it } from 'vitest'
import { getGuestNameFromUrl, getGuestSideFromUrl, normalizeGuestName } from '../utils/guest'

describe('guest URL personalization', () => {
  it('reads a well-formed guest name and supported side', () => {
    expect(getGuestNameFromUrl('https://example.test/?guest=Nguyen%20Van%20A&side=groom')).toBe('Nguyen Van A')
    expect(getGuestSideFromUrl('https://example.test/?guest=Nguyen%20Van%20A&side=groom')).toBe('groom')
    expect(getGuestSideFromUrl('https://example.test/?side=bride')).toBe('bride')
    expect(getGuestSideFromUrl('https://example.test/?side=both')).toBe('both')
  })

  it('falls back safely for malformed or unsupported input', () => {
    expect(getGuestNameFromUrl('https://example.test/?guest=%ZZ')).toBeNull()
    expect(getGuestSideFromUrl('https://example.test/?side=unknown')).toBe('both')
    expect(getGuestSideFromUrl('https://example.test/')).toBe('both')
  })

  it('normalizes long and control-character guest names', () => {
    expect(normalizeGuestName('  Gia   đình\u0000 Anh   Chị  ')).toBe('Gia đình Anh Chị')
    expect(normalizeGuestName('x'.repeat(100))).toHaveLength(80)
  })
})
