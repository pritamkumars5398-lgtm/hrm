import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  RotateCw,
  Target,
  UserPlus,
  Activity,
  Star,
  Info,
} from 'lucide-react'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import { timeAgo } from '@/shared/utils/timeAgo'
import { useAttendanceStore } from '@/features/attendance/store/attendanceStore'
import CheckInOutCard from '@/features/attendance/components/CheckInOutCard'
import { useDashboardStore } from './store/dashboardStore'

const LEAVE_TYPE_COLOR: Record<string, string> = {
  ANNUAL: '#10b981',
  SICK: '#f59e0b',
  PERSONAL: '#8b5cf6',
  UNPAID: '#facc15',
}
const LEAVE_TYPE_LABEL: Record<string, string> = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  PERSONAL: 'Personal',
  UNPAID: 'Unpaid',
}

const formatLeaveDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

const ACTIVITY_ICON = {
  leave: CalendarDays,
  payroll: Banknote,
  employee: UserPlus,
  performance: Target,
} as const

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}


function StatSkeleton() {
  return (
    <div className="rounded-card border border-hairline bg-surface p-3 h-[104px] flex flex-col gap-2 animate-pulse">
      <div className="size-8 rounded-full bg-wash shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-2.5 w-14 rounded bg-wash" />
        <div className="mt-2 h-5 w-12 rounded bg-wash" />
      </div>
    </div>
  )
}

const getStatStyle = (id: string, label: string) => {
  const normId = id.toLowerCase()
  const normLabel = label.toLowerCase()

  if (normId.includes('headcount') || normLabel.includes('employee') || normLabel.includes('total')) {
    return {
      Icon: UserPlus,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50/80 border border-teal-100/50',
      deltaColor: 'text-emerald-700 bg-emerald-50/60 border border-emerald-100/30',
    }
  }
  if (normId.includes('present') || normLabel.includes('present')) {
    return {
      Icon: Activity,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50/80 border border-emerald-100/50',
      deltaColor: 'text-muted-deep bg-wash/60 border border-hairline/60',
    }
  }
  if (normId.includes('leave') || normLabel.includes('leave')) {
    return {
      Icon: CalendarDays,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50/80 border border-orange-100/50',
      deltaColor: 'text-orange-700 bg-orange-50/60 border border-orange-100/30',
    }
  }
  if (normId.includes('payroll') || normLabel.includes('payroll')) {
    return {
      Icon: Banknote,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50/80 border border-indigo-100/50',
      deltaColor: 'text-indigo-700 bg-indigo-50/60 border border-indigo-100/30',
    }
  }

  return {
    Icon: Star,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50/80 border border-purple-100/50',
    deltaColor: 'text-purple-700 bg-purple-50/60 border border-purple-100/30',
  }
}

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load } = useDashboardStore()
  const viewer = { permissions: user.permissions, name: user.name }
  const {
    data: attendanceData,
    checkingInOut,
    load: loadAttendance,
    checkIn,
    checkOut,
  } = useAttendanceStore()

  useEffect(() => {
    void load(user.permissions)
    void loadAttendance(viewer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, user.permissions])

  const firstName = user.name.split(' ')[0]
  const greeting = greetingFor(new Date().getHours())
  const statsToShow = data?.stats ?? []
  const canSeeAttendanceOverview = hasPermission(user.permissions, 'attendance.manage')
  const canSeeLeaveOverview = hasPermission(user.permissions, 'leave.approve')

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="rounded-card border border-hairline bg-surface p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="flex-1 space-y-4 text-left">
          <div>
            <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Welcome Back</p>
            <h1 className="font-display text-[30px] leading-tight font-bold text-ink">
              {greeting}.
              <span className="block text-pine font-extrabold mt-1">{firstName} 👋</span>
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted max-w-xl">
              Welcome back to Keystone. Manage your team, track daily attendance records, process payroll, and view company analytics from your centralized workspace.
            </p>
          </div>
          {status === 'ready' && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-9.5"
                onClick={() => void load(user.permissions, { force: true })}
              >
                <RotateCw size={14} />
                Refresh
              </Button>
            </div>
          )}
        </div>

        {/* Dashboard Illustration */}
        <div className="hidden md:block w-[420px] h-52 lg:w-[460px] lg:h-56 shrink-0 relative">
          <img
            src="/admin.png"
            alt="Keystone Workspace Overview"
            className="w-full h-full object-contain select-none"
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-start gap-3 rounded-card border border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void load(user.permissions, { force: true })}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {status !== 'error' && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {status === 'ready' && data
              ? statsToShow.map((stat) => {
                const style = getStatStyle(stat.id, stat.label)
                const StatIcon = style.Icon
                return (
                  <div key={stat.id} className="group relative rounded-card border border-hairline bg-surface p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-hairline-strong overflow-hidden h-[104px]">
                    <div className="flex items-start justify-between w-full">
                      <div className={`p-2 rounded-full shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}>
                        <StatIcon className={`size-4 ${style.iconColor}`} />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 mt-2">
                      <p className="text-[10px] text-muted font-bold uppercase tracking-wider leading-none truncate">{stat.label}</p>
                      <div className="flex items-baseline justify-between gap-1 mt-1.5">
                        <p className="tnum font-display text-[19px] leading-none font-bold text-ink truncate">
                          {stat.value}
                        </p>
                        {stat.delta && (
                          <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border leading-none ${style.deltaColor}`}>
                            {stat.delta}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
              : [0, 1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)}
          </div>

          {/* Overview Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Attendance Chart — real check-ins, last 7 days */}
            {canSeeAttendanceOverview && (
              <div className="lg:col-span-3 rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between relative">
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[14px] font-semibold text-ink">Attendance Overview</h2>
                    <Info size={13} className="text-muted cursor-pointer hover:text-ink transition-colors" />
                  </div>
                  <span className="rounded-ctl border border-hairline-strong bg-surface px-2.5 py-1 text-[11.5px] font-medium text-ink">
                    Last 7 days
                  </span>
                </div>

                {data && data.weeklyAttendance.length > 0 ? (
                  <>
                    <div className="mt-5 flex h-40 gap-2.5">
                      {data.weeklyAttendance.map((day, i) => {
                        const maxExpected = Math.max(1, ...data.weeklyAttendance.map((d) => d.expected))
                        const heightPct = (day.present / maxExpected) * 100
                        return (
                          <div key={`${day.label}-${i}`} className="flex flex-1 flex-col items-center gap-2">
                            <span className="tnum text-[11px] font-bold text-ink">{day.present}</span>
                            <div className="w-full flex-1 relative overflow-hidden bg-wash rounded-t-[3px]">
                              <div
                                className="absolute bottom-0 w-full rounded-t-[3px] bg-emerald-500 transition-all"
                                style={{ height: `${heightPct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted px-1 mt-2.5 font-medium">
                      {data.weeklyAttendance.map((day, i) => (
                        <span key={`${day.label}-lbl-${i}`}>{day.label}</span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-14 text-center">
                    <p className="text-[13px] font-medium text-ink">No attendance recorded yet</p>
                    <p className="mt-1 text-[12px] text-muted">Check-ins will build this chart day by day.</p>
                  </div>
                )}
              </div>
            )}

            {/* Leave Overview Chart */}
            {canSeeLeaveOverview && data && (() => {
              const totalDays = data.leaveBreakdown.reduce((sum, s) => sum + s.days, 0)
              const circumference = 2 * Math.PI * 36
              let cumulative = 0

              return (
                <div className="lg:col-span-2 rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-[14px] font-semibold text-ink">Leave Overview</h2>
                      <Info size={13} className="text-muted cursor-pointer hover:text-ink transition-colors" />
                    </div>
                  </div>

                  {totalDays === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-[13px] font-medium text-ink">No leave taken yet this year</p>
                      <p className="mt-1 text-[12px] text-muted">Approved leave will show up here.</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 my-4 flex-1">
                      {/* SVG Donut Chart — real per-type breakdown */}
                      <div className="relative size-24 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="size-full">
                          {data.leaveBreakdown.map((slice) => {
                            const length = (slice.days / totalDays) * circumference
                            const offset = -cumulative
                            cumulative += length
                            return (
                              <circle
                                key={slice.type}
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke={LEAVE_TYPE_COLOR[slice.type]}
                                strokeWidth="11"
                                strokeDasharray={`${length} ${circumference}`}
                                strokeDashoffset={offset}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                              />
                            )
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-[18px] font-bold leading-none text-ink">{totalDays}</span>
                          <span className="text-[9.5px] text-muted mt-0.5 font-medium">Total</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-1 flex flex-col gap-1.5 text-[11.5px] font-medium text-ink">
                        {data.leaveBreakdown.map((slice) => (
                          <div key={slice.type} className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="size-2 rounded-full" style={{ backgroundColor: LEAVE_TYPE_COLOR[slice.type] }} />
                              <span className="text-muted">{LEAVE_TYPE_LABEL[slice.type]}</span>
                            </span>
                            <span className="font-semibold text-ink">
                              {slice.days} ({Math.round((slice.days / totalDays) * 100)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-hairline pt-3 mt-1">
                    <span className="text-[12px] font-semibold text-orange-600">
                      {data.pendingLeaveCount > 0 ? `${data.pendingLeaveCount} pending approval` : 'All caught up'}
                    </span>
                    <Link to="/dashboard/leave" className="text-[12px] font-semibold text-pine hover:underline">View all</Link>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Activity / Upcoming Leave / Check In Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h2 className="text-[14px] font-semibold text-ink">Recent Activity</h2>
                </div>

                {status === 'ready' && data ? (
                  data.activity.length > 0 ? (
                    <ul className="mt-2.5 divide-y divide-hairline">
                      {data.activity.map((item) => {
                        const Icon = ACTIVITY_ICON[item.kind]
                        const timeStr = timeAgo(item.occurredAt)

                        return (
                          <li key={item.id} className="flex gap-3 py-3 items-start last:pb-0">
                            <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-pine-tint">
                              <Icon size={13} className="text-pine" aria-hidden="true" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] leading-snug font-semibold text-ink">{item.title}</p>
                              <p className="tnum mt-0.5 text-[11.5px] text-muted">{item.meta}</p>
                            </div>
                            <span className="shrink-0 text-[10.5px] font-bold text-muted bg-wash/80 px-1.5 py-0.5 rounded-ctl">
                              {timeStr}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-[13px] font-medium text-ink">Nothing to catch up on</p>
                      <p className="mt-1 text-[12px] text-muted">
                        Activity from your team will show up here.
                      </p>
                    </div>
                  )
                ) : (
                  <ul className="mt-2.5 divide-y divide-hairline">
                    {[0, 1, 2, 3].map((i) => (
                      <li key={i} className="flex gap-3 py-3 last:pb-0 animate-pulse">
                        <div className="size-7.5 shrink-0 rounded-full bg-wash" />
                        <div className="flex-1">
                          <div className="h-3 w-3/4 rounded bg-wash" />
                          <div className="mt-2 h-2.5 w-1/2 rounded bg-wash" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Upcoming Leave — real approved leave, not fake calendar events */}
            {canSeeLeaveOverview && (
              <div className="rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-hairline pb-3">
                    <h2 className="text-[14px] font-semibold text-ink">Upcoming Leave</h2>
                  </div>

                  {data && data.upcomingLeave.length > 0 ? (
                    <ul className="mt-2.5 divide-y divide-hairline">
                      {data.upcomingLeave.map((item) => (
                        <li key={item.id} className="flex gap-3 py-3 items-center last:pb-0">
                          <span
                            className="flex size-7.5 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: `${LEAVE_TYPE_COLOR[item.type]}1a`, color: LEAVE_TYPE_COLOR[item.type] }}
                          >
                            <CalendarDays size={13} aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[13px] leading-snug font-semibold text-ink">
                              {item.employeeName} · {LEAVE_TYPE_LABEL[item.type]}
                            </p>
                            <p className="mt-0.5 text-[11.5px] text-muted font-medium">
                              {formatLeaveDate(item.startDate)} – {formatLeaveDate(item.endDate)} · {item.days} day{item.days === 1 ? '' : 's'}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-10 text-center">
                      <p className="text-[13px] font-medium text-ink">No upcoming leave</p>
                      <p className="mt-1 text-[12px] text-muted">Approved leave coming up will show up here.</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-hairline pt-3 mt-3">
                  <Link to="/dashboard/leave" className="text-[12px] font-semibold text-pine hover:underline">View all leave</Link>
                </div>
              </div>
            )}

            {/* Check In / Out — a real shortcut, same store and endpoint as /attendance.
                Hidden entirely (not an explanatory dead-end) for anyone with no Employee
                record — e.g. an Owner isn't necessarily an employee of their own company. */}
            {attendanceData && attendanceData.myTodayStatus !== null && (
              <CheckInOutCard
                status={attendanceData.myTodayStatus}
                loading={checkingInOut}
                name={user.name}
                onCheckIn={() => checkIn(viewer)}
                onCheckOut={() => checkOut(viewer)}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
