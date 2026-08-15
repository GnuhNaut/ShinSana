export interface CalendarEventInput {
  title: string
  date: string
  description?: string
  location?: string
  startIso?: string
  endIso?: string
}

function escapeIcs(value: string): string { return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n') }
function foldIcsLine(line: string): string {
  const encoder = new TextEncoder()
  const segments: string[] = []
  let segment = ''
  let bytes = 0

  for (const character of line) {
    const characterBytes = encoder.encode(character).length
    const limit = segments.length === 0 ? 75 : 74
    if (segment && bytes + characterBytes > limit) {
      segments.push(segment)
      segment = character
      bytes = characterBytes
    } else {
      segment += character
      bytes += characterBytes
    }
  }
  if (segment) segments.push(segment)
  return segments.join('\r\n ')
}
function compactDate(date: string): string { return date.replaceAll('-', '') }
function nextDay(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`)
  parsed.setUTCDate(parsed.getUTCDate() + 1)
  return parsed.toISOString().slice(0, 10).replaceAll('-', '')
}

function formatUtcTimestamp(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid calendar timestamp')
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function generateIcs(event: CalendarEventInput, generatedAt: Date, forceAllDay: boolean): string {
  const start = compactDate(event.date)
  const hasTime = !forceAllDay && Boolean(event.startIso && event.endIso)
  const dateLines = hasTime
    ? [`DTSTART:${formatUtcTimestamp(event.startIso!)}`, `DTEND:${formatUtcTimestamp(event.endIso!)}`]
    : [`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${nextDay(event.date)}`]
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//October Folio//Wedding Invitation//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${start}-${encodeURIComponent(event.title)}@october-folio.local`,
    `DTSTAMP:${formatUtcTimestamp(generatedAt)}`,
    ...dateLines,
    `SUMMARY:${escapeIcs(event.title)}`,
  ]
  if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`)
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`)
  lines.push('END:VEVENT', 'END:VCALENDAR', '')
  return lines.map(foldIcsLine).join('\r\n')
}

export function generateAllDayIcs(event: CalendarEventInput, generatedAt = new Date()): string {
  return generateIcs(event, generatedAt, true)
}

export function generateCalendarIcs(event: CalendarEventInput, generatedAt = new Date()): string {
  return generateIcs(event, generatedAt, false)
}

export function calendarDataUri(event: CalendarEventInput, generatedAt = new Date()): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(generateCalendarIcs(event, generatedAt))}`
}
