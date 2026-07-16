import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, History } from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import {
  SalaryError,
  formatCurrency,
  salaryService,
  type CompanySalaryRow,
  type SalaryStructure,
  type SalaryStructurePayload,
} from '@/services/salaryService'

type Props = {
  open: boolean
  onClose: () => void
  row: CompanySalaryRow | null
  canManage: boolean
  onSave: (employeeId: string, payload: SalaryStructurePayload) => Promise<unknown>
}

type Form = {
  basic: number
  hra: number
  otherAllowance: number
  effectiveFrom: string
}

/** YYYY-MM — matches what a native <input type="month"> shows/accepts. */
const currentMonthValue = () => new Date().toISOString().slice(0, 7)

const formatMonth = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

export default function SalaryStructureModal({ open, onClose, row, canManage, onSave }: Props) {
  const [formError, setFormError] = useState<string | null>(null)
  const [history, setHistory] = useState<SalaryStructure[] | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    defaultValues: { basic: 0, hra: 0, otherAllowance: 0, effectiveFrom: currentMonthValue() },
  })

  const basic = Number(watch('basic')) || 0
  const hra = Number(watch('hra')) || 0
  const otherAllowance = Number(watch('otherAllowance')) || 0
  const gross = basic + hra + otherAllowance

  useEffect(() => {
    if (!open || !row) return

    reset({
      basic: row.current?.basic ?? 0,
      hra: row.current?.hra ?? 0,
      otherAllowance: row.current?.otherAllowance ?? 0,
      effectiveFrom: currentMonthValue(),
    })
    setFormError(null)
    setHistory(null)
    setHistoryError(null)

    salaryService
      .history(row.employeeId)
      .then(setHistory)
      .catch((err) => setHistoryError(err instanceof SalaryError ? err.message : 'We could not load the revision history.'))
  }, [open, row, reset])

  const close = () => {
    setFormError(null)
    onClose()
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!row) return
    setFormError(null)

    try {
      await onSave(row.employeeId, {
        basic: Number(values.basic),
        hra: Number(values.hra) || 0,
        otherAllowance: Number(values.otherAllowance) || 0,
        // The DOM month input gives "YYYY-MM" — the API wants the 1st of that month.
        effectiveFrom: `${values.effectiveFrom}-01`,
      })
      close()
    } catch (err) {
      setFormError(err instanceof SalaryError ? err.message : 'We could not save that salary structure.')
    }
  })

  return (
    <Modal
      open={open}
      onClose={close}
      title={row ? row.employeeName : 'Salary structure'}
      description={row ? `${row.designation} · ${row.department}` : undefined}
    >
      {row && (
        <div className="space-y-6">
          {canManage ? (
            <form onSubmit={onSubmit} noValidate>
              {formError && (
                <div role="alert" className="mb-4 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
                  <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
                  <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Basic salary"
                    type="number"
                    min={1}
                    error={errors.basic?.message}
                    {...register('basic', {
                      required: 'Enter a basic salary.',
                      min: { value: 1, message: 'Basic salary must be greater than zero.' },
                    })}
                  />
                  <Input
                    label="HRA"
                    type="number"
                    min={0}
                    error={errors.hra?.message}
                    {...register('hra', { min: { value: 0, message: 'Cannot be negative.' } })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Other allowance"
                    type="number"
                    min={0}
                    error={errors.otherAllowance?.message}
                    {...register('otherAllowance', { min: { value: 0, message: 'Cannot be negative.' } })}
                  />
                  <Input
                    label="Effective from"
                    type="month"
                    error={errors.effectiveFrom?.message}
                    {...register('effectiveFrom', { required: 'Pick a month.' })}
                  />
                </div>

                <div className="tnum flex items-center justify-between rounded-ctl border border-emerald-500/15 bg-emerald-500/[0.03] px-3.5 py-2.5 text-[13px] font-semibold text-emerald-800">
                  <span>Monthly gross</span>
                  <span>{formatCurrency(gross)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save revision'
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-ctl border border-hairline bg-wash/30 p-3.5 text-[13px] text-muted">
              {row.current
                ? `Basic ${formatCurrency(row.current.basic)} · HRA ${formatCurrency(row.current.hra)} · Other ${formatCurrency(row.current.otherAllowance)} · Gross ${formatCurrency(row.current.gross)}`
                : 'No salary structure has been entered yet.'}
            </div>
          )}

          <div>
            <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
              <History size={12} />
              Revision history
            </h3>

            {historyError ? (
              <p className="mt-2 text-[12.5px] text-clay">{historyError}</p>
            ) : history === null ? (
              <div className="mt-2 space-y-1.5">
                <div className="h-8 animate-pulse rounded bg-wash" />
                <div className="h-8 animate-pulse rounded bg-wash" />
              </div>
            ) : history.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-muted">No structure has been entered for this employee yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-hairline rounded-ctl border border-hairline">
                {history.map((s) => (
                  <li key={s.id} className="flex items-center justify-between px-3 py-2 text-[12.5px]">
                    <span className="font-medium text-ink">{formatMonth(s.effectiveFrom)}</span>
                    <span className="tnum text-muted">
                      Basic {formatCurrency(s.basic)} · Gross {formatCurrency(s.gross)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
