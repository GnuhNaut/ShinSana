interface DateParts { year: number; monthIndex: number; day: number }

export function parseIsoDateParts(isoDate: string): DateParts {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) throw new Error('Invalid wedding date')
  return { year, monthIndex: month - 1, day }
}

export function formatEnglishMonthYear(isoDate: string): string {
  const { year, monthIndex } = parseIsoDateParts(isoDate)
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, monthIndex, 1)))
  return `${month} · ${year}`
}

export function formatEnglishMonthDay(isoDate: string): string {
  const { year, monthIndex, day } = parseIsoDateParts(isoDate)
  const month = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, monthIndex, day)))
  const tens = day % 100
  const suffix = tens >= 11 && tens <= 13 ? 'th' : day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th'
  return `${month} ${day}${suffix}`
}
