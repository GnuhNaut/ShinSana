import type {
  GuestSide,
  WeddingConfig,
  WeddingEvent,
  WeddingFamily,
} from '../types/wedding.ts'
import { cleanOptionalText, safeExternalUrl, safePhoneHref } from './contentSafety.ts'

export interface ResolvedWeddingEvent extends Omit<WeddingEvent, 'calendar'> {
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

/** A title is real content; metadata such as id, side, or type is not. */
export function eventHasMeaningfulDetails(event: WeddingEvent): boolean {
  return [
    event.title,
    event.date,
    event.lunarDate,
    event.guestArrivalTime,
    event.ceremonyTime,
    event.receptionTime,
    event.venueName,
    event.address,
    event.mapUrl,
    event.mapEmbedUrl,
    event.parkingNote,
    event.contactName,
    event.contactPhone,
    event.calendar?.eventStartIso,
    event.calendar?.eventEndIso,
  ].some((value) => cleanOptionalText(value).length > 0)
}

/** A family label alone never exposes an otherwise empty production block. */
export function familyHasMeaningfulDetails(family: WeddingFamily | null | undefined): boolean {
  if (!family) return false
  return [family.father, family.mother, family.location]
    .some((value) => cleanOptionalText(value).length > 0)
}

export function getDisplayableEvents(config: WeddingConfig): WeddingEvent[] {
  const ids = new Set<string>()
  return config.events.filter((event) => {
    const id = cleanOptionalText(event.id)
    if (!id || ids.has(id) || !cleanOptionalText(event.title) || !eventHasMeaningfulDetails(event)) return false
    ids.add(id)
    return true
  })
}

/** Returns a new array, keeping config order stable within each priority group. */
export function orderEventsForGuest(events: readonly WeddingEvent[], side: GuestSide): WeddingEvent[] {
  if (side === 'both') return [...events]

  const priority = (event: WeddingEvent): number => {
    if (event.side === side) return 0
    if (!event.side || event.side === 'both') return 1
    return 2
  }

  return events
    .map((event, index) => ({ event, index }))
    .sort((left, right) => priority(left.event) - priority(right.event) || left.index - right.index)
    .map(({ event }) => event)
}

export function resolveWeddingEvent(event: WeddingEvent): ResolvedWeddingEvent {
  const date = cleanOptionalText(event.date)
  const formatted = formatIsoDate(date)
  const calendar = safeCalendarRange(
    event.calendar?.eventStartIso,
    event.calendar?.eventEndIso,
  )

  return {
    ...event,
    id: event.id.trim(),
    title: event.title.trim(),
    ...(event.eyebrow ? { eyebrow: event.eyebrow.trim() } : {}),
    ...(date ? { date } : {}),
    dateDisplay: formatted.display,
    dateDisplayLong: formatted.displayLong,
    weekday: formatted.weekday,
    calendar: {
      startIso: calendar?.startIso ?? '',
      endIso: calendar?.endIso ?? '',
    },
    hasLocation: Boolean(cleanOptionalText(event.venueName) || cleanOptionalText(event.address)),
    hasTime: Boolean(
      cleanOptionalText(event.guestArrivalTime)
      || cleanOptionalText(event.ceremonyTime)
      || cleanOptionalText(event.receptionTime)
      || calendar,
    ),
  }
}

/** Keeps malformed optional timestamps from reaching the ICS formatter during render. */
export function safeCalendarRange(
  startValue: string | null | undefined,
  endValue: string | null | undefined,
): { startIso: string; endIso: string } | null {
  const startIso = cleanOptionalText(startValue)
  const endIso = cleanOptionalText(endValue)
  const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/
  if (!timestampPattern.test(startIso) || !timestampPattern.test(endIso)) return null

  const start = new Date(startIso)
  const end = new Date(endIso)
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return null
  return { startIso, endIso }
}

export { safeExternalUrl, safePhoneHref }
