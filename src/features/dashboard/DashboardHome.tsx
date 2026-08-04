import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  RotateCw,
  Target,
  UserPlus,
  User,
  Activity,
  Star,
  Info,
} from 'lucide-react'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission, canAccess } from '@/shared/config/navigation'
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
      gradStart: 'rgba(20, 184, 166, 0.45)',
      gradEnd: 'rgba(20, 184, 166, 0)',
      strokeColor: 'text-teal-500',
      linePath: 'M0,14 C20,6 40,22 60,14 C80,6 90,14 100,10',
      fillPath: 'M0,14 C20,6 40,22 60,14 C80,6 90,14 100,10 L100,24 L0,24 Z',
    }
  }
  if (normId.includes('present') || normLabel.includes('present')) {
    return {
      Icon: Activity,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50/80 border border-emerald-100/50',
      deltaColor: 'text-muted-deep bg-wash/60 border border-hairline/60',
      gradStart: 'rgba(249, 115, 22, 0.45)',
      gradEnd: 'rgba(249, 115, 22, 0)',
      strokeColor: 'text-orange-500',
      linePath: 'M0,18 C25,20 40,4 50,4 C60,4 75,20 100,18',
      fillPath: 'M0,18 C25,20 40,4 50,4 C60,4 75,20 100,18 L100,24 L0,24 Z',
    }
  }
  if (normId.includes('leave') || normLabel.includes('leave')) {
    return {
      Icon: CalendarDays,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50/80 border border-orange-100/50',
      deltaColor: 'text-orange-700 bg-orange-50/60 border border-orange-100/30',
      gradStart: 'rgba(168, 85, 247, 0.45)',
      gradEnd: 'rgba(168, 85, 247, 0)',
      strokeColor: 'text-purple-500',
      linePath: 'M0,8 C30,24 70,24 100,8',
      fillPath: 'M0,8 C30,24 70,24 100,8 L100,24 L0,24 Z',
    }
  }
  if (normId.includes('payroll') || normLabel.includes('payroll')) {
    return {
      Icon: Banknote,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50/80 border border-indigo-100/50',
      deltaColor: 'text-indigo-700 bg-indigo-50/60 border border-indigo-100/30',
      gradStart: 'rgba(16, 185, 129, 0.45)',
      gradEnd: 'rgba(16, 185, 129, 0)',
      strokeColor: 'text-emerald-500',
      linePath: 'M0,16 C30,22 50,6 100,10',
      fillPath: 'M0,16 C30,22 50,6 100,10 L100,24 L0,24 Z',
    }
  }

  return {
    Icon: Star,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50/80 border border-purple-100/50',
    deltaColor: 'text-purple-700 bg-purple-50/60 border border-purple-100/30',
    gradStart: 'rgba(99, 102, 241, 0.45)',
    gradEnd: 'rgba(99, 102, 241, 0)',
    strokeColor: 'text-indigo-500',
    linePath: 'M0,12 C30,6 70,18 100,12',
    fillPath: 'M0,12 C30,6 70,18 100,12 L100,24 L0,24 Z',
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

  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null)

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

  const getDaysUntilLabel = (startDateStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(`${startDateStr}T00:00:00`)
    startDate.setHours(0, 0, 0, 0)

    const diffTime = startDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 0) return 'Passed'
    return `In ${diffDays} day${diffDays === 1 ? '' : 's'}`
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-card border border-hairline bg-gradient-to-br from-pine-tint/40 via-surface to-surface p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden"
      >
        {/* Abstract background blobs for premium feel */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-pine-tint/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 space-y-4 text-left z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
              className="text-[12px] font-bold text-pine/80 uppercase tracking-widest mb-1.5"
            >
              Welcome Back
            </motion.p>
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="font-display text-[32px] leading-tight font-extrabold text-ink"
            >
              {greeting},
              <span className="block text-pine font-black mt-1.5">
                {firstName}{' '}
                <motion.span
                  animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1 }}
                  className="inline-block origin-[70%_70%]"
                >
                  👋
                </motion.span>
              </span>
            </motion.h1>
            <motion.p
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              className="mt-3 text-[13.5px] leading-relaxed text-muted max-w-xl"
            >
              Welcome back to Keystone. Manage your team, track daily attendance records, process payroll, and view company analytics from your centralized workspace.
            </motion.p>
          </motion.div>
          {status === 'ready' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex gap-2.5 pt-1"
            >
              <Button
                variant="secondary"
                size="sm"
                className="h-9.5 hover:bg-wash transition-colors"
                onClick={() => void load(user.permissions, { force: true })}
              >
                <RotateCw size={14} className="animate-[spin_4s_linear_infinite]" />
                Refresh
              </Button>
              {canAccess(user.permissions, 'profile') && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-9.5 hover:bg-wash transition-colors"
                  to="/dashboard/profile"
                >
                  <User size={14} />
                  My Profile
                </Button>
              )}
            </motion.div>
          )}
        </div>

        {/* Dashboard Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:block w-[380px] h-48 lg:w-[420px] lg:h-52 shrink-0 relative z-10"
        >
          <img
            src="/admin.png"
            alt="Keystone Workspace Overview"
            className="w-full h-full object-contain select-none filter drop-shadow-[0_10px_15px_rgba(31,77,63,0.06)]"
          />
        </motion.div>
      </motion.div>

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
              ? statsToShow.map((stat, index) => {
                const style = getStatStyle(stat.id, stat.label)
                const StatIcon = style.Icon
                const normId = stat.id.toLowerCase()

                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className={`group relative rounded-card border border-hairline bg-surface p-5 flex flex-col justify-between transition-all duration-300 overflow-hidden h-[152px] cursor-pointer ${normId.includes('employee') ? 'hover:border-teal-300 hover:shadow-[0_8px_30px_rgba(20,184,166,0.08)]' :
                        normId.includes('present') ? 'hover:border-emerald-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.08)]' :
                          normId.includes('leave') ? 'hover:border-orange-300 hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)]' :
                            normId.includes('payroll') ? 'hover:border-indigo-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.08)]' :
                              'hover:border-purple-300 hover:shadow-[0_8px_30px_rgba(168,85,247,0.08)]'
                      }`}
                  >
                    {/* Soft background glow */}
                    <div className={`absolute -right-6 -bottom-6 size-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none ${normId.includes('employee') ? 'bg-teal-400' :
                        normId.includes('present') ? 'bg-emerald-400' :
                          normId.includes('leave') ? 'bg-orange-400' :
                            normId.includes('payroll') ? 'bg-indigo-400' :
                              'bg-purple-400'
                      }`} />

                    {/* Wavy Chart Design */}
                    <div className="absolute inset-x-0 bottom-0 h-[80px] overflow-hidden pointer-events-none rounded-b-[11px]">
                      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full h-full opacity-70 group-hover:opacity-100 transition-all duration-500">
                        <defs>
                          <linearGradient id={`grad-${stat.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={style.gradStart} />
                            <stop offset="100%" stopColor={style.gradEnd} />
                          </linearGradient>
                        </defs>
                        <path d={style.fillPath} fill={`url(#grad-${stat.id})`} />
                        <path d={style.linePath} fill="none" stroke="currentColor" strokeWidth="2" className={style.strokeColor} vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>

                    <div className="flex items-start justify-between z-10 w-full mt-1">
                      <div className={`p-3 rounded-full shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${style.iconBg}`}>
                        <StatIcon className={`size-5 transition-transform duration-300 ${style.iconColor}`} />
                      </div>
                      <p className="tnum font-display text-[38px] leading-none font-bold text-ink tracking-tight text-right pt-0.5">
                        {stat.value}
                      </p>
                    </div>

                    <div className="flex flex-col mt-3.5 z-10 flex-1">
                      <p className="text-[12px] text-ink/75 font-bold uppercase tracking-wider leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                )
              })
              : [0, 1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)}
          </div>

          {/* Overview Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Attendance Chart — real check-ins, last 7 days */}
            {canSeeAttendanceOverview && (
              <div className="lg:col-span-3 rounded-card border border-hairline bg-surface p-5 flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between border-b border-hairline pb-3.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-[14px] font-semibold text-ink">Attendance Overview</h2>
                    <div className="relative group/info">
                      <Info size={13} className="text-muted cursor-pointer hover:text-ink transition-colors" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-ink text-white text-[10px] rounded shadow-lg opacity-0 pointer-events-none group-hover/info:opacity-100 transition-opacity duration-200 z-25 text-center leading-normal">
                        Shows the number of employees checked in each day over the last 7 days.
                      </div>
                    </div>
                  </div>
                  <span className="rounded-ctl border border-hairline-strong bg-wash/50 px-2.5 py-1 text-[11px] font-bold text-ink">
                    Last 7 days
                  </span>
                </div>

                {data && data.weeklyAttendance.length > 0 ? (
                  <>
                    <div className="mt-6 flex h-[210px] gap-4 relative">
                      {/* Grid background lines */}
                      <div className="absolute inset-x-0 bottom-[34px] top-[18px] flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3].map((_, idx) => (
                          <div key={idx} className="w-full border-b border-hairline border-dashed relative opacity-70" />
                        ))}
                      </div>

                      {data.weeklyAttendance.map((day, i) => {
                        const maxExpected = Math.max(1, ...data.weeklyAttendance.map((d) => d.expected))
                        const heightPct = (day.present / maxExpected) * 100
                        const isHovered = hoveredBarIndex === i
                        const attendancePct = Math.round((day.present / Math.max(1, day.expected)) * 100)

                        return (
                          <div
                            key={`${day.label}-${i}`}
                            className="flex flex-1 flex-col items-center gap-3 relative z-10 group/bar"
                            onMouseEnter={() => setHoveredBarIndex(i)}
                            onMouseLeave={() => setHoveredBarIndex(null)}
                          >
                            {/* Hover Tooltip */}
                            <AnimatePresence>
                              {isHovered && (
                                <motion.div
                                  initial={{ opacity: 0, y: 6, scale: 0.9 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 6, scale: 0.9 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute -top-14 z-20 px-3 py-2 bg-ink/95 backdrop-blur-sm text-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-[11px] leading-tight flex flex-col items-center pointer-events-none whitespace-nowrap"
                                >
                                  <span className="font-bold text-teal-300 text-[12px]">{day.present} Present</span>
                                  <span className="opacity-80 text-[10px] mt-1">{day.expected} Expected ({attendancePct}%)</span>
                                  <div className="size-2 bg-ink/95 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Bar Value label */}
                            <span className={`tnum text-[13px] font-bold transition-all duration-300 ${isHovered ? 'text-teal-600 scale-110' : 'text-ink/80'}`}>
                              {day.present}
                            </span>

                            {/* Bar Container */}
                            <div className={`w-full flex-1 relative rounded-[8px] overflow-hidden cursor-pointer transition-all duration-300 border border-hairline/50 ${isHovered ? 'bg-wash/80 shadow-inner' : 'bg-wash/30'}`}>
                              <motion.div
                                className={`absolute bottom-0 w-full rounded-[8px] bg-gradient-to-t from-emerald-500 to-teal-400 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-90'} ${heightPct > 0 ? 'shadow-[0_0_20px_rgba(20,184,166,0.3)]' : ''}`}
                                initial={{ height: 0 }}
                                animate={{ height: `${heightPct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
                              />
                            </div>

                            {/* Day Label */}
                            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${isHovered ? 'text-teal-700' : 'text-muted-deep'}`}>
                              {day.label}
                            </span>
                          </div>
                        )
                      })}
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
                <div className="lg:col-span-2 rounded-card border border-hairline bg-surface p-5 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-hairline pb-3.5">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-[14px] font-semibold text-ink">Leave Overview</h2>
                      <div className="relative group/info">
                        <Info size={13} className="text-muted cursor-pointer hover:text-ink transition-colors" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-ink text-white text-[10px] rounded shadow-lg opacity-0 pointer-events-none group-hover/info:opacity-100 transition-opacity duration-200 z-25 text-center leading-normal">
                          Shows approved leave days by category taken so far this year.
                        </div>
                      </div>
                    </div>
                  </div>

                  {totalDays === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                      <p className="text-[13px] font-medium text-ink">No leave taken yet this year</p>
                      <p className="mt-1 text-[12px] text-muted">Approved leave will show up here.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-6 my-4 flex-1">
                      {/* SVG Donut Chart */}
                      <div className="relative size-28 shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="size-full">
                          {/* Background Track */}
                          <circle
                            cx="50"
                            cy="50"
                            r="36"
                            fill="transparent"
                            stroke="var(--color-wash)"
                            strokeWidth="11"
                          />
                          {data.leaveBreakdown.map((slice) => {
                            const length = (slice.days / totalDays) * circumference
                            const offset = -cumulative
                            cumulative += length
                            const isHovered = hoveredSlice === slice.type
                            const isAnyHovered = hoveredSlice !== null

                            return (
                              <motion.circle
                                key={slice.type}
                                cx="50"
                                cy="50"
                                r="36"
                                fill="transparent"
                                stroke={LEAVE_TYPE_COLOR[slice.type]}
                                strokeWidth={isHovered ? 14 : 11}
                                strokeDasharray={`${length} ${circumference}`}
                                initial={{ strokeDashoffset: offset + length }}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                                className="transition-all duration-200 cursor-pointer"
                                style={{ opacity: isAnyHovered && !isHovered ? 0.45 : 1 }}
                                onMouseEnter={() => setHoveredSlice(slice.type)}
                                onMouseLeave={() => setHoveredSlice(null)}
                              />
                            )
                          })}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <motion.span
                            key={totalDays}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-[20px] font-black leading-none text-ink"
                          >
                            {totalDays}
                          </motion.span>
                          <span className="text-[9.5px] text-muted uppercase tracking-wider font-bold mt-1">Total Days</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-1 w-full flex flex-col gap-1.5 text-[11.5px] font-medium text-ink">
                        {data.leaveBreakdown.map((slice) => {
                          const isHovered = hoveredSlice === slice.type
                          const isAnyHovered = hoveredSlice !== null
                          const slicePct = Math.round((slice.days / totalDays) * 100)
                          return (
                            <div
                              key={slice.type}
                              className={`flex items-center justify-between p-1.5 rounded-ctl transition-all duration-200 cursor-pointer ${isHovered ? 'bg-wash/80 font-bold scale-[1.02]' : 'hover:bg-wash/30'
                                }`}
                              style={{ opacity: isAnyHovered && !isHovered ? 0.5 : 1 }}
                              onMouseEnter={() => setHoveredSlice(slice.type)}
                              onMouseLeave={() => setHoveredSlice(null)}
                            >
                              <span className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: LEAVE_TYPE_COLOR[slice.type] }} />
                                <span className="text-muted">{LEAVE_TYPE_LABEL[slice.type]}</span>
                              </span>
                              <span className="font-semibold text-ink font-mono">
                                {slice.days}d ({slicePct}%)
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-hairline pt-3.5 mt-1">
                    <span className="text-[12px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100/30">
                      {data.pendingLeaveCount > 0 ? `${data.pendingLeaveCount} pending approval` : 'All caught up'}
                    </span>
                    <Link to="/dashboard/leave" className="text-[12.5px] font-bold text-pine hover:text-pine-deep hover:underline transition-colors">View all</Link>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Activity / Upcoming Leave / Check In Grid */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="rounded-card border border-hairline bg-surface p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-hairline pb-3.5">
                  <h2 className="text-[14px] font-semibold text-ink">Recent Activity</h2>
                </div>

                {status === 'ready' && data ? (
                  data.activity.length > 0 ? (
                    <div className="relative mt-3">
                      {/* Timeline connecting line */}
                      <div className="absolute left-[15px] top-3.5 bottom-3.5 w-[1.5px] bg-hairline pointer-events-none" />
                      <ul className="space-y-1">
                        {data.activity.map((item, index) => {
                          const Icon = ACTIVITY_ICON[item.kind]
                          const timeStr = timeAgo(item.occurredAt)

                          return (
                            <motion.li
                              key={item.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="flex gap-3.5 p-2.5 items-start rounded-ctl hover:bg-wash/50 transition-all duration-200 group relative"
                            >
                              <span className="flex size-7.5 shrink-0 items-center justify-center rounded-full bg-pine-tint z-10 relative group-hover:scale-110 transition-transform duration-200">
                                <Icon size={13} className="text-pine" aria-hidden="true" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] leading-snug font-semibold text-ink">{item.title}</p>
                                <p className="tnum mt-0.5 text-[11.5px] text-muted">{item.meta}</p>
                              </div>
                              <span className="shrink-0 text-[10.5px] font-bold text-muted bg-wash/80 px-1.5 py-0.5 rounded-ctl group-hover:bg-wash transition-colors">
                                {timeStr}
                              </span>
                            </motion.li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">Nothing to catch up on</p>
                      <p className="mt-1 text-[12px] text-muted">
                        Activity from your team will show up here.
                      </p>
                    </div>
                  )
                ) : (
                  <ul className="mt-3 divide-y divide-hairline">
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

            {/* Upcoming Leave — real approved leave */}
            {canSeeLeaveOverview && (
              <div className="rounded-card border border-hairline bg-surface p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-hairline pb-3.5">
                    <h2 className="text-[14px] font-semibold text-ink">Upcoming Leave</h2>
                  </div>

                  {data && data.upcomingLeave.length > 0 ? (
                    <div className="relative mt-3">
                      {/* Timeline connecting line */}
                      <div className="absolute left-[15px] top-3.5 bottom-3.5 w-[1.5px] bg-hairline pointer-events-none" />
                      <ul className="space-y-1">
                        {data.upcomingLeave.map((item, index) => {
                          const daysUntil = getDaysUntilLabel(item.startDate)
                          return (
                            <motion.li
                              key={item.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="flex gap-3.5 p-2.5 items-start rounded-ctl hover:bg-wash/50 transition-all duration-200 group relative"
                            >
                              <span
                                className="flex size-7.5 shrink-0 items-center justify-center rounded-full z-10 relative group-hover:scale-110 transition-transform duration-200"
                                style={{ backgroundColor: `${LEAVE_TYPE_COLOR[item.type]}1a`, color: LEAVE_TYPE_COLOR[item.type] }}
                              >
                                <CalendarDays size={13} aria-hidden="true" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-[13px] leading-snug font-semibold text-ink">
                                  {item.employeeName} · <span className="opacity-80 font-normal">{LEAVE_TYPE_LABEL[item.type]}</span>
                                </p>
                                <p className="mt-0.5 text-[11.5px] text-muted font-medium">
                                  {formatLeaveDate(item.startDate)} – {formatLeaveDate(item.endDate)} · {item.days} day{item.days === 1 ? '' : 's'}
                                </p>
                              </div>
                              <span className={`shrink-0 text-[10.5px] font-bold px-1.5 py-0.5 rounded-ctl border transition-all duration-200 ${daysUntil === 'Today' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/20' :
                                  daysUntil === 'Tomorrow' ? 'bg-amber-50 text-amber-700 border-amber-200/20' :
                                    'bg-wash text-muted border-hairline/30 group-hover:bg-wash'
                                }`}>
                                {daysUntil}
                              </span>
                            </motion.li>
                          )
                        })}
                      </ul>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-[13px] font-medium text-ink">No upcoming leave</p>
                      <p className="mt-1 text-[12px] text-muted">Approved leave coming up will show up here.</p>
                    </div>
                  )}
                </div>
                <div className="border-t border-hairline pt-3.5 mt-3">
                  <Link to="/dashboard/leave" className="text-[12.5px] font-bold text-pine hover:text-pine-deep hover:underline transition-colors">View all leave</Link>
                </div>
              </div>
            )}

            {/* Check In / Out */}
            {attendanceData && attendanceData.myTodayStatus !== null && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="h-full"
              >
                <CheckInOutCard
                  status={attendanceData.myTodayStatus}
                  loading={checkingInOut}
                  name={user.name}
                  onCheckIn={() => checkIn(viewer)}
                  onCheckOut={() => checkOut(viewer)}
                />
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
