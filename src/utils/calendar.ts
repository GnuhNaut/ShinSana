export interface CalendarDay { day: number | null; isWeddingDay: boolean }

export function generateMonthCalendar(year: number, monthIndex: number, highlightedDay: number): CalendarDay[] {
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const mondayBasedStart = (new Date(Date.UTC(year, monthIndex, 1)).getUTCDay() + 6) % 7
  const cells: CalendarDay[] = Array.from({ length: mondayBasedStart }, () => ({ day: null, isWeddingDay: false }))
  for (let day = 1; day <= daysInMonth; day += 1) cells.push({ day, isWeddingDay: day === highlightedDay })
  while (cells.length % 7 !== 0) cells.push({ day: null, isWeddingDay: false })
  return cells
}
