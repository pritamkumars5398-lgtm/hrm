import { useEffect } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Clock, UserCheck, UserX, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Card from '@/shared/components/Card'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import { useAttendanceStore } from './store/attendanceStore'
import AttendanceStatusBadge from './components/AttendanceStatusBadge'
import MonthCalendar from './components/MonthCalendar'
import CheckInOutCard from './components/CheckInOutCard'

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
  type,
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
  type: 'present' | 'late' | 'absent' | 'hours'
}) {
  const config = {
    present: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/50',
      bgGradient: 'bg-gradient-to-br from-emerald-500/[0.04] to-transparent',
      glow: 'hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)]',
      borderColor: 'border-emerald-500/10 hover:border-emerald-500/20',
    },
    late: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100/50',
      bgGradient: 'bg-gradient-to-br from-amber-500/[0.04] to-transparent',
      glow: 'hover:shadow-[0_4px_20px_rgba(245,158,11,0.08)]',
      borderColor: 'border-amber-500/10 hover:border-amber-500/20',
    },
    absent: {
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100/50',
      bgGradient: 'bg-gradient-to-br from-rose-500/[0.04] to-transparent',
      glow: 'hover:shadow-[0_4px_20px_rgba(244,63,94,0.08)]',
      borderColor: 'border-rose-500/10 hover:border-rose-500/20',
    },
    hours: {
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50',
      bgGradient: 'bg-gradient-to-br from-indigo-500/[0.04] to-transparent',
      glow: 'hover:shadow-[0_4px_20px_rgba(99,102,241,0.08)]',
      borderColor: 'border-indigo-500/10 hover:border-indigo-500/20',
    },
  }[type]

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={`p-5 h-full flex gap-4 items-start transition-all duration-300 border ${config.bgGradient} ${config.borderColor} ${config.glow}`}>
        <div className={`p-2.5 rounded-ctl shrink-0 flex items-center justify-center ${config.iconBg}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider font-extrabold text-muted/85 leading-none">{label}</p>
          <p className="tnum font-display mt-2.5 text-[28px] leading-none font-bold text-ink">{value}</p>
          {hint && <p className="tnum mt-2 text-[12px] text-muted font-semibold">{hint}</p>}
        </div>
      </Card>
    </motion.div>
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
  const {
    status,
    data,
    error,
    year,
    month,
    selectedDate,
    checkingInOut,
    load,
    goToMonth,
    selectDate,
    checkIn,
    checkOut,
  } = useAttendanceStore()

  const viewer = { permissions: user.permissions, name: user.name }
  const canManage = hasPermission(user.permissions, 'attendance.manage')

  useEffect(() => {
    void load(viewer)
    // The viewer is stable for the session; re-running on identity would refetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user.permissions, user.name])

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
            {data?.scope === 'me'
              ? 'Check in, check out, and see your own history.'
              : 'Daily records, work hours and monthly trends.'}
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-2 bg-surface border border-hairline/80 p-1.5 rounded-ctl shadow-sm transition-all duration-300">
          <button
            type="button"
            onClick={() => void goToMonth(viewer, -1)}
            aria-label="Previous month"
            className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline bg-surface text-muted transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer active:scale-95"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="tnum min-w-32 text-center text-[13px] font-bold text-emerald-800 bg-emerald-50/50 border border-emerald-100/30 px-3 py-1 rounded-full">
            {MONTHS[month]} {year}
          </span>

          <button
            type="button"
            onClick={() => void goToMonth(viewer, 1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline bg-surface text-muted transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-40 cursor-pointer active:scale-95"
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
          {data?.scope === 'me' && (
            <CheckInOutCard
              status={data.myTodayStatus}
              loading={checkingInOut}
              name={user.name}
              onCheckIn={() => checkIn(viewer)}
              onCheckOut={() => checkOut(viewer)}
            />
          )}

          {/* Summary cards — today's snapshot for the company, this month's tally for you */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || !data ? (
              [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
            ) : data.scope === 'me' ? (
              <>
                <StatCard
                  icon={UserCheck}
                  label="Present"
                  value={String(data.days.reduce((sum, d) => sum + d.present, 0))}
                  hint="days this month"
                  type="present"
                />
                <StatCard
                  icon={Clock}
                  label="Late"
                  value={String(data.days.reduce((sum, d) => sum + d.late, 0))}
                  hint="days this month"
                  type="late"
                />
                <StatCard
                  icon={Users}
                  label="Half day"
                  value={String(data.days.reduce((sum, d) => sum + d.halfDay, 0))}
                  hint="days this month"
                  type="hours"
                />
                <StatCard
                  icon={UserX}
                  label="Absent"
                  value={String(data.days.reduce((sum, d) => sum + d.absent, 0))}
                  hint="days this month"
                  type="absent"
                />
              </>
            ) : (
              <>
                <StatCard
                  icon={UserCheck}
                  label="Present"
                  value={String(data.summary.presentToday)}
                  hint={`of ${data.headcount} employees`}
                  type="present"
                />
                <StatCard
                  icon={Clock}
                  label="Late"
                  value={String(data.summary.lateToday)}
                  hint="arrived after 09:30"
                  type="late"
                />
                <StatCard
                  icon={UserX}
                  label="Absent"
                  value={String(data.summary.absentToday)}
                  hint="no record for the day"
                  type="absent"
                />
                <StatCard
                  icon={Users}
                  label="Avg. hours"
                  value={data.summary.avgHours.toFixed(1)}
                  hint="across those who worked"
                  type="hours"
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
                  {canManage
                    ? 'Pick a day to see who was in. Shading shows how full the day was.'
                    : 'Pick a day to see your record. Shading shows the days you were in.'}
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
                              ? record.clockOut
                                ? `${record.clockIn} – ${record.clockOut} · ${record.hours}h`
                                : `${record.clockIn} – in progress`
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
