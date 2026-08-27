/** Trims optional author-entered text without inventing a fallback value. */
export function cleanOptionalText(value: string | null | undefined): string {
  return value?.trim() ?? ''
}

/** Allows only credential-free HTTPS links for external navigation and embeds. */
export function safeExternalUrl(value: string | null | undefined): string | null {
  const candidate = cleanOptionalText(value)
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

/** Allows a root-relative public asset or a credential-free HTTPS asset URL. */
export function safeAssetUrl(value: string | null | undefined): string | null {
  const candidate = cleanOptionalText(value)
  if (!candidate) return null
  if (candidate.startsWith('/') && !candidate.startsWith('//')) return candidate
  return safeExternalUrl(candidate)
}

/** Returns a mobile-safe tel: link only when the value resembles a real phone number. */
export function safePhoneHref(value: string | null | undefined): string | null {
  const candidate = cleanOptionalText(value)
  if (!candidate) return null

  const compact = candidate.replace(/[\s().-]/g, '')
  if (!/^\+?\d{6,15}$/.test(compact)) return null
  return `tel:${compact}`
}
