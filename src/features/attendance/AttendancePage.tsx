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

const initialsColor = (initials: string) => {
  const charCodeSum = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)
  const colors = [
    'bg-emerald-50 text-emerald-700 border-emerald-100/80',
    'bg-blue-50 text-blue-700 border-blue-100/80',
    'bg-indigo-50 text-indigo-700 border-indigo-100/80',
    'bg-purple-50 text-purple-700 border-purple-100/80',
    'bg-pink-50 text-pink-700 border-pink-100/80',
    'bg-rose-50 text-rose-700 border-rose-100/80',
    'bg-amber-50 text-amber-700 border-amber-100/80',
    'bg-orange-50 text-orange-700 border-orange-100/80',
  ]
  return colors[charCodeSum % colors.length]
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  iconBg,
  iconColor,
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
  iconBg: string
  iconColor: string
}) {
  return (
    <Card className="p-4 flex gap-4 items-start">
      <div className={`p-2.5 rounded-full shrink-0 flex items-center justify-center ${iconBg}`}>
        <Icon className={`size-5 ${iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-muted font-medium leading-none">{label}</p>
        <p className="tnum font-display mt-2.5 text-[26px] leading-none font-bold text-ink">{value}</p>
        {hint && <p className="tnum mt-2 text-[11.5px] text-muted font-medium">{hint}</p>}
      </div>
    </Card>
  )
}

function StatSkeleton() {
  return (
    <Card className="p-4 flex gap-4 items-start animate-pulse">
      <div className="size-10 rounded-full bg-wash shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-3 w-20 rounded bg-wash" />
        <div className="mt-2 h-7 w-14 rounded bg-wash" />
        <div className="mt-2.5 h-3 w-24 rounded bg-wash" />
      </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Tracking</p>
          <h1 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
            Attendance
          </h1>
          <p className="mt-1 text-[13.5px] text-muted">
            {data?.scope === 'team' ? (
              <>
                Your team —{' '}
                <span className="tnum font-semibold text-ink">{data.headcount}</span>{' '}
                {data.headcount === 1 ? 'person' : 'people'} reporting to you.
              </>
            ) : (
              'Daily records, work hours and monthly trends.'
            )}
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-1.5 bg-surface border border-hairline p-1 rounded-ctl">
          <button
            type="button"
            onClick={() => void goToMonth(viewer, -1)}
            aria-label="Previous month"
            className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="tnum min-w-32 text-center text-[12.5px] font-bold text-ink">
            {MONTHS[month]} {year}
          </span>

          <button
            type="button"
            onClick={() => void goToMonth(viewer, 1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {status === 'error' && (
        <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || !data ? (
              [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={UserCheck}
                  label="Present"
                  value={String(data.summary.presentToday)}
                  hint={`of ${data.headcount} ${data.scope === 'team' ? 'in team' : 'employees'}`}
                  iconBg="bg-emerald-50 text-emerald-600"
                  iconColor="text-emerald-600"
                />
                <StatCard
                  icon={Clock}
                  label="Late"
                  value={String(data.summary.lateToday)}
                  hint="arrived after 09:30"
                  iconBg="bg-orange-50 text-orange-600"
                  iconColor="text-orange-600"
                />
                <StatCard
                  icon={UserX}
                  label="Absent"
                  value={String(data.summary.absentToday)}
                  hint="no record for the day"
                  iconBg="bg-rose-50 text-rose-600"
                  iconColor="text-rose-600"
                />
                <StatCard
                  icon={Users}
                  label="Avg. hours"
                  value={data.summary.avgHours.toFixed(1)}
                  hint="across those who worked"
                  iconBg="bg-indigo-50 text-indigo-600"
                  iconColor="text-indigo-600"
                />
              </>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            {/* Calendar */}
            <Card className="p-5 lg:col-span-3 flex flex-col justify-between">
              <div className="border-b border-hairline pb-3">
                <h2 className="text-[14px] font-semibold text-ink">
                  Calendar — {MONTHS[month]} {year}
                </h2>
                <p className="mt-1 text-[12.5px] text-muted">
                  Pick a day to see who was in. Shading shows how full the day was.
                </p>
              </div>

              <div className="mt-4 flex-1 flex flex-col justify-center">
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
            <Card flush className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
              <div className="border-b border-hairline px-4 py-3.5 bg-wash/30">
                <h2 className="text-[13.5px] font-semibold text-ink">
                  {data ? formatDay(selectedDate ?? data.todayDate) : 'Daily records'}
                </h2>
                {data && (
                  <p className="tnum mt-0.5 text-[11.5px] text-muted font-semibold">
                    {data.today.length} {data.today.length === 1 ? 'record' : 'records'}
                  </p>
                )}
              </div>

              <div className="flex-1 min-h-[26rem] flex flex-col justify-between">
                {isLoading || !data ? (
                  <ul className="divide-y divide-hairline">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 px-4 py-3.5"
                      >
                        <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
                        <div className="flex-1">
                          <div className="h-3.5 w-28 animate-pulse rounded bg-wash" />
                          <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-wash" />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : data.today.length === 0 ? (
                  <div className="px-4 py-20 text-center my-auto">
                    <p className="text-[14px] font-medium text-ink">Nothing recorded</p>
                    <p className="mx-auto mt-1 max-w-[15rem] text-[13px] leading-relaxed text-muted font-medium">
                      That day is a weekend, or nobody had started yet.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-[28rem] overflow-y-auto divide-y divide-hairline flex-1">
                    {data.today.map((record) => (
                      <li
                        key={record.id}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-wash/30 transition-colors"
                      >
                        <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-[10.5px] font-bold ${initialsColor(record.avatarInitials)}`}>
                          {record.avatarInitials}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-semibold text-ink leading-tight">{record.employeeName}</p>
                          <p className="tnum mt-1 text-[11.5px] text-muted font-medium">
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
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
