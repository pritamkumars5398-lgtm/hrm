import type { DaySummary } from '@/services/attendanceService'

type MonthCalendarProps = {
  year: number
  month: number
  days: DaySummary[]
  selectedDate: string
  onSelect: (date: string) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Monday-first index (JS getDay() is Sunday-first). */
const mondayIndex = (date: Date) => (date.getDay() + 6) % 7

/** Attendance rate → accent opacity. A heatmap, using one hue rather than a rainbow. */
function intensity(rate: number): number {
  if (rate >= 0.97) return 1
  if (rate >= 0.93) return 0.8
  if (rate >= 0.88) return 0.6
  if (rate >= 0.8) return 0.42
  return 0.28
}

export default function MonthCalendar({
  year,
  month,
  days,
  selectedDate,
  onSelect,
}: MonthCalendarProps) {
  const byDate = new Map(days.map((d) => [d.date, d]))
  const first = new Date(year, month, 1)
  const leadingBlanks = mondayIndex(first)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((day) => (
          <span
            key={day}
            className="pb-1 text-center text-[10px] font-semibold tracking-[0.06em] text-muted uppercase"
          >
            {day}
          </span>
        ))}

        {Array.from({ length: leadingBlanks }, (_, i) => (
          <span key={`blank-${i}`} aria-hidden="true" />
        ))}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const dayNumber = i + 1
          const date = new Date(year, month, dayNumber)
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`

          const summary = byDate.get(iso)
          const selected = iso === selectedDate
          const weekend = summary?.isWeekend ?? [0, 6].includes(date.getDay())
          const hasData = Boolean(summary) && !weekend && summary!.rate !== null

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              aria-label={
                hasData
                  ? `${dayNumber} — ${Math.round(summary!.rate! * 100)}% attendance`
                  : `${dayNumber} — no records`
              }
              aria-pressed={selected}
              className={`relative flex aspect-square flex-col items-center justify-center rounded-[6px] border text-[12.5px] transition-all cursor-pointer ${
                selected
                  ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-800 shadow-sm scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500/10'
                  : weekend
                    ? 'border-hairline bg-wash/80 text-muted/50'
                    : 'border-hairline bg-surface hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
              }`}
            >
              <span className="tnum">{dayNumber}</span>

              {hasData && !selected && (
                <span
                  className="mt-1 h-1 w-4 rounded-full bg-emerald-500"
                  style={{ opacity: intensity(summary!.rate!) }}
                  aria-hidden="true"
                />
              )}
              {hasData && selected && (
                <span className="tnum mt-0.5 text-[9.5px] font-bold">
                  {Math.round(summary!.rate! * 100)}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-3 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          Attendance
          {[0.28, 0.6, 1].map((o) => (
            <span
              key={o}
              className="h-1.5 w-4 rounded-full bg-emerald-500"
              style={{ opacity: o }}
              aria-hidden="true"
            />
          ))}
          <span className="tnum">low → high</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] border border-hairline bg-wash" />
          Weekend
        </span>
      </div>
    </div>
  )
}
