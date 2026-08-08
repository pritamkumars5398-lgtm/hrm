import { useEffect, useState } from 'react'
import { AlertCircle, ChevronLeft, ChevronRight, Receipt, Sparkles, CheckCircle } from 'lucide-react'
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
        <div className="relative overflow-hidden rounded-card border border-hairline bg-surface p-10 text-center shadow-sm">
          {/* Beautiful background gradient */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-pine/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-hairline mb-5">
              <Receipt className="text-pine size-7" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-[19px] font-display font-semibold text-ink tracking-tight">No payslip generated yet</h3>
            <p className="mx-auto mt-2 max-w-md text-[14px] text-muted leading-relaxed">
              Your payslip for <strong className="text-ink font-semibold">{formatMonthLabel(month)}</strong> is not available. This usually means payroll hasn't been finalized by the admin yet.
            </p>

            {/* Skeleton preview of what's inside */}
            <div className="mx-auto mt-10 max-w-sm rounded-ctl border border-hairline bg-wash/40 p-6 text-left shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] relative">
              <div className="absolute -top-3 left-6 bg-surface px-2 text-[11px] font-bold text-pine uppercase tracking-wider border border-hairline rounded-full shadow-sm">
                What's inside?
              </div>
              <ul className="space-y-4 mt-2">
                <li className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-[13.5px] text-ink font-medium">Earnings & Deductions breakdown</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-[13.5px] text-ink font-medium">Net Take-Home Salary</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-full bg-teal-50 border border-teal-100 text-teal-600">
                    <CheckCircle size={14} />
                  </div>
                  <span className="text-[13.5px] text-ink font-medium">Downloadable PDF for your records</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
