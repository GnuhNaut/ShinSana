import type { CeremonyEvent, GuestSide, WeddingConfig } from '../types/wedding.ts'

export interface ResolvedCeremony extends Omit<CeremonyEvent, 'calendar'> {
  dateDisplay: string
  dateDisplayLong: string
  weekday: string
  calendar: { startIso: string; endIso: string }
  hasLocation: boolean
  hasTime: boolean
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return null

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null

  return { year, month, day }
}

function formatIsoDate(iso: string): { display: string; displayLong: string; weekday: string } {
  const parts = parseIsoDate(iso)
  if (!parts) return { display: '', displayLong: '', weekday: '' }

  const { year, month, day } = parts
  const date = new Date(Date.UTC(year, month - 1, day))
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' }).format(date)

  return {
    display: `${pad(day)}.${pad(month)}.${year}`,
    displayLong: `${day} tháng ${month} năm ${year}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  }
}

/**
 * Tests whether an event contains substantive, guest-facing details. A label by
 * itself is intentionally not enough to turn an empty template into content.
 */
export function eventHasMeaningfulDetails(event: CeremonyEvent): boolean {
  return [
    event.eventTitle,
    event.date,
    event.lunarDate,
    event.guestArrivalTime,
    event.ceremonyTime,
    event.banquetTime,
    event.venueName,
    event.address,
    event.phone,
    event.mapNavigationUrl,
    event.mapEmbedUrl,
    event.calendar.eventStartIso,
    event.calendar.eventEndIso,
  ].some((value) => value.trim().length > 0)
}

export function getEnabledEvents(config: WeddingConfig): CeremonyEvent[] {
  return config.events.filter((event) => event.enabled)
}

/** Returns a new array, keeping config order stable within each priority group. */
export function orderEventsForGuest(events: readonly CeremonyEvent[], side: GuestSide): CeremonyEvent[] {
  if (side === 'both') return [...events]

  const priority = (event: CeremonyEvent): number => {
    if (event.side === side) return 0
    if (!event.side) return 1
    return 2
  }

  return events
    .map((event, index) => ({ event, index }))
    .sort((left, right) => priority(left.event) - priority(right.event) || left.index - right.index)
    .map(({ event }) => event)
}

export function resolveCeremony(_config: WeddingConfig, event: CeremonyEvent): ResolvedCeremony {
  // Kept in the signature so consumers can resolve events against one config API.
  void _config
  const formatted = formatIsoDate(event.date)

  return {
    ...event,
    dateDisplay: formatted.display,
    dateDisplayLong: formatted.displayLong,
    weekday: formatted.weekday,
    calendar: {
      startIso: event.calendar.eventStartIso,
      endIso: event.calendar.eventEndIso,
    },
    hasLocation: Boolean(event.venueName.trim() || event.address.trim()),
    hasTime: Boolean(
      event.guestArrivalTime.trim()
      || event.ceremonyTime.trim()
      || event.banquetTime.trim()
      || (event.calendar.eventStartIso.trim() && event.calendar.eventEndIso.trim()),
    ),
  }
}

/** No ceremony type is inferred when the family has not supplied one. */
export function ceremonyTitle(event: Pick<CeremonyEvent, 'eventTitle'>): string {
  return event.eventTitle.trim()
}

export function ceremonyEnabled(event: Pick<CeremonyEvent, 'enabled'>): boolean {
  return event.enabled
}

export function safeExternalUrl(value: string): string | null {
  const candidate = value.trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

export type CeremonySummary = CeremonyEvent
