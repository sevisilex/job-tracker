import React from 'react';
import { JobApplication } from '../types';

interface CalendarProps {
  applications: JobApplication[];
}

interface Totals {
  pending: number;
  sent: number;
  rejected: number;
}

interface DayProps {
  date: Date;
  counts: Totals;
}

const Calendar: React.FC<CalendarProps> = ({ applications }) => {
  const getApplicationCountsByDay = () => {
    const counts = new Map<string, { pending: number; sent: number; rejected: number }>();

    applications.forEach(app => {
      const date = new Date(app.createdAt);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!counts.has(dateKey)) {
        counts.set(dateKey, { pending: 0, sent: 0, rejected: 0 });
      }

      const dayCount = counts.get(dateKey)!;

      if (app.rejectedAt) dayCount.rejected++;
      else if (app.appliedAt) dayCount.sent++;
      else dayCount.pending++;
    });

    return counts;
  };

  // Generuj dni dla aktualnego miesiąca
  const getDaysInMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    // const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: DayProps[] = [];

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const dayCounts = applicationCounts.get(dateKey) || { pending: 0, sent: 0, rejected: 0 };
      days.push({ date, counts: dayCounts });
    }

    return days;
  };


  const getWeekTotals = (weekDays: DayProps[]): Totals => {
    return weekDays.reduce((totals, day) => ({
      pending: totals.pending + day.counts.pending,
      sent: totals.sent + day.counts.sent,
      rejected: totals.rejected + day.counts.rejected,
    }), { pending: 0, sent: 0, rejected: 0 });
  };

  const getMonthTotals = () => {
    return days.reduce((totals, day) => ({
      pending: totals.pending + day.counts.pending,
      sent: totals.sent + day.counts.sent,
      rejected: totals.rejected + day.counts.rejected,
    }), { pending: 0, sent: 0, rejected: 0 });
  };

  const splitIntoWeeks = (days: DayProps[]): DayProps[][] => {
    const weeks: DayProps[][] = [];
    let currentWeek: DayProps[] = [];

    // Add empty days at the start
    const firstDay = days[0].date;
    const emptyDaysStart = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < emptyDaysStart; i++) {
      currentWeek.push({
        date: new Date(firstDay.getFullYear(), firstDay.getMonth(), 0 - (emptyDaysStart - i - 1)),
        counts: { pending: 0, sent: 0, rejected: 0 }
      });
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (day.date.getDay() === 0 || currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Add empty days at the end if needed
    if (currentWeek.length > 0) {
      const lastDay = days[days.length - 1].date;
      const emptyDaysEnd = 7 - currentWeek.length;
      for (let i = 1; i <= emptyDaysEnd; i++) {
        currentWeek.push({
          date: new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() + i),
          counts: { pending: 0, sent: 0, rejected: 0 }
        });
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const applicationCounts = getApplicationCountsByDay();
  const days = getDaysInMonth();
  const weekdays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];
  const monthTotals = getMonthTotals();

  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <h3 className="font-mono text-xl font-semibold mb-4 text-center">
        {new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
      </h3>

      <div className="grid grid-cols-8 gap-1">
        {weekdays.map(day => (
          <div key={day} className="text-center font-mono text-sm p-2">
            {day}
          </div>
        ))}
        <div className="text-center font-mono text-sm p-2">Tydzień</div>

        {splitIntoWeeks(days).map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`p-2 text-center rounded ${day.date.getMonth() === new Date().getMonth() ? // Sprawdzamy czy dzień należy do aktualnego miesiąca
                  (day.counts.pending || day.counts.sent || day.counts.rejected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100')
                  : 'text-gray-300' // Dni z poprzedniego/następnego miesiąca będą wyszarzone
                  }`}
                title={day.counts.pending + day.counts.sent + day.counts.rejected ?
                  `Utworzone: ${day.counts.pending + day.counts.sent + day.counts.rejected}, Oczekuje: ${day.counts.pending}, Wysłane: ${day.counts.sent}, Odrzucone: ${day.counts.rejected}` :
                  'Brak aplikacji'}
              >
                <div className="font-mono text-xs">{day.date.getDate()}</div>
                {day.date.getMonth() === new Date().getMonth() && ( // Pokazujemy liczniki tylko dla dni z aktualnego miesiąca
                  <div className="font-mono">
                    {day.counts.pending ? (<b className="text-blue-300"> {day.counts.pending} </b>) : ''}
                    {day.counts.sent ? (<b className="text-green-400"> {day.counts.sent} </b>) : ''}
                    {day.counts.rejected ? (<b className="text-red-300"> {day.counts.rejected} </b>) : ''}
                  </div>
                )}
              </div>
            ))}
            {/* Weekly totals */}
            {(() => {
              const totals = getWeekTotals(week.filter(day =>
                day.counts.pending + day.counts.sent + day.counts.rejected > 0
              ));
              return (
                <div
                  className="p-2 text-center rounded bg-gray-50"
                  title={totals.pending + totals.sent + totals.rejected ? `Utworzone: ${totals.pending + totals.sent + totals.rejected}, Oczekuje: ${totals.pending}, Wysłane: ${totals.sent}, Odrzucone: ${totals.rejected}` :
                    'Brak aplikacji'}
                >
                  <div className="font-mono pt-4">
                    {totals.pending + totals.sent + totals.rejected ?
                      <>
                        {totals.pending ? (<b className="text-blue-300"> {totals.pending} </b>) : ''}
                        {totals.sent ? (<b className="text-green-400"> {totals.sent} </b>) : ''}
                        {totals.rejected ? (<b className="text-red-300"> {totals.rejected} </b>) : ''}
                      </> : <b className="text-gray-300">-</b>}
                  </div>
                </div>
              );
            })()}
          </React.Fragment>
        ))}
      </div>

      {/* Monthly totals */}
      <div className="mt-4 text-center">
        <div className="font-mono">
          <b className="text-sm text-gray-300">Utworzone:</b> {monthTotals.pending ? (<b className="text-gray-500"> {monthTotals.pending + monthTotals.sent + monthTotals.rejected} </b>) : ''}
          <b className="text-sm text-gray-300">Niewysłane:</b> {monthTotals.pending ? (<b className="text-blue-300"> {monthTotals.pending} </b>) : ''}
          <b className="text-sm text-gray-300">Aplikowane:</b> {monthTotals.sent ? (<b className="text-green-400"> {monthTotals.sent} </b>) : ''}
          <b className="text-sm text-gray-300">Odrzucone:</b> {monthTotals.rejected ? (<b className="text-red-300"> {monthTotals.rejected} </b>) : ''}
        </div>
      </div>
    </div>
  );
};

export default Calendar;