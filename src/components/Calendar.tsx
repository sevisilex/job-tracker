import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { JobApplication } from '../types'

interface CalendarProps {
  applications: JobApplication[]
  onDateClick?: (date: string) => void
}

interface Totals {
  pending: number
  sent: number
  rejected: number
}

interface DayProps {
  date: Date
  counts: Totals
}

const Calendar: React.FC<CalendarProps> = ({ applications, onDateClick }) => {
  const { t } = useLanguage()

  const [currentDate, setCurrentDate] = React.useState(new Date())

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getApplicationCountsByDay = () => {
    const counts = new Map<string, { pending: number; sent: number; rejected: number }>()

    applications.forEach((app) => {
      const date = new Date(app.createdAt)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      if (!counts.has(dateKey)) {
        counts.set(dateKey, { pending: 0, sent: 0, rejected: 0 })
      }

      const dayCount = counts.get(dateKey)!

      if (app.rejectedAt) dayCount.rejected++
      else if (app.appliedAt) dayCount.sent++
      else dayCount.pending++
    })

    return counts
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const lastDay = new Date(year, month + 1, 0)
    const days: DayProps[] = []

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const dayCounts = applicationCounts.get(dateKey) || { pending: 0, sent: 0, rejected: 0 }
      days.push({ date, counts: dayCounts })
    }

    return days
  }

  const getWeekTotals = (weekDays: DayProps[]): Totals => {
    return weekDays.reduce(
      (totals, day) => ({
        pending: totals.pending + day.counts.pending,
        sent: totals.sent + day.counts.sent,
        rejected: totals.rejected + day.counts.rejected,
      }),
      { pending: 0, sent: 0, rejected: 0 }
    )
  }

  const getMonthTotals = () => {
    const currentMonthDays = days.filter((day) => day.date.getMonth() === currentDate.getMonth())

    return currentMonthDays.reduce(
      (totals, day) => ({
        pending: totals.pending + day.counts.pending,
        sent: totals.sent + day.counts.sent,
        rejected: totals.rejected + day.counts.rejected,
      }),
      { pending: 0, sent: 0, rejected: 0 }
    )
  }

  const splitIntoWeeks = (days: DayProps[]): DayProps[][] => {
    const weeks: DayProps[][] = []
    let currentWeek: DayProps[] = []

    const firstDay = days[0].date
    const emptyDaysStart = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    for (let i = 0; i < emptyDaysStart; i++) {
      currentWeek.push({
        date: new Date(firstDay.getFullYear(), firstDay.getMonth(), 0 - (emptyDaysStart - i - 1)),
        counts: { pending: 0, sent: 0, rejected: 0 },
      })
    }

    days.forEach((day) => {
      currentWeek.push(day)
      if (day.date.getDay() === 0 || currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      const lastDay = days[days.length - 1].date
      const emptyDaysEnd = 7 - currentWeek.length
      for (let i = 1; i <= emptyDaysEnd; i++) {
        currentWeek.push({
          date: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + i),
          counts: { pending: 0, sent: 0, rejected: 0 },
        })
      }
      weeks.push(currentWeek)
    }

    return weeks
  }

  const applicationCounts = getApplicationCountsByDay()
  const days = getDaysInMonth()
  const weekdays = [
    t('calendar.weekdays.mon'),
    t('calendar.weekdays.tue'),
    t('calendar.weekdays.wed'),
    t('calendar.weekdays.thu'),
    t('calendar.weekdays.fri'),
    t('calendar.weekdays.sat'),
    t('calendar.weekdays.sun'),
  ]
  const monthName = t(`calendar.months.${currentDate.toLocaleDateString('en-US', { month: 'short' }).toLowerCase()}`)
  const monthTotals = getMonthTotals()

  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <div className="flex items-center justify-center gap-4 mb-4">
        <button onClick={handlePreviousMonth} className="p-2 rounded hover:bg-gray-100" title={t('calendar.previousMonth')}>
          ←
        </button>
        <h3 className="font-mono text-xl font-semibold">
          {monthName} {currentDate.getFullYear()}
        </h3>
        <button onClick={handleNextMonth} className="p-2 rounded hover:bg-gray-100" title={t('calendar.nextMonth')}>
          →
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1">
        {weekdays.map((day) => (
          <div key={day} className="text-center font-mono text-sm p-2">
            {day}
          </div>
        ))}
        <div className="text-center font-mono text-sm p-2">{t('calendar.week')}</div>

        {splitIntoWeeks(days).map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              const hasApplications = day.counts.pending + day.counts.sent + day.counts.rejected > 0

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`p-2 text-center rounded ${
                    day.date.getMonth() === currentDate.getMonth()
                      ? hasApplications
                        ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                        : 'cursor-default'
                      : 'text-gray-300 cursor-default'
                  }`}
                  onClick={() => {
                    if (hasApplications && onDateClick) {
                      const formattedDate = `${day.date.getFullYear()}.${String(day.date.getMonth() + 1).padStart(
                        2,
                        '0'
                      )}.${String(day.date.getDate()).padStart(2, '0')}`
                      onDateClick(formattedDate)
                    }
                  }}
                  title={
                    day.counts.pending + day.counts.sent + day.counts.rejected
                      ? `${t('calendar.created')}: ${day.counts.pending + day.counts.sent + day.counts.rejected}, ${t('calendar.pending')}: ${day.counts.pending}, ${t('calendar.applied')}: ${day.counts.sent}, ${t('calendar.rejected')}: ${day.counts.rejected}`
                      : t('calendar.noApplication')
                  }
                >
                  <div className="font-mono text-xs">{day.date.getDate()}</div>
                  {day.date.getMonth() === currentDate.getMonth() && (
                    <div className="font-mono">
                      {day.counts.pending ? <b className="text-blue-300"> {day.counts.pending} </b> : ''}
                      {day.counts.sent ? <b className="text-green-400"> {day.counts.sent} </b> : ''}
                      {day.counts.rejected ? <b className="text-red-300"> {day.counts.rejected} </b> : ''}
                    </div>
                  )}
                </div>
              )
            })}
            {/* Weekly totals */}
            {(() => {
              const totals = getWeekTotals(week.filter((day) => day.counts.pending + day.counts.sent + day.counts.rejected > 0))
              return (
                <div
                  className="p-2 text-center rounded bg-gray-50"
                  title={
                    totals.pending + totals.sent + totals.rejected
                      ? `${t('calendar.created')}: ${totals.pending + totals.sent + totals.rejected}, ${t('calendar.pending')}: ${totals.pending}, ${t('calendar.applied')}: ${totals.sent}, ${t('calendar.rejected')}: ${totals.rejected}`
                      : t('calendar.noApplication')
                  }
                >
                  <div className="font-mono pt-4">
                    {totals.pending + totals.sent + totals.rejected ? (
                      <>
                        {totals.pending ? <b className="text-blue-300"> {totals.pending} </b> : ''}
                        {totals.sent ? <b className="text-green-400"> {totals.sent} </b> : ''}
                        {totals.rejected ? <b className="text-red-300"> {totals.rejected} </b> : ''}
                      </>
                    ) : (
                      <b className="text-gray-300">-</b>
                    )}
                  </div>
                </div>
              )
            })()}
          </React.Fragment>
        ))}
      </div>

      {/* Monthly totals */}
      <div className="mt-4 text-center">
        <div className="font-mono">
          <b className="text-sm text-gray-300">{t('calendar.created')}:</b>{' '}
          <b className="text-gray-500"> {monthTotals.pending + monthTotals.sent + monthTotals.rejected} </b>
          <b className="text-sm text-gray-300">{t('calendar.pending')}:</b> <b className="text-blue-300"> {monthTotals.pending} </b>
          <b className="text-sm text-gray-300">{t('calendar.applied')}:</b> <b className="text-green-400"> {monthTotals.sent} </b>
          <b className="text-sm text-gray-300">{t('calendar.rejected')}:</b> <b className="text-red-300"> {monthTotals.rejected} </b>
        </div>
      </div>
    </div>
  )
}

export default Calendar
