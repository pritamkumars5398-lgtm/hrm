import { useEffect } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Clock, UserCheck, UserX, Users } from 'lucide-react'
import Card from '@/shared/components/Card'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useAttendanceStore } from './store/attendanceStore'
import AttendanceStatusBadge from './components/AttendanceStatusBadge'
import MonthCalendar from './components/MonthCalendar'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-muted" aria-hidden="true" />
        <p className="text-[12px] text-muted">{label}</p>
      </div>
      <p className="tnum font-display mt-2 text-[26px] leading-none font-semibold">{value}</p>
      {hint && <p className="tnum mt-2 text-[12px] text-muted">{hint}</p>}
    </Card>
  )
}

function StatSkeleton() {
  return (
    <Card className="p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-wash" />
      <div className="mt-3 h-7 w-14 animate-pulse rounded bg-wash" />
      <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-wash" />
    </Card>
  )
}

export default function AttendancePage() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, year, month, selectedDate, load, goToMonth, selectDate } =
    useAttendanceStore()

  const viewer = { role: user.role, name: user.name }

  useEffect(() => {
    void load(viewer)
    // The viewer is stable for the session; re-running on identity would refetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user.role, user.name])

  const isLoading = status === 'loading'
  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Attendance
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            {data?.scope === 'team' ? (
              <>
                Your team —{' '}
                <span className="tnum font-medium text-ink">{data.headcount}</span>{' '}
                {data.headcount === 1 ? 'person' : 'people'} reporting to you.
              </>
            ) : (
              'Daily records, work hours and monthly trends.'
            )}
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => void goToMonth(viewer, -1)}
            aria-label="Previous month"
            className="inline-flex size-9 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="tnum min-w-36 text-center text-[13.5px] font-medium">
            {MONTHS[month]} {year}
          </span>

          <button
            type="button"
            onClick={() => void goToMonth(viewer, 1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="inline-flex size-9 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void load(viewer, { force: true })}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {status !== 'error' && (
        <>
          {/* Summary cards — for the selected day */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || !data ? (
              [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={UserCheck}
                  label="Present"
                  value={String(data.summary.presentToday)}
                  hint={`of ${data.headcount} ${data.scope === 'team' ? 'in your team' : 'employees'}`}
                />
                <StatCard
                  icon={Clock}
                  label="Late"
                  value={String(data.summary.lateToday)}
                  hint="arrived after 09:30"
                />
                <StatCard
                  icon={UserX}
                  label="Absent"
                  value={String(data.summary.absentToday)}
                  hint="no record for the day"
                />
                <StatCard
                  icon={Users}
                  label="Avg. hours"
                  value={data.summary.avgHours.toFixed(1)}
                  hint="across those who worked"
                />
              </>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            {/* Calendar */}
            <Card className="p-5 lg:col-span-3">
              <h2 className="text-[13px] font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <p className="mt-1 text-[12.5px] text-muted">
                Pick a day to see who was in. Shading shows how full the day was.
              </p>

              <div className="mt-4">
                {isLoading || !data ? (
                  <div className="grid grid-cols-7 gap-1.5">
                    {Array.from({ length: 35 }, (_, i) => (
                      <div key={i} className="aspect-square animate-pulse rounded-[6px] bg-wash" />
                    ))}
                  </div>
                ) : (
                  <MonthCalendar
                    year={year}
                    month={month}
                    days={data.days}
                    selectedDate={selectedDate ?? data.todayDate}
                    onSelect={(date) => void selectDate(viewer, date)}
                  />
                )}
              </div>
            </Card>

            {/* Day detail */}
            <Card flush className="lg:col-span-2">
              <div className="border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold">
                  {data ? formatDay(data.todayDate) : 'Daily records'}
                </h2>
                {data && (
                  <p className="tnum mt-0.5 text-[12px] text-muted">
                    {data.today.length} {data.today.length === 1 ? 'record' : 'records'}
                  </p>
                )}
              </div>

              {isLoading || !data ? (
                <ul>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
                    >
                      <div className="size-7 shrink-0 animate-pulse rounded-full bg-wash" />
                      <div className="flex-1">
                        <div className="h-3.5 w-28 animate-pulse rounded bg-wash" />
                        <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-wash" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : data.today.length === 0 ? (
                <div className="px-4 py-14 text-center">
                  <p className="text-[14px] font-medium">Nothing recorded</p>
                  <p className="mx-auto mt-1 max-w-[15rem] text-[13px] leading-relaxed text-muted">
                    That day is a weekend, or nobody had started yet.
                  </p>
                </div>
              ) : (
                <ul className="max-h-[26rem] overflow-y-auto">
                  {data.today.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
                    >
                      <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-wash text-[10px] font-semibold text-muted">
                        {record.avatarInitials}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{record.employeeName}</p>
                        <p className="tnum mt-0.5 text-[11.5px] text-muted">
                          {record.clockIn
                            ? `${record.clockIn} – ${record.clockOut} · ${record.hours}h`
                            : '—'}
                        </p>
                      </div>

                      <AttendanceStatusBadge status={record.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
