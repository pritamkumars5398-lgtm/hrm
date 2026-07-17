import { useEffect, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Receipt, Sparkles } from 'lucide-react'
import Card from '@/shared/components/Card'
import { payslipService, PayslipError, type Payslip } from '@/services/payslipService'
import PayslipDetail from './components/PayslipDetail'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const formatMonthLabel = (month: string) => {
  const [year, mon] = month.split('-').map(Number) as [number, number]
  return `${MONTHS[mon - 1]} ${year}`
}

/** No-op writers — the self-service view is always read-only, but PayslipDetail
 *  requires the props (it never calls them when canManage is false). */
const neverCalled = async (): Promise<Payslip> => {
  throw new Error('Payslips are read-only here.')
}

export default function MyPayslipPage() {
  const [month, setMonth] = useState(currentMonth())
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setStatus('loading')
    setError(null)

    payslipService
      .list(month, { mine: true })
      .then((rows) => {
        setPayslip(rows[0] ?? null)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err instanceof PayslipError ? err.message : 'We could not load your payslip.')
        setStatus('error')
      })
  }

  useEffect(load, [month])

  const isCurrentMonth = month === currentMonth()

  const goToMonth = (delta: number) => {
    const [year, mon] = month.split('-').map(Number) as [number, number]
    const next = new Date(year, mon - 1 + delta, 1)
    setMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Payslip
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">Your own finalized payslips, month by month.</p>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-hairline/80 p-1.5 rounded-ctl">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline bg-surface text-muted transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="tnum min-w-32 text-center text-[13px] font-bold text-ink">{formatMonthLabel(month)}</span>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline bg-surface text-muted transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {status === 'loading' && (
        <Card className="p-5 space-y-4">
          <div className="h-5 w-32 animate-pulse rounded bg-wash" />
          <div className="h-24 animate-pulse rounded bg-wash" />
          <div className="h-24 animate-pulse rounded bg-wash" />
        </Card>
      )}

      {status === 'error' && (
        <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={load}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {status === 'ready' && payslip && (
        <PayslipDetail payslip={payslip} canManage={false} onSaveDraft={neverCalled} onFinalize={neverCalled} />
      )}

      {status === 'ready' && !payslip && (
        <Card className="p-10 text-center">
          <Receipt size={22} className="mx-auto text-muted/50" aria-hidden="true" />
          <p className="mt-3 text-[14px] font-medium text-ink">No payslip for {formatMonthLabel(month)}</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">
            Either payroll for this month hasn't been finalized yet, or there's no employee record for you in this
            company.
          </p>
        </Card>
      )}
    </div>
  )
}
