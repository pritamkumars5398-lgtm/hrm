import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Briefcase,
  CalendarDays,
  Clock,
  Download,
  Loader2,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  XCircle,
  UserCheck,
  Timer,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/features/auth/store/authStore'
import { reportsService, type ReportsData } from '@/services/reportsService'
import { formatMoneyCompact } from '@/services/payrollService'
import { hasPermission } from '@/shared/config/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'employees' | 'attendance' | 'leave' | 'payroll' | 'recruitment' | 'performance'

const TABS: { key: Tab; label: string; icon: typeof Users; permission?: string }[] = [
  { key: 'overview',     label: 'Overview',     icon: Sparkles },
  { key: 'employees',   label: 'Employees',    icon: Users,         permission: 'employees.view' },
  { key: 'attendance',  label: 'Attendance',   icon: Clock,         permission: 'attendance.view' },
  { key: 'leave',       label: 'Leave',        icon: CalendarDays,  permission: 'leave.view' },
  { key: 'payroll',     label: 'Payroll',      icon: Banknote,      permission: 'payroll.view' },
  { key: 'recruitment', label: 'Recruitment',  icon: Briefcase,     permission: 'recruitment.view' },
  { key: 'performance', label: 'Performance',  icon: Target,        permission: 'performance.view' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = 'teal',
  trend,
}: {
  icon: typeof Users
  label: string
  value: string
  hint?: string
  color?: 'teal' | 'rose' | 'emerald' | 'indigo' | 'amber' | 'violet' | 'sky'
  trend?: 'up' | 'down'
}) {
  const colorMap = {
    teal:    { bg: 'bg-teal-50 text-teal-600 border-teal-100',     bar: 'bg-teal-500' },
    rose:    { bg: 'bg-rose-50 text-rose-600 border-rose-100',     bar: 'bg-rose-500' },
    emerald: { bg: 'bg-emerald-50 text-emerald-600 border-emerald-100', bar: 'bg-emerald-500' },
    indigo:  { bg: 'bg-indigo-50 text-indigo-600 border-indigo-100', bar: 'bg-indigo-500' },
    amber:   { bg: 'bg-amber-50 text-amber-600 border-amber-100',   bar: 'bg-amber-500' },
    violet:  { bg: 'bg-violet-50 text-violet-600 border-violet-100', bar: 'bg-violet-500' },
    sky:     { bg: 'bg-sky-50 text-sky-600 border-sky-100',         bar: 'bg-sky-500' },
  }[color]

  return (
    <motion.div whileHover={{ y: -3, transition: { duration: 0.18 } }}>
      <Card className="p-4 h-[140px] flex flex-col justify-between border border-hairline hover:shadow-md transition-all">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded-lg border ${colorMap.bg}`}>
            <Icon size={15} />
          </div>
          {trend && (
            <span className={`flex items-center gap-0.5 text-[11px] font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {trend === 'up' ? '+' : '-'}
            </span>
          )}
          <button type="button" className="text-muted hover:text-ink p-1 rounded hover:bg-wash">
            <MoreVertical size={14} />
          </button>
        </div>
        <div>
          <p className="text-[11px] text-muted font-bold uppercase tracking-wider">{label}</p>
          <p className="text-[24px] font-display font-bold text-ink mt-1">{value}</p>
          {hint && <p className="text-[11px] text-muted mt-0.5">{hint}</p>}
        </div>
      </Card>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <Card className="p-4 h-[140px]">
      <div className="h-8 w-8 rounded-lg animate-pulse bg-wash" />
      <div className="mt-4 h-3 w-20 animate-pulse rounded bg-wash" />
      <div className="mt-2 h-6 w-16 animate-pulse rounded bg-wash" />
    </Card>
  )
}

// ─── Section: Overview ────────────────────────────────────────────────────────
function OverviewSection({ data, isLoading, onExport, exporting, permissions }: {
  data: ReportsData | null
  isLoading: boolean
  onExport: () => void
  exporting: boolean
  permissions: string[]
}) {
  const maxHC = data ? Math.max(...data.headcountByMonth.map((m) => m.value)) : 1

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [0,1,2,3].map(i => <SkeletonCard key={i} />)
        ) : data ? (
          <>
            <StatCard icon={Users}       label="Total Headcount"   value={String(data.activeCount)}       hint={`${data.headcount} on record`}           color="teal"    trend="up" />
            <StatCard icon={TrendingDown} label="Attrition Rate"    value={`${data.attritionRate}%`}       hint="leavers & notice periods"                color="rose"    trend="down" />
            <StatCard icon={Clock}        label="Avg Attendance"    value={`${data.avgAttendance}%`}       hint="this month, company-wide"                color="emerald" trend="up" />
            {data.payrollCost !== null ? (
              <StatCard icon={Banknote}   label="Payroll Cost"      value={formatMoneyCompact(data.payrollCost)} hint="gross, latest run"                color="indigo" />
            ) : (
              <StatCard icon={CalendarDays} label="Leave Taken"     value={String(data.leaveDaysTaken)}   hint="approved days, this year"                color="amber" />
            )}
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department table */}
        <Card flush className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Department Statistics</h2>
            <button
              type="button"
              onClick={onExport}
              disabled={exporting || isLoading}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-pine hover:text-pine-deep disabled:opacity-50"
            >
              {exporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-hairline bg-wash">
                  {['Department', 'Headcount', 'Share', 'Attendance', 'Leave Days'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {isLoading ? (
                  [0,1,2,3,4].map(i => (
                    <tr key={i}>
                      {[0,1,2,3,4].map(j => (
                        <td key={j} className="px-4 py-3"><div className="h-3 w-14 animate-pulse rounded bg-wash" /></td>
                      ))}
                    </tr>
                  ))
                ) : data?.departments.map(row => (
                  <tr key={row.department} className="hover:bg-wash/30 transition-colors text-[13px] text-ink">
                    <td className="px-4 py-3 font-semibold flex items-center gap-2">
                      <span className={`size-2 rounded-full inline-block ${getDeptColor(row.department)}`} />
                      {row.department}
                    </td>
                    <td className="tnum px-4 py-3 font-medium">{row.headcount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-14 rounded-full bg-wash overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${row.share}%` }}
                            transition={{ duration: 0.7 }}
                            className={`h-full rounded-full ${getDeptColor(row.department)}`}
                          />
                        </div>
                        <span className="tnum text-[11px] text-muted font-semibold">{row.share}%</span>
                      </div>
                    </td>
                    <td className="tnum px-4 py-3 text-muted font-medium">{row.attendanceRate}%</td>
                    <td className="tnum px-4 py-3 text-muted font-medium">{row.leaveDaysTaken}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Headcount trend bar chart */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-ink">Headcount Trend</h2>
            <p className="text-[12px] text-muted mt-0.5">Last 6 months</p>
            {isLoading ? (
              <div className="mt-6 flex h-36 items-end gap-2">
                {[0,1,2,3,4,5].map(i => <div key={i} className="flex-1 animate-pulse rounded-t bg-wash" style={{ height: `${40 + i * 10}%` }} />)}
              </div>
            ) : (
              <>
                <div className="mt-6 flex h-36 items-end gap-2">
                  {data?.headcountByMonth.map((m, i) => {
                    const colors = ['bg-indigo-400','bg-sky-400','bg-teal-400','bg-emerald-500','bg-pine','bg-emerald-700']
                    return (
                      <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                        <span className="tnum text-[10px] font-bold text-ink">{m.value}</span>
                        <div className="w-full relative bg-wash rounded-t h-full overflow-hidden">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(m.value / maxHC) * 100}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                            className={`absolute bottom-0 w-full rounded-t ${colors[i] || 'bg-pine'}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 mt-2 pt-2 border-t border-hairline">
                  {data?.headcountByMonth.map(m => (
                    <span key={m.label} className="flex-1 text-center text-[10px] text-muted font-bold">{m.label}</span>
                  ))}
                </div>
              </>
            )}
          </div>
          {!isLoading && data && (
            <div className="mt-4 bg-pine-tint/40 border border-pine/15 rounded p-2.5 text-[11.5px] text-pine-deep leading-relaxed">
              <strong>Trend:</strong> Headcount grew from <strong>{data.headcountByMonth[0]?.value}</strong> to <strong>{data.headcountByMonth[data.headcountByMonth.length - 1]?.value}</strong> over 6 months.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ─── Section: Employees ───────────────────────────────────────────────────────
function EmployeesSection({ data, isLoading }: { data: ReportsData | null; isLoading: boolean }) {
  const mockEmpTypes = [
    { type: 'Full-time', count: 28, pct: 70 },
    { type: 'Part-time', count: 6, pct: 15 },
    { type: 'Contract', count: 4, pct: 10 },
    { type: 'Intern', count: 2, pct: 5 },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={Users}       label="Total Employees"  value={String(data?.activeCount ?? 0)} hint="active headcount"      color="teal" />
            <StatCard icon={TrendingDown} label="Attrition Rate"  value={`${data?.attritionRate ?? 0}%`} hint="last 12 months"       color="rose" />
            <StatCard icon={UserCheck}   label="New Hires (MTD)"  value="4"                              hint="this month"            color="emerald" trend="up" />
            <StatCard icon={TrendingUp}  label="Retention Rate"   value={`${100 - (data?.attritionRate ?? 0)}%`} hint="inverse of attrition" color="indigo" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Dept breakdown */}
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Headcount by Department</h2>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? [0,1,2,3,4].map(i => <div key={i} className="h-8 animate-pulse rounded bg-wash" />) :
              data?.departments.map(row => (
                <div key={row.department}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                      <span className={`size-2 rounded-full ${getDeptColor(row.department)}`} />
                      {row.department}
                    </span>
                    <span className="tnum text-[12px] text-muted font-bold">{row.headcount} ({row.share}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-wash overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.share}%` }}
                      transition={{ duration: 0.7 }}
                      className={`h-full rounded-full ${getDeptColor(row.department)}`}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </Card>

        {/* Employment type */}
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Employment Type Breakdown</h2>
          </div>
          <div className="p-4 space-y-3">
            {mockEmpTypes.map(row => (
              <div key={row.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold text-ink">{row.type}</span>
                  <span className="tnum text-[12px] text-muted font-bold">{row.count} ({row.pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-wash overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.7 }}
                    className="h-full rounded-full bg-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Section: Attendance ──────────────────────────────────────────────────────
function AttendanceSection({ data, isLoading }: { data: ReportsData | null; isLoading: boolean }) {
  const mockWeekly = [
    { day: 'Mon', rate: 96 }, { day: 'Tue', rate: 94 }, { day: 'Wed', rate: 91 },
    { day: 'Thu', rate: 88 }, { day: 'Fri', rate: 82 },
  ]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={Clock}        label="Avg Attendance"    value={`${data?.avgAttendance ?? 0}%`}  hint="company-wide, this month"    color="emerald" trend="up" />
            <StatCard icon={XCircle}      label="Absent Today"      value="3"                               hint="without leave"               color="rose" />
            <StatCard icon={Timer}        label="Late Check-ins"    value="7"                               hint="after 9:30 AM this week"     color="amber" />
            <StatCard icon={CheckCircle2} label="Perfect Attendance" value="18"                             hint="employees this month"        color="teal" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly pattern */}
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Weekly Attendance Pattern</h2>
            <p className="text-[11.5px] text-muted mt-0.5">Average attendance rate by day of week</p>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-3 h-36">
              {mockWeekly.map(d => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="tnum text-[11px] font-bold text-ink">{d.rate}%</span>
                  <div className="w-full relative bg-wash rounded-t h-full overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${d.rate}%` }}
                      transition={{ duration: 0.7 }}
                      className={`absolute bottom-0 w-full rounded-t ${d.rate >= 90 ? 'bg-emerald-500' : d.rate >= 85 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-hairline">
              {mockWeekly.map(d => (
                <span key={d.day} className="flex-1 text-center text-[11px] text-muted font-bold">{d.day}</span>
              ))}
            </div>
          </div>
        </Card>

        {/* Dept attendance */}
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Attendance by Department</h2>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? [0,1,2,3].map(i => <div key={i} className="h-8 animate-pulse rounded bg-wash" />) :
              data?.departments.map(row => (
                <div key={row.department}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[13px] font-semibold text-ink">{row.department}</span>
                    <span className={`tnum text-[12px] font-bold ${row.attendanceRate >= 90 ? 'text-emerald-600' : row.attendanceRate >= 80 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {row.attendanceRate}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-wash overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.attendanceRate}%` }}
                      transition={{ duration: 0.7 }}
                      className={`h-full rounded-full ${row.attendanceRate >= 90 ? 'bg-emerald-500' : row.attendanceRate >= 80 ? 'bg-amber-400' : 'bg-rose-400'}`}
                    />
                  </div>
                </div>
              ))
            }
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Section: Leave ───────────────────────────────────────────────────────────
function LeaveSection({ data, isLoading }: { data: ReportsData | null; isLoading: boolean }) {
  const leaveTypes = [
    { type: 'Annual Leave',   days: 48, color: 'bg-teal-500' },
    { type: 'Sick Leave',     days: 22, color: 'bg-rose-400' },
    { type: 'Personal Leave', days: 14, color: 'bg-amber-400' },
    { type: 'Unpaid Leave',   days: 6,  color: 'bg-gray-400' },
  ]
  const totalDays = leaveTypes.reduce((s, l) => s + l.days, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={CalendarDays} label="Total Leave Taken"   value={String(data?.leaveDaysTaken ?? 0)} hint="approved days, this year"  color="teal" />
            <StatCard icon={CheckCircle2} label="Pending Approvals"   value="5"                                 hint="awaiting manager action"   color="amber" />
            <StatCard icon={XCircle}      label="Rejected Requests"   value="3"                                 hint="this month"                color="rose" />
            <StatCard icon={Users}        label="On Leave Today"       value="2"                                 hint="out of office"             color="violet" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leave type breakdown */}
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Leave by Type</h2>
          </div>
          <div className="p-4 space-y-3">
            {leaveTypes.map(l => (
              <div key={l.type}>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px] font-semibold text-ink">{l.type}</span>
                  <span className="tnum text-[12px] text-muted font-bold">{l.days} days ({Math.round(l.days / totalDays * 100)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-wash overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(l.days / totalDays) * 100}%` }}
                    transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${l.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leave by dept */}
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Leave Days by Department</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-wash">
                  {['Department', 'Leave Days', 'Per Person'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {isLoading ? [0,1,2,3].map(i => (
                  <tr key={i}>{[0,1,2].map(j => <td key={j} className="px-4 py-3"><div className="h-3 w-14 animate-pulse rounded bg-wash" /></td>)}</tr>
                )) : data?.departments.map(row => (
                  <tr key={row.department} className="hover:bg-wash/30 transition-colors text-[13px]">
                    <td className="px-4 py-3 font-semibold flex items-center gap-2">
                      <span className={`size-2 rounded-full ${getDeptColor(row.department)}`} />
                      {row.department}
                    </td>
                    <td className="tnum px-4 py-3 text-muted font-medium">{row.leaveDaysTaken}</td>
                    <td className="tnum px-4 py-3 text-muted font-medium">
                      {row.headcount > 0 ? (row.leaveDaysTaken / row.headcount).toFixed(1) : '0'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Section: Payroll ─────────────────────────────────────────────────────────
function PayrollSection({ data, isLoading }: { data: ReportsData | null; isLoading: boolean }) {
  const mockPayrollMonths = [
    { month: 'May', gross: 4280000, net: 3840000 },
    { month: 'Jun', gross: 4310000, net: 3870000 },
    { month: 'Jul', gross: 4290000, net: 3855000 },
    { month: 'Aug', gross: 4350000, net: 3910000 },
    { month: 'Sep', gross: 4380000, net: 3935000 },
    { month: 'Oct', gross: 4420000, net: 3965000 },
  ]
  const maxGross = Math.max(...mockPayrollMonths.map(m => m.gross))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={Banknote}    label="Gross Payroll"     value={formatMoneyCompact(data?.payrollCost ?? 4420000)} hint="current month"                color="indigo" />
            <StatCard icon={TrendingUp}  label="YoY Change"        value="+8.4%"                                            hint="vs last year same month"     color="emerald" trend="up" />
            <StatCard icon={Users}       label="Employees Paid"    value={String(data?.activeCount ?? 0)}                   hint="in latest payroll run"       color="teal" />
            <StatCard icon={Banknote}    label="Avg Salary"        value={formatMoneyCompact(Math.round((data?.payrollCost ?? 4420000) / (data?.activeCount || 1)))} hint="per employee, gross" color="violet" />
          </>
        )}
      </div>

      <Card flush>
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-[13px] font-semibold text-ink">Payroll Cost Trend (6 Months)</h2>
        </div>
        <div className="p-4">
          <div className="flex items-end gap-3 h-40">
            {mockPayrollMonths.map((m, i) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="tnum text-[10px] font-bold text-ink">{formatMoneyCompact(m.gross)}</span>
                <div className="w-full relative bg-wash rounded-t h-full overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(m.gross / maxGross) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.05 }}
                    className="absolute bottom-0 w-full rounded-t bg-indigo-500 hover:bg-indigo-600 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2 pt-2 border-t border-hairline">
            {mockPayrollMonths.map(m => (
              <span key={m.month} className="flex-1 text-center text-[11px] text-muted font-bold">{m.month}</span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}

// ─── Section: Recruitment ─────────────────────────────────────────────────────
function RecruitmentSection({ isLoading }: { isLoading: boolean }) {
  const pipeline = [
    { stage: 'Applied',   count: 42, color: 'bg-sky-400' },
    { stage: 'Screened',  count: 28, color: 'bg-blue-500' },
    { stage: 'Interview', count: 14, color: 'bg-violet-500' },
    { stage: 'Offered',   count: 5,  color: 'bg-amber-500' },
    { stage: 'Hired',     count: 3,  color: 'bg-emerald-500' },
    { stage: 'Rejected',  count: 12, color: 'bg-rose-400' },
  ]
  const maxCount = Math.max(...pipeline.map(p => p.count))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={Briefcase}   label="Open Positions"    value="8"   hint="actively hiring"          color="sky" />
            <StatCard icon={Users}       label="Total Applicants"  value="42"  hint="this month"               color="violet" trend="up" />
            <StatCard icon={CheckCircle2} label="Hired (MTD)"      value="3"   hint="offers accepted"          color="emerald" />
            <StatCard icon={TrendingDown} label="Time to Hire"     value="18d" hint="avg days to fill a role"  color="amber" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Hiring Pipeline</h2>
            <p className="text-[11.5px] text-muted mt-0.5">Candidates by stage, this month</p>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-3 h-36">
              {pipeline.map((s, i) => (
                <div key={s.stage} className="flex-1 flex flex-col items-center gap-1">
                  <span className="tnum text-[11px] font-bold text-ink">{s.count}</span>
                  <div className="w-full relative bg-wash rounded-t h-full overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(s.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.7, delay: i * 0.05 }}
                      className={`absolute bottom-0 w-full rounded-t ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2 pt-2 border-t border-hairline">
              {pipeline.map(s => (
                <span key={s.stage} className="flex-1 text-center text-[9px] text-muted font-bold leading-tight">{s.stage}</span>
              ))}
            </div>
          </div>
        </Card>

        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Open Roles by Department</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-wash">
                  {['Department', 'Open Roles', 'Applicants', 'Avg Days Open'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-[13px]">
                {[
                  { dept: 'Engineering', open: 3, applicants: 18, days: 22 },
                  { dept: 'Sales',       open: 2, applicants: 12, days: 14 },
                  { dept: 'Product',     open: 1, applicants: 7,  days: 9 },
                  { dept: 'HR',          open: 1, applicants: 5,  days: 18 },
                  { dept: 'Design',      open: 1, applicants: 9,  days: 11 },
                ].map(row => (
                  <tr key={row.dept} className="hover:bg-wash/30 transition-colors">
                    <td className="px-4 py-3 font-semibold flex items-center gap-2">
                      <span className={`size-2 rounded-full ${getDeptColor(row.dept)}`} />
                      {row.dept}
                    </td>
                    <td className="tnum px-4 py-3 text-muted font-medium">{row.open}</td>
                    <td className="tnum px-4 py-3 text-muted font-medium">{row.applicants}</td>
                    <td className="tnum px-4 py-3 text-muted font-medium">{row.days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Section: Performance ─────────────────────────────────────────────────────
function PerformanceSection({ isLoading }: { isLoading: boolean }) {
  const ratings = [
    { label: 'Exceptional (5)', count: 4,  color: 'bg-emerald-500' },
    { label: 'Exceeds (4)',     count: 12, color: 'bg-teal-500' },
    { label: 'Meets (3)',       count: 18, color: 'bg-sky-500' },
    { label: 'Below (2)',       count: 4,  color: 'bg-amber-400' },
    { label: 'Poor (1)',        count: 2,  color: 'bg-rose-400' },
  ]
  const totalRated = ratings.reduce((s, r) => s + r.count, 0)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? [0,1,2,3].map(i => <SkeletonCard key={i} />) : (
          <>
            <StatCard icon={Target}      label="Avg Performance"   value="3.6"  hint="out of 5, current cycle"  color="emerald" />
            <StatCard icon={CheckCircle2} label="Reviews Done"     value="40"   hint={`of ${totalRated} total`} color="teal" />
            <StatCard icon={Clock}       label="Pending Reviews"   value="7"    hint="awaiting submission"       color="amber" />
            <StatCard icon={TrendingUp}  label="Goals Completed"   value="62%"  hint="this appraisal cycle"     color="violet" trend="up" />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Rating Distribution</h2>
            <p className="text-[11.5px] text-muted mt-0.5">Current appraisal cycle</p>
          </div>
          <div className="p-4 space-y-3">
            {ratings.map(r => (
              <div key={r.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[13px] font-semibold text-ink">{r.label}</span>
                  <span className="tnum text-[12px] text-muted font-bold">{r.count} ({Math.round(r.count / totalRated * 100)}%)</span>
                </div>
                <div className="h-2 rounded-full bg-wash overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.count / totalRated) * 100}%` }}
                    transition={{ duration: 0.7 }}
                    className={`h-full rounded-full ${r.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card flush>
          <div className="border-b border-hairline px-4 py-3">
            <h2 className="text-[13px] font-semibold text-ink">Performance by Department</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hairline bg-wash">
                  {['Department', 'Avg Rating', 'Reviewed', 'Pending'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-[13px]">
                {[
                  { dept: 'Engineering', avg: 3.8, reviewed: 12, pending: 2 },
                  { dept: 'Sales',       avg: 3.5, reviewed: 8,  pending: 1 },
                  { dept: 'Product',     avg: 4.1, reviewed: 5,  pending: 0 },
                  { dept: 'HR',          avg: 3.9, reviewed: 4,  pending: 1 },
                  { dept: 'Marketing',   avg: 3.6, reviewed: 6,  pending: 2 },
                  { dept: 'Design',      avg: 4.0, reviewed: 5,  pending: 1 },
                ].map(row => (
                  <tr key={row.dept} className="hover:bg-wash/30 transition-colors">
                    <td className="px-4 py-3 font-semibold flex items-center gap-2">
                      <span className={`size-2 rounded-full ${getDeptColor(row.dept)}`} />
                      {row.dept}
                    </td>
                    <td className="tnum px-4 py-3 font-bold text-ink">{row.avg}</td>
                    <td className="tnum px-4 py-3 text-muted">{row.reviewed}</td>
                    <td className="tnum px-4 py-3 text-muted">{row.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Main ReportsPage ─────────────────────────────────────────────────────────
export default function ReportsPage() {
  const user = useAuthStore((s) => s.user)!
  const permissions = user.permissions ?? []

  const [data, setData] = useState<ReportsData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    void reportsService
      .get(permissions)
      .then((result) => { if (!cancelled) { setData(result); setStatus('ready') } })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleExport = async () => {
    setExporting(true)
    setExportError(null)
    try { await reportsService.exportCsv() }
    catch { setExportError('We could not export your reports.') }
    finally { setExporting(false) }
  }

  const isLoading = status === 'loading' || !data

  // Filter tabs based on permissions
  const visibleTabs = TABS.filter(tab =>
    !tab.permission || hasPermission(permissions, tab.permission) || permissions.includes('*')
  )

  // Reset to overview if current tab becomes invisible
  const currentTab = visibleTabs.find(t => t.key === activeTab) ? activeTab : 'overview'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              HR Reports & Analytics
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">
            Workforce insights — headcount, attendance, leave, payroll, recruitment & performance.
          </p>
        </div>
        <Button onClick={() => void handleExport()} disabled={exporting || isLoading} className="font-bold shadow-sm">
          {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          Export CSV
        </Button>
      </div>

      {exportError && (
        <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-3.5">
          <AlertCircle size={16} className="mt-px shrink-0 text-clay" />
          <p className="text-[13px] font-medium text-clay">{exportError}</p>
        </Card>
      )}

      {status === 'error' && (
        <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <p className="text-[14px] font-medium text-clay">We could not build your reports.</p>
        </Card>
      )}

      {status !== 'error' && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-hairline overflow-x-auto scrollbar-hide">
            {visibleTabs.map(tab => {
              const Icon = tab.icon
              const active = currentTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'border-pine text-ink'
                      : 'border-transparent text-muted hover:text-ink hover:border-hairline'
                  }`}
                >
                  <Icon size={13} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {currentTab === 'overview'     && <OverviewSection     data={data} isLoading={isLoading} onExport={handleExport} exporting={exporting} permissions={permissions} />}
            {currentTab === 'employees'   && <EmployeesSection    data={data} isLoading={isLoading} />}
            {currentTab === 'attendance'  && <AttendanceSection   data={data} isLoading={isLoading} />}
            {currentTab === 'leave'       && <LeaveSection        data={data} isLoading={isLoading} />}
            {currentTab === 'payroll'     && <PayrollSection      data={data} isLoading={isLoading} />}
            {currentTab === 'recruitment' && <RecruitmentSection  isLoading={isLoading} />}
            {currentTab === 'performance' && <PerformanceSection  isLoading={isLoading} />}
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
