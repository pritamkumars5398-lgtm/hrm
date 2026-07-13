import { useEffect, useState } from 'react'
import { AlertCircle, Banknote, Download, Receipt, TrendingDown, Users } from 'lucide-react'
import Card from '@/shared/components/Card'
import Badge from '@/shared/components/Badge'
import Drawer from '@/shared/components/Drawer'
import { useAuthStore } from '@/features/auth/store/authStore'
import {
  formatMoney,
  formatMoneyCompact,
  type Payslip,
} from '@/services/payrollService'
import { usePayrollStore } from './store/payrollStore'

const formatPeriod = (period: string) =>
  new Date(`${period}-01T00:00:00`).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

const STATUS_TONE = { PAID: 'success', READY: 'warning', DRAFT: 'neutral' } as const
const STATUS_LABEL = { PAID: 'Paid', READY: 'Ready to review', DRAFT: 'Draft' } as const

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
      {hint && <p className="tnum mt-2 text-[12px] text-muted">{hint}</p>}
    </Card>
  )
}

function PayslipDrawer({ slip, onClose }: { slip: Payslip | null; onClose: () => void }) {
  return (
    <Drawer
      open={slip !== null}
      onClose={onClose}
      title={slip ? `${slip.employeeName}` : 'Payslip'}
      subtitle={slip ? `${slip.designation} · ${formatPeriod(slip.period)}` : undefined}
    >
      {slip && (
        <div>
          <section>
            <h3 className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Earnings
            </h3>
            <dl>
              {slip.earnings.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between border-b border-hairline py-2.5 text-[13px]"
                >
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="tnum font-medium">{formatMoney(line.amount)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5 text-[13px]">
                <dt className="font-medium">Gross pay</dt>
                <dd className="tnum font-semibold">{formatMoney(slip.gross)}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-6">
            <h3 className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Deductions
            </h3>
            <dl>
              {slip.deductions.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between border-b border-hairline py-2.5 text-[13px]"
                >
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="tnum font-medium text-clay">−{formatMoney(line.amount)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between py-2.5 text-[13px]">
                <dt className="font-medium">Total deductions</dt>
                <dd className="tnum font-semibold text-clay">
                  −{formatMoney(slip.totalDeductions)}
                </dd>
              </div>
            </dl>
          </section>

          <div className="mt-6 flex items-center justify-between rounded-card border border-pine bg-pine-tint px-4 py-3.5">
            <p className="text-[13px] font-medium text-pine-deep">Net pay</p>
            <p className="tnum font-display text-[22px] font-semibold text-pine-deep">
              {formatMoney(slip.net)}
            </p>
          </div>

          <button
            type="button"
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-ctl border border-hairline-strong bg-surface text-[13.5px] font-medium transition-colors hover:border-pine hover:text-pine"
          >
            <Download size={15} />
            Download payslip (PDF)
          </button>
          <p className="mt-2 text-center text-[11.5px] text-muted">
            Export is UI-only in this phase.
          </p>
        </div>
      )}
    </Drawer>
  )
}

export default function PayrollPage() {
  const user = useAuthStore((s) => s.user)!
  const { status, data, error, load, selectPeriod } = usePayrollStore()
  const [openSlip, setOpenSlip] = useState<Payslip | null>(null)

  useEffect(() => {
    void load(user.role)
  }, [load, user.role])

  const isLoading = status === 'loading'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Payroll
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Salary components, deductions and payslips for each run.
          </p>
        </div>

        {data && (
          <select
            value={data.selected.period}
            onChange={(e) => void selectPeriod(user.role, e.target.value)}
            aria-label="Payroll period"
            className="h-10 rounded-ctl border border-hairline-strong bg-surface px-3 text-[14px] transition-colors hover:border-muted/50 focus:border-pine"
          >
            {data.runs.map((run) => (
              <option key={run.id} value={run.period}>
                {formatPeriod(run.period)}
              </option>
            ))}
          </select>
        )}
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
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
        </Card>
      )}

      {status !== 'error' && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading || !data ? (
              [0, 1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-wash" />
                  <div className="mt-3 h-6 w-24 animate-pulse rounded bg-wash" />
                </Card>
              ))
            ) : (
              <>
                <StatCard
                  icon={Banknote}
                  label="Gross"
                  value={formatMoneyCompact(data.selected.gross)}
                  hint={`${data.selected.headcount} employees`}
                />
                <StatCard
                  icon={TrendingDown}
                  label="Deductions"
                  value={formatMoneyCompact(data.selected.deductions)}
                  hint="tax, NI and pension"
                />
                <StatCard
                  icon={Receipt}
                  label="Net pay"
                  value={formatMoneyCompact(data.selected.net)}
                  hint="what lands in accounts"
                />
                <StatCard
                  icon={Users}
                  label="Status"
                  value={data.selected.status === 'PAID' ? 'Paid' : 'Ready'}
                  hint={
                    data.selected.paidOn
                      ? `paid ${new Date(data.selected.paidOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                      : 'awaiting approval'
                  }
                />
              </>
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Payslips */}
            <Card flush className="lg:col-span-2">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold">
                  Payslips
                  {data && (
                    <span className="tnum ml-1.5 font-normal text-muted">
                      {data.payslips.length}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:text-pine-deep"
                >
                  <Download size={13} />
                  Export
                </button>
              </div>

              {isLoading || !data ? (
                <ul>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 border-b border-hairline px-4 py-3 last:border-0"
                    >
                      <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
                      <div className="flex-1">
                        <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
                        <div className="mt-1.5 h-3 w-20 animate-pulse rounded bg-wash" />
                      </div>
                      <div className="h-4 w-16 animate-pulse rounded bg-wash" />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="max-h-[32rem] overflow-y-auto">
                  {data.payslips.map((slip) => (
                    <li key={slip.id}>
                      <button
                        type="button"
                        onClick={() => setOpenSlip(slip)}
                        className="flex w-full items-center gap-3 border-b border-hairline px-4 py-3 text-left transition-colors last:border-0 hover:bg-wash"
                      >
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-wash text-[11px] font-semibold text-muted">
                          {slip.avatarInitials}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13.5px] font-medium">{slip.employeeName}</p>
                          <p className="truncate text-[12px] text-muted">{slip.department}</p>
                        </div>

                        <div className="text-right">
                          <p className="tnum text-[13px] font-semibold">{formatMoney(slip.net)}</p>
                          <p className="tnum text-[11.5px] text-muted">
                            gross {formatMoney(slip.gross)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* History */}
            <Card flush>
              <div className="border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold">Payroll history</h2>
              </div>

              {isLoading || !data ? (
                <ul>
                  {[0, 1, 2].map((i) => (
                    <li key={i} className="border-b border-hairline px-4 py-3 last:border-0">
                      <div className="h-3.5 w-24 animate-pulse rounded bg-wash" />
                      <div className="mt-2 h-3 w-20 animate-pulse rounded bg-wash" />
                    </li>
                  ))}
                </ul>
              ) : (
                <ul>
                  {data.runs.map((run) => (
                    <li key={run.id}>
                      <button
                        type="button"
                        onClick={() => void selectPeriod(user.role, run.period)}
                        className={`flex w-full items-center justify-between gap-3 border-b border-hairline px-4 py-3 text-left transition-colors last:border-0 hover:bg-wash ${
                          run.period === data.selected.period ? 'bg-pine-tint/40' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">
                            {formatPeriod(run.period)}
                          </p>
                          <p className="tnum mt-0.5 text-[11.5px] text-muted">
                            {formatMoneyCompact(run.net)} net
                          </p>
                        </div>
                        <Badge tone={STATUS_TONE[run.status]}>{STATUS_LABEL[run.status]}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}

      <PayslipDrawer slip={openSlip} onClose={() => setOpenSlip(null)} />
    </div>
  )
}
