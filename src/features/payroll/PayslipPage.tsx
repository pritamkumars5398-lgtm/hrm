import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Card from '@/shared/components/Card'
import { useAuthStore } from '@/features/auth/store/authStore'
import { hasPermission } from '@/shared/config/navigation'
import { payslipService, PayslipError, type Payslip, type PayslipDraftPayload } from '@/services/payslipService'
import { usePayslipStore } from './store/payslipStore'
import PayslipDetail from './components/PayslipDetail'

const formatMonthLabel = (month: string) => {
  const [year, mon] = month.split('-').map(Number) as [number, number]
  return new Date(year, mon - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

const currentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function PayslipPage() {
  const navigate = useNavigate()
  const { employeeId } = useParams<{ employeeId: string }>()
  const [searchParams] = useSearchParams()
  const month = searchParams.get('month') || currentMonth()

  const user = useAuthStore((s) => s.user)!
  const canManage = hasPermission(user.permissions, 'payroll.manage')

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Table view caches its own fetch and skips refetching unless told to — a save
  // or finalize here would otherwise leave it showing stale Draft/net-pay data.
  const [changed, setChanged] = useState(false)

  const load = () => {
    if (!employeeId) return
    setStatus('loading')
    setError(null)

    payslipService
      .list(month)
      .then((rows) => {
        const row = rows.find((r) => r.employeeId === employeeId)
        if (!row) {
          setError('That payslip could not be found for this month.')
          setStatus('error')
          return
        }
        setPayslip(row)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err instanceof PayslipError ? err.message : 'We could not load that payslip.')
        setStatus('error')
      })
  }

  useEffect(load, [employeeId, month])

  const back = () => {
    if (changed) usePayslipStore.setState({ status: 'idle' })
    navigate(`/dashboard/payroll?tab=monthly`)
  }

  const saveDraft = async (id: string, payload: PayslipDraftPayload) => {
    const saved = await payslipService.saveDraft(id, month, payload)
    setPayslip(saved)
    setChanged(true)
    return saved
  }

  const finalize = async (id: string) => {
    const saved = await payslipService.finalize(id, month)
    setPayslip(saved)
    setChanged(true)
    return saved
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <button
          type="button"
          onClick={back}
          className="mb-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-pine cursor-pointer"
        >
          <ArrowLeft size={14} />
          Back to Payroll
        </button>
        <h1 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em] text-ink">
          {payslip ? payslip.employeeName : 'Payslip'}
        </h1>
        <p className="mt-1 text-[13.5px] text-muted">
          {payslip ? `${payslip.designation} · ${formatMonthLabel(month)}` : formatMonthLabel(month)}
        </p>
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
        <PayslipDetail payslip={payslip} canManage={canManage} onSaveDraft={saveDraft} onFinalize={finalize} />
      )}
    </div>
  )
}
