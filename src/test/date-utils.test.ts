import { describe, expect, it } from 'vitest'
import { generateMonthCalendar } from '../utils/calendar'
import { getCountdownParts } from '../utils/countdown'
import { formatEnglishMonthDay, formatEnglishMonthYear, parseIsoDateParts } from '../utils/dateFormat'
import { calendarDataUri, generateAllDayIcs, generateCalendarIcs } from '../utils/ics'

describe('countdown calculation', () => {
  const target = '2026-10-19T00:00:00+07:00'

  it('splits the remaining duration before the wedding', () => {
    expect(getCountdownParts(target, new Date('2026-10-16T20:55:54+07:00'))).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 6,
      isComplete: false,
    })
  })

  it('compares a UTC device clock with the Vietnam-offset target as absolute instants', () => {
    expect(getCountdownParts(target, new Date('2026-10-16T13:55:54Z'))).toEqual({
      days: 2,
      hours: 3,
      minutes: 4,
      seconds: 6,
      isComplete: false,
    })
  })

  it.each([
    ['at the wedding instant', '2026-10-19T00:00:00+07:00'],
    ['after the wedding', '2026-10-20T12:00:00+07:00'],
    ['for an invalid target', 'not-a-date'],
  ])('never returns negative values %s', (_label, nowOrTarget) => {
    const result = nowOrTarget === 'not-a-date'
      ? getCountdownParts(nowOrTarget, new Date('2026-10-19T00:00:00+07:00'))
      : getCountdownParts(target, new Date(nowOrTarget))

    expect(result).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true })
  })
})

describe('October 2026 calendar', () => {
  it('starts on Thursday, contains 31 days, and highlights only October 19', () => {
    const cells = generateMonthCalendar(2026, 9, 19)

    expect(cells).toHaveLength(35)
    expect(cells.slice(0, 3).map(({ day }) => day)).toEqual([null, null, null])
    expect(cells[3]).toEqual({ day: 1, isWeddingDay: false })
    expect(cells[21]).toEqual({ day: 19, isWeddingDay: true })
    expect(cells[33]).toEqual({ day: 31, isWeddingDay: false })
    expect(cells[34]).toEqual({ day: null, isWeddingDay: false })
    expect(cells.filter(({ isWeddingDay }) => isWeddingDay)).toHaveLength(1)
  })
})

describe('config-derived editorial date labels', () => {
  it('parses the ISO date and formats the English cover labels', () => {
    expect(parseIsoDateParts('2026-10-19')).toEqual({ year: 2026, monthIndex: 9, day: 19 })
    expect(formatEnglishMonthYear('2026-10-19')).toBe('October · 2026')
    expect(formatEnglishMonthDay('2026-10-19')).toBe('October 19th')
  })
})

describe('all-day calendar event', () => {
  const generatedAt = new Date('2026-08-15T00:00:00Z')
  const event = {
    title: 'Đám cưới Tuấn Hùng & Sao Mai',
    date: '2026-10-19',
    description: 'Trân trọng mời bạn,\nđến chung vui.',
    location: 'Sảnh A; tầng 2',
  }

  it('uses the wedding date and an exclusive next-day end date', () => {
    const ics = generateAllDayIcs(event, generatedAt)

    expect(ics).toContain('BEGIN:VCALENDAR\r\n')
    expect(ics).toContain('DTSTAMP:20260815T000000Z\r\n')
    expect(ics).toContain('DTSTART;VALUE=DATE:20261019\r\n')
    expect(ics).toContain('DTEND;VALUE=DATE:20261020\r\n')
    expect(ics).toContain('SUMMARY:Đám cưới Tuấn Hùng & Sao Mai\r\n')
    expect(ics).toContain('DESCRIPTION:Trân trọng mời bạn\\,\\nđến chung vui.\r\n')
    expect(ics).toContain('LOCATION:Sảnh A\\; tầng 2\r\n')
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
  })

  it('creates a downloadable data URI containing the same event', () => {
    const uri = calendarDataUri(event, generatedAt)

    expect(uri).toMatch(/^data:text\/calendar;charset=utf-8,/)
    expect(decodeURIComponent(uri.split(',')[1] ?? '')).toBe(generateAllDayIcs(event, generatedAt))
  })

  it('switches to a UTC timed event when confirmed times are configured', () => {
    const ics = generateCalendarIcs({
      ...event,
      startIso: '2026-10-19T10:00:00+07:00',
      endIso: '2026-10-19T12:00:00+07:00',
    }, generatedAt)

    expect(ics).toContain('DTSTART:20261019T030000Z\r\n')
    expect(ics).toContain('DTEND:20261019T050000Z\r\n')
    expect(ics).not.toContain('DTSTART;VALUE=DATE')
  })
})
