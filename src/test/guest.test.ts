import { describe, expect, it } from 'vitest'
import { getGuestNameFromUrl, MAX_GUEST_NAME_LENGTH, normalizeGuestName } from '../utils/guest'

describe('guest query parser', () => {
  it('returns null for missing and empty guest values', () => {
    expect(getGuestNameFromUrl('https://wedding.test/')).toBeNull()
    expect(getGuestNameFromUrl('https://wedding.test/?guest=')).toBeNull()
    expect(normalizeGuestName(' \n\t ')).toBeNull()
  })

  it('decodes URL-encoded and Unicode names', () => {
    expect(getGuestNameFromUrl('https://wedding.test/?guest=Nguyen%20Van%20An')).toBe('Nguyen Van An')
    expect(getGuestNameFromUrl('https://wedding.test/?guest=Nguy%E1%BB%85n+V%C4%83n+An')).toBe('Nguyễn Văn An')
  })

  it('normalizes whitespace and strips control characters', () => {
    expect(normalizeGuestName('  Nguyễn\u0000\t  Văn\n An  ')).toBe('Nguyễn Văn An')
  })

  it('limits names to the documented maximum length', () => {
    const result = normalizeGuestName('A'.repeat(MAX_GUEST_NAME_LENGTH + 25))
    expect(result).toBe('A'.repeat(MAX_GUEST_NAME_LENGTH))
  })

  it('fails safely for malformed URLs', () => {
    expect(getGuestNameFromUrl('http://[')).toBeNull()
    expect(getGuestNameFromUrl('https://wedding.test/?guest=%E0%A4%A')).toBeNull()
    expect(getGuestNameFromUrl('https://wedding.test/?guest=Mai%2')).toBeNull()
  })
})
