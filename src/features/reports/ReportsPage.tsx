import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Clock,
  Download,
  TrendingDown,
  Users,
  Sparkles,
  MoreVertical,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { reportsService, type ReportsData } from '@/services/reportsService'
import { formatMoneyCompact } from '@/services/payrollService'

type StatCardType = 'headcount' | 'attrition' | 'attendance' | 'payrollCost' | 'leaveTaken'

const getDeptColor = (dept: string) => {
  const colors: Record<string, string> = {
    Engineering: 'bg-emerald-500',
    Sales: 'bg-amber-500',
    Product: 'bg-sky-500',
    HR: 'bg-rose-500',
    Marketing: 'bg-violet-500',
    Design: 'bg-fuchsia-500',
    Finance: 'bg-indigo-500',
    Operations: 'bg-slate-500',
  }
  return colors[dept] || 'bg-pine'
}

function StatCard({
  type,
  icon: Icon,
  label,
  value,
  hint,
}: {
  type: StatCardType
  icon: typeof Users
  label: string
  value: string
  hint?: string
}) {
  const configs = {
    headcount: {
      bg: 'bg-teal-50/80 text-teal-600 border border-teal-100/50',
      glow: 'hover:shadow-[0_0_20px_rgba(13,148,136,0.1)] hover:border-teal-500/30',
      sparkline: 'teal',
    },
    attrition: {
      bg: 'bg-clay-tint text-clay border border-clay/20',
      glow: 'hover:shadow-[0_0_20px_rgba(156,66,33,0.1)] hover:border-clay/30',
      sparkline: 'orange',
    },
    attendance: {
      bg: 'bg-pine-tint text-pine-deep border border-pine/20',
      glow: 'hover:shadow-[0_0_20px_rgba(31,77,63,0.1)] hover:border-pine/30',
      sparkline: 'emerald',
    },
    payrollCost: {
      bg: 'bg-indigo-50/80 text-indigo-600 border border-indigo-100/50',
      glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:border-indigo-500/30',
      sparkline: 'purple',
    },
    leaveTaken: {
      bg: 'bg-ochre-tint text-ochre-deep border border-ochre/20',
      glow: 'hover:shadow-[0_0_20px_rgba(169,121,28,0.1)] hover:border-ochre/30',
      sparkline: 'orange',
    },
  }[type]

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={`relative p-4 h-[155px] flex flex-col justify-between transition-all duration-300 border border-hairline overflow-hidden hover:shadow-lg ${configs.glow}`}>
        <div className="flex items-start justify-between w-full">
          <div className={`p-2.5 rounded-full shrink-0 flex items-center justify-center ${configs.bg}`}>
            <Icon size={16} aria-hidden="true" />
          </div>
          <button type="button" className="text-muted hover:text-ink transition-colors p-1 rounded-ctl hover:bg-wash cursor-pointer">
            <MoreVertical size={16} />
          </button>
        </div>
        
        <div className="min-w-0 flex-1 mt-3">
          <p className="text-[11px] text-muted font-bold uppercase tracking-wider leading-none">{label}</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="tnum font-display text-[26px] leading-none font-bold text-ink">
              {value}
            </p>
            {hint && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border border-hairline/40 bg-wash/50 text-muted leading-none">
                {hint}
              </span>
            )}
          </div>
        </div>

        {/* Sparkline Graph */}
        <div className="absolute bottom-0 inset-x-0 h-10 overflow-hidden pointer-events-none rounded-b-card">
          {configs.sparkline === 'teal' && (
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
          {configs.sparkline === 'emerald' && (
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
          {configs.sparkline === 'orange' && (
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
          {configs.sparkline === 'purple' && (
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
      </Card>
    </motion.div>
  )
}

function StatSkeleton() {
  return (
    <Card className="p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-wash" />
      <div className="mt-3 h-6 w-16 animate-pulse rounded bg-wash" />
      <div className="mt-2.5 h-3 w-24 animate-pulse rounded bg-wash" />
    </Card>
  )
}

export default function ReportsPage() {
  const user = useAuthStore((s) => s.user)!

  const [data, setData] = useState<ReportsData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    void reportsService
      .get(user.role)
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [user.role])

  const isLoading = status === 'loading' || !data
  const maxHeadcount = data ? Math.max(...data.headcountByMonth.map((m) => m.value)) : 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Reports
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">
            Headcount, attendance, leave and cost — across the company.
          </p>
        </div>

        <Button
          className="font-bold shadow-sm"
        >
          <Download size={15} />
          Export CSV
        </Button>
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <p className="text-[14px] font-medium text-clay">We could not build your reports.</p>
        </Card>
      )}

      {status !== 'error' && (
        <>
          {/* Stats summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  type="headcount"
                  icon={Users}
                  label="Headcount"
                  value={String(data.activeCount)}
                  hint={`${data.headcount} on record`}
                />
                <StatCard
                  type="attrition"
                  icon={TrendingDown}
                  label="Attrition"
                  value={`${data.attritionRate}%`}
                  hint="leavers and notice periods"
                />
                <StatCard
                  type="attendance"
                  icon={Clock}
                  label="Attendance"
                  value={`${data.avgAttendance}%`}
                  hint="this month, company-wide"
                />
                {/* HR runs every report except the one that reveals pay (§10). */}
                {data.payrollCost !== null ? (
                  <StatCard
                    type="payrollCost"
                    icon={Banknote}
                    label="Payroll cost"
                    value={formatMoneyCompact(data.payrollCost)}
                    hint="gross, latest run"
                  />
                ) : (
                  <StatCard
                    type="leaveTaken"
                    icon={CalendarDays}
                    label="Leave taken"
                    value={String(data.leaveDaysTaken)}
                    hint="approved days, this year"
                  />
                )}
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Departments */}
            <Card flush className="lg:col-span-2">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold text-ink">Department statistics</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-pine hover:text-pine-deep cursor-pointer"
                >
                  <Download size={13} />
                  Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead>
                    <tr className="border-b border-hairline bg-wash">
                      {['Department', 'Headcount', 'Share', 'Attendance', 'Leave days'].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className="px-4 py-2.5 text-left text-[11.5px] font-bold text-muted uppercase tracking-wider"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-hairline">
                    {isLoading
                      ? [0, 1, 2, 3, 4].map((i) => (
                          <tr key={i} className="border-b border-hairline last:border-0">
                            {[0, 1, 2, 3, 4].map((j) => (
                              <td key={j} className="px-4 py-3">
                                <div className="h-3.5 w-16 animate-pulse rounded bg-wash" />
                              </td>
                            ))}
                          </tr>
                        ))
                      : data.departments.map((row) => {
                          const deptColor = getDeptColor(row.department)
                          return (
                            <tr
                              key={row.department}
                              className="hover:bg-wash/30 transition-colors text-ink text-[13px]"
                            >
                              <td className="px-4 py-3.5 font-semibold flex items-center gap-2">
                                <span className={`inline-block size-2 rounded-full ${deptColor}`} />
                                {row.department}
                              </td>
                              <td className="tnum px-4 py-3.5 font-medium">{row.headcount}</td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-wash">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${row.share}%` }}
                                      transition={{ duration: 0.8, ease: 'easeOut' }}
                                      className={`h-full rounded-full ${deptColor}`}
                                    />
                                  </div>
                                  <span className="tnum text-[11.5px] text-muted font-semibold">{row.share}%</span>
                                </div>
                              </td>
                              <td className="tnum px-4 py-3.5 text-muted font-medium">
                                {row.attendanceRate}%
                              </td>
                              <td className="tnum px-4 py-3.5 text-muted font-medium">
                                {row.leaveDaysTaken}
                              </td>
                            </tr>
                          )
                        })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Headcount trend */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">Headcount trend</h2>
                <p className="mt-1 text-[12px] text-muted font-medium">Last six months</p>

                {isLoading ? (
                  <div className="mt-6 flex h-40 items-end gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex-1 animate-pulse rounded-t bg-wash" style={{ height: `${40 + i * 8}%` }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="mt-6 flex h-40 items-end gap-2.5">
                      {data.headcountByMonth.map((month, i) => {
                        const barColors = [
                          'bg-indigo-500 hover:bg-indigo-600',
                          'bg-sky-500 hover:bg-sky-600',
                          'bg-teal-500 hover:bg-teal-600',
                          'bg-emerald-500 hover:bg-emerald-600',
                          'bg-pine hover:bg-pine-deep',
                          'bg-emerald-700 hover:bg-emerald-800',
                        ]
                        return (
                          <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                            <span className="tnum text-[11px] font-bold text-ink">
                              {month.value}
                            </span>
                            <div className="w-full h-full relative overflow-hidden bg-wash rounded-t-[3px]">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(month.value / maxHeadcount) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`absolute bottom-0 w-full rounded-t-[3px] hover:scale-x-105 transition-all cursor-pointer ${
                                  barColors[i] || 'bg-pine'
                                }`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-2 flex gap-2 border-t border-hairline pt-2">
                      {data.headcountByMonth.map((month) => (
                        <span
                          key={month.label}
                          className="flex-1 text-center text-[10.5px] text-muted font-bold"
                        >
                          {month.label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!isLoading && (
                <div className="mt-6 bg-pine-tint/40 border border-pine/15 rounded-ctl p-3 text-[11.5px] text-pine-deep leading-relaxed">
                  <strong>Trend Analysis:</strong> Headcount has grown from <strong>{data.headcountByMonth[0]?.value}</strong> to <strong>{data.headcountByMonth[data.headcountByMonth.length - 1]?.value}</strong> over the past six months, indicating a steady team expansion.
                </div>
              )}
            </Card>
          </div>

          <p className="mt-4 text-[11px] text-muted font-medium">Export buttons are UI-only in this phase.</p>
        </>
      )}
    </motion.div>
  )
}
