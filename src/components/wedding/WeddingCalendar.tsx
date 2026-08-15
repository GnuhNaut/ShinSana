import { HairlineDivider, Lotus } from '../ornaments'
import { generateMonthCalendar } from '../../utils/calendar'
import { parseIsoDateParts } from '../../utils/dateFormat'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

export function WeddingCalendar({ isoDate }: { isoDate: string }) {
  const { year, monthIndex, day: weddingDay } = parseIsoDateParts(isoDate)
  const monthName = `Tháng ${monthIndex + 1}`
  const days = generateMonthCalendar(year, monthIndex, weddingDay)
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7))

  return (
    <div className="calendar calendar--oriental">
      <div className="calendar__header">
        <div className="calendar__month-lockup">
          <Lotus className="calendar__lotus" tone="rose" withWater={false} />
          <span>{monthName}</span>
        </div>
        <strong>{year}</strong>
      </div>
      <HairlineDivider className="calendar__divider" center="diamond" tone="rose" />
      <table className="calendar__table">
        <caption className="sr-only">Lịch tháng {monthIndex + 1} năm {year}; ngày {weddingDay} là ngày cưới</caption>
        <thead><tr>{WEEKDAYS.map((weekday) => <th scope="col" className="calendar__weekday" key={weekday}>{weekday}</th>)}</tr></thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((entry, dayIndex) => (
                <td
                  aria-current={entry.isWeddingDay ? 'date' : undefined}
                  aria-label={entry.isWeddingDay ? `${entry.day}, ngày cưới` : entry.day ? String(entry.day) : undefined}
                  className={`calendar__day ${entry.isWeddingDay ? 'calendar__day--wedding' : ''}`}
                  key={`${entry.day ?? 'empty'}-${dayIndex}`}
                >
                  {entry.day !== null && (
                    <span className="calendar__day-inner">
                      <span className="calendar__day-number">{entry.day}</span>
                      {entry.isWeddingDay && <span className="calendar__wedding-mark" aria-hidden="true" />}
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
