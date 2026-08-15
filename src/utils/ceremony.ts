import type { CeremonyEvent, WeddingConfig } from '../types/wedding'

export interface ResolvedCeremony {
  key: 'brideSide' | 'groomSide'
  label: string
  eventTitle: string
  date: string
  dateDisplay: string
  dateDisplayLong: string
  lunarDate: string
  time: string
  venueName: string
  address: string
  mapNavigationUrl: string
  mapEmbedUrl: string
  calendar: { startIso: string; endIso: string }
  hasLocation: boolean
  hasTime: boolean
  weekday: string
}

function pad(value: number): string { return value.toString().padStart(2, '0') }

function formatIsoDate(iso: string): { display: string; displayLong: string; weekday: string } {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return { display: iso, displayLong: iso, weekday: '' }
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' }).format(date)
  const display = `${pad(day)}.${pad(month)}.${year}`
  const displayLong = `${day} tháng ${month} năm ${year}`
  return { display, displayLong, weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1) }
}

export function resolveCeremony(config: WeddingConfig, key: 'brideSide' | 'groomSide'): ResolvedCeremony {
  const source = config.events[key]
  const date = source.date || config.date.iso
  const formatted = formatIsoDate(date)
  return {
    key,
    label: source.label,
    eventTitle: source.eventTitle,
    date,
    dateDisplay: formatted.display,
    dateDisplayLong: formatted.displayLong,
    lunarDate: source.lunarDate,
    time: source.time,
    venueName: source.venueName,
    address: source.address,
    mapNavigationUrl: source.mapNavigationUrl,
    mapEmbedUrl: source.mapEmbedUrl,
    calendar: { startIso: source.calendar.eventStartIso, endIso: source.calendar.eventEndIso },
    hasLocation: Boolean(source.venueName || source.address),
    hasTime: Boolean(source.calendar.eventStartIso && source.calendar.eventEndIso),
    weekday: formatted.weekday,
  }
}

export function ceremonyTitle(config: WeddingConfig, resolved: ResolvedCeremony): string {
  if (resolved.eventTitle) return resolved.eventTitle
  return resolved.key === 'brideSide' ? `Lễ vu quy · ${config.couple.bride.fullName}` : `Lễ thành hôn · ${config.couple.groom.fullName}`
}

export function ceremonyEnabled(config: WeddingConfig, key: 'brideSide' | 'groomSide'): boolean {
  return config.events[key].enabled
}

export function safeExternalUrl(value: string): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export type CeremonySummary = CeremonyEvent
