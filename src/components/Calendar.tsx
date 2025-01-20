import React from 'react';
import { JobApplication } from '../types';

interface CalendarProps {
  applications: JobApplication[];
}

interface DayProps {
  date: Date;
  counts: {
    pending: number;
    sent: number;
    rejected: number;
  };
}

const Calendar: React.FC<CalendarProps> = ({ applications }) => {
  const getApplicationCountsByDay = () => {
    const counts = new Map<string, { pending: number; sent: number; rejected: number }>();

    applications.forEach(app => {
      const date = new Date(app.createdAt);
      const dateKey = date.toISOString().split('T')[0];

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

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: DayProps[] = [];

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateKey = date.toISOString().split('T')[0];
      const dayCounts = applicationCounts.get(dateKey) || { pending: 0, sent: 0, rejected: 0 };
      days.push({ date, counts: dayCounts });
    }

    return days;
  };

  const applicationCounts = getApplicationCountsByDay();
  const days = getDaysInMonth();
  const weekdays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz'];

  return (
    <div className="bg-white p-4 rounded shadow-sm mb-4">
      <h3 className="font-mono text-xl font-semibold mb-4 text-center">
        {new Date().toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
      </h3>

      <div className="grid grid-cols-7 gap-1">
        {weekdays.map(day => (
          <div key={day} className="text-center font-mono text-sm p-2">
            {day}
          </div>
        ))}

        {/* Wypełnij puste dni przed pierwszym dniem miesiąca */}
        {Array.from({ length: days[0].date.getDay() === 0 ? 6 : days[0].date.getDay() - 1 }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {days.map(({ date, counts }) => (
          <div
            key={date.toISOString()}
            className={`p-2 text-center rounded ${counts.pending || counts.sent || counts.rejected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
              }`}
            title={counts.pending + counts.sent + counts.rejected ?
              `Utworzone: ${counts.pending + counts.sent + counts.rejected}, Oczekuje: ${counts.pending}, Wysłane: ${counts.sent}, Odrzucone: ${counts.rejected}` :
              'Brak aplikacji'}
          >
            <div className="font-mono text-xs">{date.getDate()}</div>
            <div className="font-mono">
              {counts.pending ? (<b className="text-blue-300"> {counts.pending} </b>) : ''}
              {counts.sent ? (<b className="text-green-400"> {counts.sent} </b>) : ''}
              {counts.rejected ? (<b className="text-red-300"> {counts.rejected} </b>) : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;