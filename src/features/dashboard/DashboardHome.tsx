import { useEffect } from 'react'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  RotateCw,
  Target,
  UserPlus,
  Users,
  Activity,
  Star,
  Info,
  Plus,
  ChevronDown,
  CheckCircle2,
  FileUp,
  Clock,
  MoreVertical,
} from 'lucide-react'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useDashboardStore } from './store/dashboardStore'

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
    <div className="rounded-card border border-hairline bg-surface p-4 flex gap-4 items-start animate-pulse">
      <div className="size-10 rounded-full bg-wash shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="h-3 w-20 rounded bg-wash" />
        <div className="mt-2 h-7 w-16 rounded bg-wash" />
        <div className="mt-2.5 h-3 w-24 rounded bg-wash" />
      </div>
    </div>
  )
}

const getStatStyle = (id: string, label: string) => {
  const normId = id.toLowerCase()
  const normLabel = label.toLowerCase()

  if (normId.includes('headcount') || normLabel.includes('employee') || normLabel.includes('total')) {
    return {
      label: 'Total Employees',
      Icon: UserPlus,
      iconColor: 'text-teal-600',
      iconBg: 'bg-teal-50/80 border border-teal-100/50',
      deltaColor: 'text-emerald-700 bg-emerald-50/60 border border-emerald-100/30',
      sparkline: 'teal',
    }
  }
  if (normId.includes('present') || normLabel.includes('present')) {
    return {
      label: 'Present Today',
      Icon: Activity,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50/80 border border-emerald-100/50',
      deltaColor: 'text-muted-deep bg-wash/60 border border-hairline/60',
      sparkline: 'emerald',
    }
  }
  if (normId.includes('leave') || normLabel.includes('leave')) {
    return {
      label: 'On Leave',
      Icon: CalendarDays,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50/80 border border-orange-100/50',
      deltaColor: 'text-orange-700 bg-orange-50/60 border border-orange-100/30',
      sparkline: 'orange',
    }
  }
  if (normId.includes('payroll') || normLabel.includes('payroll')) {
    return {
      label: 'March Payroll',
      Icon: Banknote,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50/80 border border-indigo-100/50',
      deltaColor: 'text-indigo-700 bg-indigo-50/60 border border-indigo-100/30',
      sparkline: 'purple',
    }
  }

  return {
    label: label,
    Icon: Star,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50/80 border border-purple-100/50',
    deltaColor: 'text-purple-700 bg-purple-50/60 border border-purple-100/30',
    sparkline: 'purple',
  }
}

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load } = useDashboardStore()

  useEffect(() => {
    void load(user.role)
  }, [load, user.role])

  const firstName = user.name.split(' ')[0]
  const greeting = greetingFor(new Date().getHours())

  // Ensure 4 stats are shown to match mockup (add Performance if missing)
  const statsToShow = data ? [...data.stats] : []
  if (data && statsToShow.length < 4) {
    statsToShow.push({
      id: 'st-performance',
      organizationId: user.organizationId || '',
      label: 'Average Performance',
      value: '4.6 / 5',
      delta: '0.3 this month',
    })
  }

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
          <div className="flex gap-2">
            <Button
              className="h-9.5 font-bold"
            >
              <Plus size={14} />
              Quick Action
              <ChevronDown size={14} className="opacity-80" />
            </Button>
            {status === 'ready' && (
              <Button
                variant="secondary"
                size="sm"
                className="h-9.5"
                onClick={() => void load(user.role, { force: true })}
              >
                <RotateCw size={14} />
                Refresh
              </Button>
            )}
          </div>
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
              onClick={() => void load(user.role, { force: true })}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {status === 'ready' && data
              ? statsToShow.map((stat) => {
                const style = getStatStyle(stat.id, stat.label)
                const StatIcon = style.Icon
                return (
                  <div key={stat.id} className="group relative rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-hairline-strong overflow-hidden h-[155px]">
                    <div className="flex items-start justify-between w-full">
                      <div className={`p-2.5 rounded-full shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${style.iconBg}`}>
                        <StatIcon className={`size-5 ${style.iconColor}`} />
                      </div>
                      <button type="button" className="text-muted hover:text-ink transition-colors p-1 rounded-ctl hover:bg-wash cursor-pointer">
                        <MoreVertical size={16} />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1 mt-3">
                      <p className="text-[11px] text-muted font-bold uppercase tracking-wider leading-none">{style.label}</p>
                      <div className="flex items-baseline justify-between mt-2">
                        <p className="tnum font-display text-[26px] leading-none font-bold text-ink">
                          {stat.value}
                        </p>
                        {stat.delta && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none ${style.deltaColor}`}>
                            {stat.delta}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sparkline Graph */}
                    <div className="absolute bottom-0 inset-x-0 h-10 overflow-hidden pointer-events-none rounded-b-card">
                      {style.sparkline === 'teal' && (
                        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="spark-teal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,26 C 15,28 30,14 45,16 C 60,18 75,6 90,8 C 95,9 98,4 100,3" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 0,26 C 15,28 30,14 45,16 C 60,18 75,6 90,8 C 95,9 98,4 100,3 L 100,30 L 0,30 Z" fill="url(#spark-teal)" />
                          <circle cx="100" cy="3" r="1.5" fill="#0d9488" />
                        </svg>
                      )}
                      {style.sparkline === 'emerald' && (
                        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="spark-emerald" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,16 C 10,8 20,24 30,16 C 40,8 50,24 60,16 C 70,8 80,24 90,16 C 95,12 98,16 100,12" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 0,16 C 10,8 20,24 30,16 C 40,8 50,24 60,16 C 70,8 80,24 90,16 C 95,12 98,16 100,12 L 100,30 L 0,30 Z" fill="url(#spark-emerald)" />
                          <circle cx="100" cy="12" r="1.5" fill="#10b981" />
                        </svg>
                      )}
                      {style.sparkline === 'orange' && (
                        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="spark-orange" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,28 C 15,28 30,28 45,12 C 55,4 65,22 80,24 C 90,25 97,27 100,28" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 0,28 C 15,28 30,28 45,12 C 55,4 65,22 80,24 C 90,25 97,27 100,28 L 100,30 L 0,30 Z" fill="url(#spark-orange)" />
                          <circle cx="100" cy="28" r="1.5" fill="#f97316" />
                        </svg>
                      )}
                      {style.sparkline === 'purple' && (
                        <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="spark-purple" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,14 C 15,12 30,22 45,18 C 60,10 75,8 90,6 C 95,5 98,6 100,5" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
                          <path d="M 0,14 C 15,12 30,22 45,18 C 60,10 75,8 90,6 C 95,5 98,6 100,5 L 100,30 L 0,30 Z" fill="url(#spark-purple)" />
                          <circle cx="100" cy="5" r="1.5" fill="#8b5cf6" />
                        </svg>
                      )}
                    </div>
                  </div>
                )
              })
              : [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)}
          </div>

          {/* Overview Charts Grid */}
          <div className="grid gap-4 lg:grid-cols-5">
            {/* Attendance Chart */}
            <div className="lg:col-span-3 rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between relative">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[14px] font-semibold text-ink">Attendance Overview</h2>
                  <Info size={13} className="text-muted cursor-pointer hover:text-ink transition-colors" />
                </div>
                <button className="inline-flex items-center gap-1 rounded-ctl border border-hairline-strong bg-surface px-2.5 py-1 text-[11.5px] font-medium text-ink transition-colors hover:bg-wash">
                  This Week
                  <ChevronDown size={12} className="text-muted" />
                </button>
              </div>

              <div className="mt-5 relative h-44 w-full">
                <svg viewBox="0 0 500 140" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="attendance-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  <line x1="20" y1="10" x2="480" y2="10" stroke="#f3f3f0" strokeWidth="1" />
                  <line x1="20" y1="40" x2="480" y2="40" stroke="#f3f3f0" strokeWidth="1" />
                  <line x1="20" y1="70" x2="480" y2="70" stroke="#f3f3f0" strokeWidth="1" />
                  <line x1="20" y1="100" x2="480" y2="100" stroke="#f3f3f0" strokeWidth="1" />
                  <line x1="20" y1="130" x2="480" y2="130" stroke="#f3f3f0" strokeWidth="1" />

                  {/* Y Axis Labels */}
                  <text x="5" y="13" className="text-[9.5px] fill-muted font-medium">40</text>
                  <text x="5" y="43" className="text-[9.5px] fill-muted font-medium">30</text>
                  <text x="5" y="73" className="text-[9.5px] fill-muted font-medium">20</text>
                  <text x="5" y="103" className="text-[9.5px] fill-muted font-medium">10</text>
                  <text x="10" y="133" className="text-[9.5px] fill-muted font-medium">0</text>

                  {/* Dotted Vertical Guide line for Wednesday */}
                  <line x1="173.3" y1="10" x2="173.3" y2="130" stroke="#e4e4e1" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Gradient Area under curve */}
                  <path
                    d="M 20,40 C 50,38 70,32 96.6,34 C 120,36 150,28 173.3,28 C 200,28 230,31 250,31 C 280,31 310,25 326.6,25 C 360,25 380,94 403.3,94 C 430,94 450,91 480,91 L 480,130 L 20,130 Z"
                    fill="url(#attendance-glow)"
                  />

                  {/* Line curve path */}
                  <path
                    d="M 20,40 C 50,38 70,32 96.6,34 C 120,36 150,28 173.3,28 C 200,28 230,31 250,31 C 280,31 310,25 326.6,25 C 360,25 380,94 403.3,94 C 430,94 450,91 480,91"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data Points */}
                  <circle cx="20" cy="40" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <circle cx="96.6" cy="34" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <circle cx="173.3" cy="28" r="3.5" fill="#10b981" stroke="#10b981" strokeWidth="2" />
                  <circle cx="250" cy="31" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <circle cx="326.6" cy="25" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <circle cx="403.3" cy="94" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <circle cx="480" cy="91" r="3.5" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                </svg>

                {/* Selected Tooltip Overlay */}
                <div
                  className="absolute bg-surface border border-hairline shadow-overlay rounded-ctl px-2.5 py-1.5 text-[11px] pointer-events-none"
                  style={{ left: 'calc(34.66% - 50px)', top: '12px' }}
                >
                  <p className="font-semibold text-ink">Wed, 12 Mar</p>
                  <p className="text-muted flex items-center gap-1 mt-0.5 font-medium">
                    <span className="inline-block size-1.5 rounded-full bg-[#10b981]" />
                    Present: <span className="font-bold text-ink">34</span>
                  </p>
                </div>
              </div>

              {/* X Axis Labels */}
              <div className="flex items-center justify-between text-[11px] text-muted px-4 mt-2.5 font-medium">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Leave Overview Chart */}
            <div className="lg:col-span-2 rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[14px] font-semibold text-ink">Leave Overview</h2>
                  <Info size={13} className="text-muted cursor-pointer hover:text-ink transition-colors" />
                </div>
              </div>

              <div className="flex items-center gap-4 my-4 flex-1">
                {/* SVG Donut Chart */}
                <div className="relative size-24 shrink-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="size-full">
                    {/* Segment 1: Annual Leave (6 = 50%) */}
                    <circle cx="50" cy="50" r="36" fill="transparent" stroke="#10b981" strokeWidth="11" strokeDasharray="113.1 226.2" strokeDashoffset="0" transform="rotate(-90 50 50)" strokeLinecap="round" />

                    {/* Segment 2: Sick Leave (3 = 25%) */}
                    <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f59e0b" strokeWidth="11" strokeDasharray="56.5 226.2" strokeDashoffset="-113.1" transform="rotate(-90 50 50)" strokeLinecap="round" />

                    {/* Segment 3: Personal Leave (2 = 16.7%) */}
                    <circle cx="50" cy="50" r="36" fill="transparent" stroke="#8b5cf6" strokeWidth="11" strokeDasharray="37.8 226.2" strokeDashoffset="-169.6" transform="rotate(-90 50 50)" strokeLinecap="round" />

                    {/* Segment 4: Other Leave (1 = 8.3%) */}
                    <circle cx="50" cy="50" r="36" fill="transparent" stroke="#facc15" strokeWidth="11" strokeDasharray="18.8 226.2" strokeDashoffset="-207.4" transform="rotate(-90 50 50)" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[18px] font-bold leading-none text-ink">12</span>
                    <span className="text-[9.5px] text-muted mt-0.5 font-medium">Total</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 flex flex-col gap-1.5 text-[11.5px] font-medium text-ink">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#10b981]" />
                      <span className="text-muted">Annual</span>
                    </span>
                    <span className="font-semibold text-ink">6 (50%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#f59e0b]" />
                      <span className="text-muted">Sick</span>
                    </span>
                    <span className="font-semibold text-ink">3 (25%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#8b5cf6]" />
                      <span className="text-muted">Personal</span>
                    </span>
                    <span className="font-semibold text-ink">2 (16.7%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#facc15]" />
                      <span className="text-muted">Other</span>
                    </span>
                    <span className="font-semibold text-ink">1 (8.3%)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-hairline pt-3 mt-1">
                <span className="text-[12px] font-semibold text-orange-600">1 pending approval</span>
                <a href="#leave" className="text-[12px] font-semibold text-pine hover:underline">View all</a>
              </div>
            </div>
          </div>

          {/* Activity / Events / Quick Actions Grid */}
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
                        const timeMap: Record<string, string> = {
                          'ac-1': '2h ago',
                          'ac-2': '1d ago',
                          'ac-3': '2d ago',
                          'ac-4': '2d ago',
                        }
                        const timeStr = timeMap[item.id] || '3d ago'

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
              <div className="border-t border-hairline pt-3 mt-3">
                <a href="#activity" className="text-[12px] font-semibold text-pine hover:underline">View all activity</a>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="rounded-card border border-hairline bg-surface p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <h2 className="text-[14px] font-semibold text-ink">Upcoming Events</h2>
                  <button className="inline-flex items-center rounded-ctl border border-hairline-strong bg-surface px-2.5 py-1 text-[11px] font-medium text-ink transition-colors hover:bg-wash">
                    View Calendar
                  </button>
                </div>

                <ul className="mt-2.5 divide-y divide-hairline">
                  {[
                    {
                      id: 1,
                      title: 'Team Standup',
                      time: 'Today · 10:00 AM',
                      iconBg: 'bg-blue-50 text-blue-600',
                      Icon: Clock,
                    },
                    {
                      id: 2,
                      title: 'Performance Review: Design Team',
                      time: 'Tomorrow · 2:00 PM',
                      iconBg: 'bg-purple-50 text-purple-600',
                      Icon: Target,
                    },
                    {
                      id: 3,
                      title: 'Payroll Processing',
                      time: '15 Mar 2024 · 9:00 AM',
                      iconBg: 'bg-emerald-50 text-emerald-600',
                      Icon: Banknote,
                    },
                    {
                      id: 4,
                      title: 'Company All Hands',
                      time: '20 Mar 2024 · 11:00 AM',
                      iconBg: 'bg-pink-50 text-pink-600',
                      Icon: Users,
                    },
                  ].map((event) => {
                    const EventIcon = event.Icon
                    return (
                      <li key={event.id} className="flex gap-3 py-3 items-center last:pb-0">
                        <span className={`flex size-7.5 shrink-0 items-center justify-center rounded-full ${event.iconBg}`}>
                          <EventIcon size={13} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[13px] leading-snug font-semibold text-ink">{event.title}</p>
                          <p className="mt-0.5 text-[11.5px] text-muted font-medium">{event.time}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-card border border-hairline bg-surface p-4">
              <div className="border-b border-hairline pb-3">
                <h2 className="text-[14px] font-semibold text-ink">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mt-4">
                {[
                  { label: 'Request Leave', Icon: CalendarDays, bg: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Add Employee', Icon: UserPlus, bg: 'bg-blue-50 text-blue-600' },
                  { label: 'View Reports', Icon: Activity, bg: 'bg-purple-50 text-purple-600' },
                  { label: 'Mark Attendance', Icon: CheckCircle2, bg: 'bg-orange-50 text-orange-600' },
                  { label: 'Upload Doc', Icon: FileUp, bg: 'bg-cyan-50 text-cyan-600' },
                  { label: 'Feedback', Icon: Star, bg: 'bg-amber-50 text-amber-600' },
                ].map((action) => {
                  const ActionIcon = action.Icon
                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="flex flex-col items-center justify-center p-2.5 rounded-card border border-hairline bg-surface hover:bg-wash transition-colors text-center cursor-pointer group"
                    >
                      <span className={`flex size-8.5 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${action.bg}`}>
                        <ActionIcon size={14} />
                      </span>
                      <span className="text-[10.5px] font-bold text-ink mt-2 leading-tight">
                        {action.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
