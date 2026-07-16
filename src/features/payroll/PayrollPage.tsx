import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Banknote,
  Download,
  Receipt,
  TrendingDown,
  Users,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
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

const getAvatarTheme = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const themes = [
    { bg: 'bg-pine-tint text-pine-deep border-pine/20' },
    { bg: 'bg-clay-tint text-clay-deep border-clay/20' },
    { bg: 'bg-ochre-tint text-ochre-deep border-ochre/20' },
    { bg: 'bg-wash text-ink border-hairline-strong' },
  ]
  return themes[hash % themes.length]
}

type StatCardType = 'gross' | 'deductions' | 'net' | 'status'

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
    gross: {
      bg: 'bg-pine-tint text-pine',
      glow: 'hover:shadow-[0_0_15px_rgba(31,77,63,0.06)]',
      border: 'hover:border-pine/30',
    },
    deductions: {
      bg: 'bg-clay-tint text-clay',
      glow: 'hover:shadow-[0_0_15px_rgba(156,66,33,0.06)]',
      border: 'hover:border-clay/30',
    },
    net: {
      bg: 'bg-pine-tint text-pine-deep',
      glow: 'hover:shadow-[0_0_15px_rgba(31,77,63,0.06)]',
      border: 'hover:border-pine/30',
    },
    status: {
      bg: value === 'Paid' ? 'bg-pine-tint text-pine-deep' : 'bg-ochre-tint text-ochre-deep',
      glow: 'hover:shadow-[0_0_15px_rgba(169,121,28,0.06)]',
      border: 'hover:border-ochre/30',
    },
  }[type]

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={`p-4 h-full flex flex-col justify-between transition-all duration-300 border border-hairline ${configs.glow} ${configs.border}`}>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted">{label}</p>
            <span className={`inline-flex p-1.5 rounded-ctl ${configs.bg}`}>
              <Icon size={14} aria-hidden="true" />
            </span>
          </div>
          <p className="tnum font-display mt-3 text-[26px] leading-none font-bold text-ink">{value}</p>
        </div>
        {hint && <p className="tnum mt-3 text-[11.5px] text-muted font-medium">{hint}</p>}
      </Card>
    </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Voucher Header Info */}
          <div className="bg-wash/40 border border-hairline p-3 rounded-ctl text-[12.5px] text-muted space-y-1.5">
            <div className="flex justify-between">
              <span>Department:</span>
              <span className="font-semibold text-ink">{slip.department}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax Period:</span>
              <span className="font-semibold text-ink tnum">{formatPeriod(slip.period)}</span>
            </div>
            <div className="flex justify-between">
              <span>Voucher ID:</span>
              <span className="font-semibold text-ink tnum">{slip.id}</span>
            </div>
          </div>

          {/* Earnings Box */}
          <section className="bg-surface border border-hairline rounded-ctl p-3.5 space-y-3">
            <h3 className="text-[11px] font-bold tracking-[0.12em] text-muted uppercase border-b border-hairline pb-1.5 flex justify-between items-center">
              <span>Earnings</span>
              <span className="text-[10px] text-pine font-medium bg-pine-tint px-1.5 py-0.2 rounded-full lowercase">credits</span>
            </h3>
            <dl className="space-y-2">
              {slip.earnings.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between text-[13px]"
                >
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="tnum font-medium text-ink">{formatMoney(line.amount)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-hairline/60 pt-2 text-[13px]">
                <dt className="font-bold text-ink">Gross Pay</dt>
                <dd className="tnum font-bold text-ink">{formatMoney(slip.gross)}</dd>
              </div>
            </dl>
          </section>

          {/* Deductions Box */}
          <section className="bg-clay-tint/10 border border-clay/10 rounded-ctl p-3.5 space-y-3">
            <h3 className="text-[11px] font-bold tracking-[0.12em] text-clay uppercase border-b border-clay/15 pb-1.5 flex justify-between items-center">
              <span>Deductions</span>
              <span className="text-[10px] text-clay font-medium bg-clay-tint px-1.5 py-0.2 rounded-full lowercase">debits</span>
            </h3>
            <dl className="space-y-2">
              {slip.deductions.map((line) => (
                <div
                  key={line.label}
                  className="flex items-center justify-between text-[13px]"
                >
                  <dt className="text-muted">{line.label}</dt>
                  <dd className="tnum font-medium text-clay-deep">−{formatMoney(line.amount)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-clay/15 pt-2 text-[13px]">
                <dt className="font-semibold text-clay-deep">Total Deductions</dt>
                <dd className="tnum font-bold text-clay-deep">
                  −{formatMoney(slip.totalDeductions)}
                </dd>
              </div>
            </dl>
          </section>

          {/* Ticket Voucher Net Pay */}
          <div className="relative py-4 px-4 my-6 bg-pine-tint/65 border-t border-b border-dashed border-pine/40 flex items-center justify-between overflow-hidden">
            {/* Circle cutouts for ticket style */}
            <span className="absolute -left-2 top-[calc(50%-6px)] size-3 rounded-full bg-surface border border-hairline" />
            <span className="absolute -right-2 top-[calc(50%-6px)] size-3 rounded-full bg-surface border border-hairline" />
            
            <div>
              <p className="text-[12px] font-bold text-pine uppercase tracking-wider">Net Take-Home</p>
              <p className="text-[11px] text-pine/70 mt-0.5">Deposited directly to bank account</p>
            </div>
            <p className="tnum font-display text-[26px] font-extrabold text-pine-deep leading-none">
              {formatMoney(slip.net)}
            </p>
          </div>

          <Button
            className="w-full font-bold shadow-sm"
          >
            <Download size={15} />
            Download payslip (PDF)
          </Button>
          <p className="text-center text-[11px] text-muted font-medium">
            Export is UI-only in this phase.
          </p>
        </motion.div>
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
              Payroll
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">
            Salary components, deductions and payslips for each run.
          </p>
        </div>

        {data && (
          <select
            value={data.selected.period}
            onChange={(e) => void selectPeriod(user.role, e.target.value)}
            aria-label="Payroll period"
            className="h-10 rounded-ctl border border-hairline-strong bg-surface px-3 text-[14px] font-medium transition-colors hover:border-muted/50 focus:border-pine cursor-pointer focus:outline-none"
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  type="gross"
                  icon={Banknote}
                  label="Gross"
                  value={formatMoneyCompact(data.selected.gross)}
                  hint={`${data.selected.headcount} employees`}
                />
                <StatCard
                  type="deductions"
                  icon={TrendingDown}
                  label="Deductions"
                  value={formatMoneyCompact(data.selected.deductions)}
                  hint="tax, NI and pension"
                />
                <StatCard
                  type="net"
                  icon={Receipt}
                  label="Net pay"
                  value={formatMoneyCompact(data.selected.net)}
                  hint="what lands in accounts"
                />
                <StatCard
                  type="status"
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

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Payslips */}
            <Card flush className="lg:col-span-2">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold text-ink">
                  Payslips
                  {data && (
                    <span className="tnum ml-1.5 font-normal text-muted">
                      {data.payslips.length}
                    </span>
                  )}
                </h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:text-pine-deep cursor-pointer"
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
                <ul className="max-h-[32rem] overflow-y-auto divide-y divide-hairline">
                  <AnimatePresence initial={false}>
                    {data.payslips.map((slip) => {
                      const avatarTheme = getAvatarTheme(slip.employeeName)
                      return (
                        <motion.li
                          key={slip.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenSlip(slip)}
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-wash/50 cursor-pointer"
                          >
                            <span className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${avatarTheme.bg}`}>
                              {slip.avatarInitials}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13.5px] font-medium text-ink">{slip.employeeName}</p>
                              <p className="truncate text-[12px] text-muted">{slip.department} · {slip.designation}</p>
                            </div>

                            <div className="text-right">
                              <p className="tnum text-[13.5px] font-bold text-ink">{formatMoney(slip.net)}</p>
                              <p className="tnum text-[11.5px] text-muted font-medium">
                                gross {formatMoney(slip.gross)}
                              </p>
                            </div>
                          </button>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </Card>

            {/* History */}
            <Card flush>
              <div className="border-b border-hairline px-4 py-3">
                <h2 className="text-[13px] font-semibold text-ink">Payroll history</h2>
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
                <ul className="divide-y divide-hairline">
                  {data.runs.map((run) => (
                    <li key={run.id}>
                      <button
                        type="button"
                        onClick={() => void selectPeriod(user.role, run.period)}
                        className={`flex w-full items-center justify-between gap-3 border-l-4 px-4 py-3.5 text-left transition-colors last:border-0 hover:bg-wash/50 cursor-pointer ${
                          run.period === data.selected.period
                            ? 'bg-pine-tint/30 border-pine text-pine-deep font-semibold'
                            : 'border-transparent hover:border-hairline-strong'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold text-ink">
                            {formatPeriod(run.period)}
                          </p>
                          <p className="tnum mt-1 text-[11.5px] text-muted">
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
    </motion.div>
  )
}
