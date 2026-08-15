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

export function getGuestNameFromUrl(input?: string): string | null {
  try {
    const href = input ?? (typeof window === 'undefined' ? 'https://wedding.local/' : window.location.href)
    const url = new URL(href, 'https://wedding.local/')
    const guestPair = url.search.slice(1).split('&').find((part) => part.split('=', 1)[0] === 'guest')
    if (!guestPair) return null
    const rawValue = guestPair.includes('=') ? guestPair.slice(guestPair.indexOf('=') + 1) : ''
    if (/%(?![0-9a-f]{2})/i.test(rawValue)) return null
    return normalizeGuestName(decodeURIComponent(rawValue.replace(/\+/g, ' ')))
  } catch {
    return null
  }
}
