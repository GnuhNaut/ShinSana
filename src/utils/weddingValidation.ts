import type { ImageAsset, WeddingConfig } from '../types/wedding.ts'
import { safeAssetUrl, safeExternalUrl, safePhoneHref } from './contentSafety.ts'
import { giftAccountHasRequiredDetails } from './gift.ts'

const EVENT_SIDES = new Set(['groom', 'bride', 'both'])
const EVENT_TYPES = new Set(['vu-quy', 'thanh-hon', 'wedding-party', 'ceremony', 'other'])
const GIFT_SIDES = new Set(['groom', 'bride'])

export function validateWeddingConfig(config: WeddingConfig): string[] {
  const errors: string[] = []

  if (!config.couple.groom.fullName.trim()) errors.push('Missing groom name')
  if (!config.couple.bride.fullName.trim()) errors.push('Missing bride name')
  if (!isValidIsoDate(config.date.iso)) errors.push('Invalid ISO wedding date')
  if (!config.date.lunar.trim()) errors.push('Missing lunar date')
  if (!isValidTimeZone(config.date.timezone)) errors.push('Invalid wedding timezone')
  if (!isValidIsoTimestamp(config.date.countdownIso)) errors.push('Invalid countdown timestamp')
  validateTimeRange(
    config.date.eventStartIso,
    config.date.eventEndIso,
    'Wedding event',
    errors,
    false,
  )

  validateImageAsset(config.hero, 'hero', errors)
  validateImageAsset(config.couple.groom.portrait, 'groom portrait', errors)
  validateImageAsset(config.couple.bride.portrait, 'bride portrait', errors)
  config.story.forEach((chapter, index) => validateImageAsset(chapter.image, `story image ${index + 1}`, errors))
  config.gallery.forEach((image, index) => validateImageAsset(image, `gallery image ${index + 1}`, errors))
  if (config.music.src.trim() && !safeAssetUrl(config.music.src)) errors.push('Invalid music asset URL')

  const eventIds = new Set<string>()
  for (const [index, event] of config.events.entries()) {
    const eventId = event.id.trim()
    const eventName = event.title.trim() || eventId || `event ${index + 1}`

    if (!eventId) errors.push(`Missing wedding event id at index ${index}`)
    else if (eventIds.has(eventId)) errors.push(`Duplicate wedding event id: ${eventId}`)
    else eventIds.add(eventId)

    if (!event.title.trim()) errors.push(`Missing wedding event title at index ${index}`)
    if (event.side && !EVENT_SIDES.has(event.side)) errors.push(`Invalid side for ${eventName}`)
    if (event.type && !EVENT_TYPES.has(event.type)) errors.push(`Invalid type for ${eventName}`)
    if (event.date && !isValidIsoDate(event.date)) errors.push(`Invalid ISO date for ${eventName}`)
    if (event.mapUrl?.trim() && !safeExternalUrl(event.mapUrl)) errors.push(`${eventName} map URL must be a safe HTTPS URL`)
    if (event.mapEmbedUrl?.trim() && !safeExternalUrl(event.mapEmbedUrl)) errors.push(`${eventName} map embed must be a safe HTTPS URL`)
    if (event.contactPhone?.trim() && !safePhoneHref(event.contactPhone)) errors.push(`Invalid contact phone for ${eventName}`)

    if (event.calendar) {
      validateTimeRange(
        event.calendar.eventStartIso,
        event.calendar.eventEndIso,
        `${eventName} calendar`,
        errors,
        true,
      )
    }
  }

  const giftIds = new Set<string>()
  if (config.gift.enabled && config.gift.accounts.length === 0) {
    errors.push('Online gift is enabled without accounts')
  }
  for (const [index, account] of config.gift.accounts.entries()) {
    const accountId = account.id.trim()
    const accountName = account.label?.trim() || accountId || `gift account ${index + 1}`

    if (!accountId) errors.push(`Missing gift account id at index ${index}`)
    else if (giftIds.has(accountId)) errors.push(`Duplicate gift account id: ${accountId}`)
    else giftIds.add(accountId)

    if (account.side && !GIFT_SIDES.has(account.side)) errors.push(`Invalid side for ${accountName}`)
    if (!giftAccountHasRequiredDetails(account)) errors.push(`${accountName} is missing required bank details`)
    if (account.qrImage?.trim() && !safeAssetUrl(account.qrImage)) errors.push(`${accountName} QR image must be a safe asset URL`)
  }

  if (config.gallery.length > 4) errors.push('Gallery must contain at most 4 images')
  if (!config.seo.title.trim() || !config.seo.description.trim()) errors.push('Missing SEO metadata')
  if (!safeAssetUrl(config.seo.image)) errors.push('Invalid SEO image URL')
  if (config.seo.siteUrl && !isSafeSiteUrl(config.seo.siteUrl)) errors.push('Invalid wedding site URL')

  return errors
}

export function warnForInvalidWeddingConfig(config: WeddingConfig): string[] {
  const errors = validateWeddingConfig(config)
  if (errors.length > 0) {
    console.warn(`[wedding-config]\n- ${errors.join('\n- ')}`)
  }
  return errors
}

function validateImageAsset(asset: ImageAsset, label: string, errors: string[]): void {
  if (!safeAssetUrl(asset.src)) errors.push(`Invalid ${label} URL`)
  if (!asset.srcSet) return

  for (const candidate of asset.srcSet.split(',')) {
    const [url] = candidate.trim().split(/\s+/, 1)
    if (!url || !safeAssetUrl(url)) errors.push(`Invalid ${label} srcSet URL`)
  }
}

function validateTimeRange(
  startValue: string,
  endValue: string,
  label: string,
  errors: string[],
  requireRange: boolean,
): void {
  const start = startValue.trim()
  const end = endValue.trim()
  if (!start && !end && !requireRange) return
  if (!start || !end) {
    errors.push(`${label} requires both start and end times`)
    return
  }
  if (!isValidIsoTimestamp(start) || !isValidIsoTimestamp(end)) {
    errors.push(`Invalid ${label} timestamp`)
    return
  }
  if (new Date(end) <= new Date(start)) errors.push(`Invalid ${label} time range`)
}

function isValidIsoTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false
  return Number.isFinite(new Date(value).getTime())
}

function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
}

function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('vi-VN', { timeZone: value }).format()
    return Boolean(value.trim())
  } catch {
    return false
  }
}

function isSafeSiteUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
      && Boolean(url.hostname)
      && !url.username
      && !url.password
  } catch {
    return false
  }
}
