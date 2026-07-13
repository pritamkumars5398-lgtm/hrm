import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  Clock,
  Download,
  TrendingDown,
  Users,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import { useAuthStore } from '@/features/auth/store/authStore'
import { reportsService, type ReportsData } from '@/services/reportsService'
import { formatMoneyCompact } from '@/services/payrollService'

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
      <p className="tnum font-display mt-2 text-[24px] leading-none font-semibold">{value}</p>
      {hint && <p className="mt-2 text-[12px] text-muted">{hint}</p>}
    </Card>
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
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Reports
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Headcount, attendance, leave and cost — across the company.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-ctl border border-hairline-strong bg-surface px-4 text-[13.5px] font-medium transition-colors hover:border-pine hover:text-pine"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <p className="text-[14px] font-medium text-clay">We could not build your reports.</p>
        </Card>
      )}

      {status !== 'error' && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading ? (
              [0, 1, 2, 3].map((i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={Users}
                  label="Headcount"
                  value={String(data.activeCount)}
                  hint={`${data.headcount} on record`}
                />
                <StatCard
                  icon={TrendingDown}
                  label="Attrition"
                  value={`${data.attritionRate}%`}
                  hint="leavers and notice periods"
                />
                <StatCard
                  icon={Clock}
                  label="Attendance"
                  value={`${data.avgAttendance}%`}
                  hint="this month, company-wide"
                />
                {/* HR runs every report except the one that reveals pay (§10). */}
                {data.payrollCost !== null ? (
                  <StatCard
                    icon={Banknote}
                    label="Payroll cost"
                    value={formatMoneyCompact(data.payrollCost)}
                    hint="gross, latest run"
                  />
                ) : (
                  <StatCard
                    icon={CalendarDays}
                    label="Leave taken"
                    value={String(data.leaveDaysTaken)}
                    hint="approved days, this year"
                  />
                )}
              </>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Departments */}
            <Card flush className="lg:col-span-2">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold">Department statistics</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:text-pine-deep"
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
                            className="px-4 py-2.5 text-left text-[12px] font-semibold text-muted"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
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
                      : data.departments.map((row) => (
                          <tr
                            key={row.department}
                            className="border-b border-hairline last:border-0"
                          >
                            <td className="px-4 py-3 text-[13px] font-medium">
                              {row.department}
                            </td>
                            <td className="tnum px-4 py-3 text-[13px]">{row.headcount}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-14 overflow-hidden rounded-full bg-wash">
                                  <div
                                    className="h-full rounded-full bg-pine"
                                    style={{ width: `${row.share}%` }}
                                  />
                                </div>
                                <span className="tnum text-[12px] text-muted">{row.share}%</span>
                              </div>
                            </td>
                            <td className="tnum px-4 py-3 text-[13px] text-muted">
                              {row.attendanceRate}%
                            </td>
                            <td className="tnum px-4 py-3 text-[13px] text-muted">
                              {row.leaveDaysTaken}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Headcount trend */}
            <Card className="p-5">
              <h2 className="text-[13px] font-semibold">Headcount trend</h2>
              <p className="mt-1 text-[12px] text-muted">Last six months</p>

              {isLoading ? (
                <div className="mt-6 flex h-40 items-end gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex-1 animate-pulse rounded-t bg-wash" style={{ height: `${40 + i * 8}%` }} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="mt-6 flex h-40 items-end gap-2">
                    {data.headcountByMonth.map((month, i) => (
                      <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                        <span className="tnum text-[11px] font-medium text-muted">
                          {month.value}
                        </span>
                        <div
                          className="w-full rounded-t-[3px] bg-pine"
                          style={{
                            height: `${(month.value / maxHeadcount) * 100}%`,
                            opacity: 0.4 + (i / data.headcountByMonth.length) * 0.6,
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex gap-2 border-t border-hairline pt-2">
                    {data.headcountByMonth.map((month) => (
                      <span
                        key={month.label}
                        className="flex-1 text-center text-[11px] text-muted"
                      >
                        {month.label}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>

          <p className="mt-4 text-[12px] text-muted">Export buttons are UI-only in this phase.</p>
        </>
      )}
    </div>
  )
}
