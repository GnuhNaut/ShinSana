import type { GuestSide } from '../types/wedding'

export const MAX_GUEST_NAME_LENGTH = 80

export function normalizeGuestName(value: string | null | undefined): string | null {
  if (!value) return null
  const withoutControls = Array.from(value, (character) => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127 ? ' ' : character
  }).join('')
  const normalized = withoutControls.replace(/\s+/g, ' ').trim().slice(0, MAX_GUEST_NAME_LENGTH)
  return normalized || null
}

function readQueryValue(input: string, key: string): string | null {
  const query = input.includes('?') ? input.slice(input.indexOf('?') + 1) : input
  const pair = query.split('&').find((part) => part.split('=', 1)[0] === key)
  if (!pair) return null
  const rawValue = pair.includes('=') ? pair.slice(pair.indexOf('=') + 1) : ''
  if (/%(?![0-9a-f]{2})/i.test(rawValue)) return null
  return rawValue
}

export function getGuestNameFromUrl(input?: string): string | null {
  try {
    const href = input ?? (typeof window === 'undefined' ? 'https://wedding.local/' : window.location.href)
    const url = new URL(href, 'https://wedding.local/')
    const raw = readQueryValue(url.search.slice(1), 'guest')
    if (!raw) return null
    return normalizeGuestName(decodeURIComponent(raw.replace(/\+/g, ' ')))
  } catch {
    return null
  }
}

export function getGuestSideFromUrl(input?: string): GuestSide {
  try {
    const href = input ?? (typeof window === 'undefined' ? 'https://wedding.local/' : window.location.href)
    const url = new URL(href, 'https://wedding.local/')
    const raw = readQueryValue(url.search.slice(1), 'side')
    if (!raw) return 'both'
    const value = decodeURIComponent(raw.replace(/\+/g, ' ')).trim().toLowerCase()
    if (value === 'groom' || value === 'nhà trai' || value === 'nha trai') return 'groom'
    if (value === 'bride' || value === 'nhà gái' || value === 'nha gai') return 'bride'
    if (value === 'both' || value === 'all' || value === 'cả hai' || value === 'ca hai') return 'both'
    return 'both'
  } catch {
    return 'both'
  }
}
