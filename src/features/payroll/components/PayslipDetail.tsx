import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { pdf } from '@react-pdf/renderer'
import { AlertCircle, CheckCircle2, Download, Loader2, Lock } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Badge from '@/shared/components/Badge'
import { formatMoney } from '@/services/payrollService'
import { PayslipError, type Payslip, type PayslipDraftPayload } from '@/services/payslipService'
import { useAuthStore } from '@/features/auth/store/authStore'
import PayslipDocument from './PayslipDocument'

type Props = {
  payslip: Payslip
  canManage: boolean
  onSaveDraft: (employeeId: string, payload: PayslipDraftPayload) => Promise<Payslip>
  onFinalize: (employeeId: string) => Promise<Payslip>
}

type Form = {
  bonus: number
  incentive: number
  reimbursement: number
  otherEarnings: number
  incomeTax: number
  otherDeduction: number
  notes: string
}

/** Strips anything that isn't safe in a filename across OSes. */
const slugify = (value: string) => value.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()

export default function PayslipDetail({ payslip, canManage, onSaveDraft, onFinalize }: Props) {
  const user = useAuthStore((s) => s.user)
  const companyName =
    user?.memberships.find((m) => m.organizationId === user.activeOrganizationId)?.organizationName || 'Company'

  const [formError, setFormError] = useState<string | null>(null)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const [confirmingFinalize, setConfirmingFinalize] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { isSubmitting, isDirty },
  } = useForm<Form>({
    defaultValues: { bonus: 0, incentive: 0, reimbursement: 0, otherEarnings: 0, incomeTax: 0, otherDeduction: 0, notes: '' },
  })

  useEffect(() => {
    reset({
      bonus: payslip.bonus,
      incentive: payslip.incentive,
      reimbursement: payslip.reimbursement,
      otherEarnings: payslip.otherEarnings,
      incomeTax: payslip.incomeTax,
      otherDeduction: payslip.otherDeduction,
      notes: payslip.notes ?? '',
    })
    setFormError(null)
    setFinalizeError(null)
    setConfirmingFinalize(false)
    setDownloadError(null)
    // Only when the record itself changes (a different employee/month, or after
    // a save swaps in the server's copy) — not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payslip.id, payslip.employeeId, payslip.month, reset])

  const bonus = Number(watch('bonus')) || 0
  const incentive = Number(watch('incentive')) || 0
  const reimbursement = Number(watch('reimbursement')) || 0
  const otherEarnings = Number(watch('otherEarnings')) || 0
  const incomeTax = Number(watch('incomeTax')) || 0
  const otherDeduction = Number(watch('otherDeduction')) || 0
  const notes = watch('notes')

  const structureGross = payslip.basic + payslip.hra + payslip.otherAllowance
  const lopDeduction = payslip.lopDeduction
  const grossEarnings = structureGross + bonus + incentive + reimbursement + otherEarnings
  const totalDeductions = incomeTax + otherDeduction + lopDeduction
  const netSalary = grossEarnings - totalDeductions

  // The PDF must always match what's on screen — including unsaved edits — not
  // whatever was last persisted. Finalized payslips aren't editable, so the form
  // state there just mirrors the payslip anyway.
  const livePayslip: Payslip = {
    ...payslip,
    bonus,
    incentive,
    reimbursement,
    otherEarnings,
    incomeTax,
    otherDeduction,
    notes: notes || null,
    grossEarnings,
    totalDeductions,
    netSalary,
  }

  const isFinalized = payslip.status === 'FINALIZED'
  const isEditable = canManage && !isFinalized

  /** Throws on failure — callers decide how to surface that, unlike the wrapped form handler below. */
  const persistDraft = async (values: Form): Promise<void> => {
    await onSaveDraft(payslip.employeeId, {
      bonus: Number(values.bonus) || 0,
      incentive: Number(values.incentive) || 0,
      reimbursement: Number(values.reimbursement) || 0,
      otherEarnings: Number(values.otherEarnings) || 0,
      incomeTax: Number(values.incomeTax) || 0,
      otherDeduction: Number(values.otherDeduction) || 0,
      notes: values.notes,
    })
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await persistDraft(values)
    } catch (err) {
      setFormError(err instanceof PayslipError ? err.message : 'We could not save that payslip.')
    }
  })

  const handleFinalize = async () => {
    setFinalizeError(null)
    setFinalizing(true)

    try {
      // Save whatever's currently in the form first, so Finalize locks in what's on
      // screen — propagates on failure (unlike the form's own onSubmit), so a failed
      // save never silently proceeds to lock in stale numbers.
      await persistDraft(getValues())
      await onFinalize(payslip.employeeId)
      setConfirmingFinalize(false)
    } catch (err) {
      setFinalizeError(err instanceof PayslipError ? err.message : 'We could not finalize that payslip.')
    } finally {
      setFinalizing(false)
    }
  }

  const handleDownload = async () => {
    setDownloadError(null)
    setDownloading(true)

    try {
      const blob = await pdf(<PayslipDocument payslip={livePayslip} companyName={companyName} />).toBlob()
      const url = URL.createObjectURL(blob)
      const filename = `payslip-${slugify(livePayslip.employeeName)}-${livePayslip.month}.pdf`

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      setDownloadError('We could not generate that PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Badge tone={isFinalized ? 'success' : 'neutral'}>{isFinalized ? 'Finalized' : 'Draft'}</Badge>
        {isFinalized && payslip.finalizedAt && (
          <span className="flex items-center gap-1.5 text-[12px] text-muted">
            <Lock size={12} />
            Locked {new Date(`${payslip.finalizedAt}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {payslip.finalizedBy && ` by ${payslip.finalizedBy}`}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-ctl border border-hairline bg-wash/30 p-3 text-[12.5px]">
        <div className="flex justify-between gap-2">
          <span className="text-muted">Employee ID</span>
          <span className="tnum font-medium text-ink">{payslip.employeeCode ?? '—'}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted">Department</span>
          <span className="font-medium text-ink">{payslip.department}</span>
        </div>
      </div>

      {!payslip.hasSalaryStructure && (
        <div className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
          <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
          <p className="text-[13px] leading-relaxed text-clay">
            No salary structure has been set for this employee yet — set one up under Salary Structures before finalizing payroll.
          </p>
        </div>
      )}

      {formError && (
        <div role="alert" className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
          <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
          <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <Card className="p-5 space-y-5">
          {/* Earnings */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">Earnings</h3>
            <div className="space-y-2 rounded-ctl border border-hairline bg-wash/30 p-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted">Basic</span>
                <span className="tnum font-medium text-ink">{formatMoney(payslip.basic)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">HRA</span>
                <span className="tnum font-medium text-ink">{formatMoney(payslip.hra)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Other allowance</span>
                <span className="tnum font-medium text-ink">{formatMoney(payslip.otherAllowance)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Bonus" type="number" min={0} disabled={!isEditable} {...register('bonus', { min: 0 })} />
              <Input label="Incentive" type="number" min={0} disabled={!isEditable} {...register('incentive', { min: 0 })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Reimbursement" type="number" min={0} disabled={!isEditable} {...register('reimbursement', { min: 0 })} />
              <Input label="Other earnings" type="number" min={0} disabled={!isEditable} {...register('otherEarnings', { min: 0 })} />
            </div>

            <div className="flex items-center justify-between text-[13px] font-semibold text-ink">
              <span>Gross earnings</span>
              <span className="tnum">{formatMoney(grossEarnings)}</span>
            </div>
          </section>

          {/* Deductions */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">Deductions</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Income tax" type="number" min={0} disabled={!isEditable} {...register('incomeTax', { min: 0 })} />
              <Input label="Other deduction" type="number" min={0} disabled={!isEditable} {...register('otherDeduction', { min: 0 })} />
            </div>

            <div className="flex items-center justify-between rounded-ctl border border-hairline bg-wash/30 px-3 py-2 text-[13px]">
              <span className="text-muted">
                Loss of pay
                {payslip.unpaidDays > 0 && (
                  <span className="ml-1.5 text-[11px] text-muted/80">
                    ({payslip.unpaidDays} of {payslip.daysInMonth} days)
                  </span>
                )}
              </span>
              <span className="tnum font-medium text-ink">{formatMoney(lopDeduction)}</span>
            </div>

            <div className="flex items-center justify-between text-[13px] font-semibold text-ink">
              <span>Total deductions</span>
              <span className="tnum">{formatMoney(totalDeductions)}</span>
            </div>
          </section>

          {/* Net */}
          <div className="flex items-center justify-between rounded-ctl border border-emerald-500/15 bg-emerald-500/[0.03] px-3.5 py-3 text-[14px] font-bold text-emerald-800">
            <span>Net salary</span>
            <span className="tnum">{formatMoney(netSalary)}</span>
          </div>

          <Input label="Notes" placeholder="Optional note for this payslip" disabled={!isEditable} {...register('notes')} />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-4">
            <Button type="button" variant="secondary" onClick={() => void handleDownload()} disabled={downloading}>
              {downloading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Preparing…
                </>
              ) : (
                <>
                  <Download size={15} />
                  Download PDF
                </>
              )}
            </Button>

            {isEditable && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="submit" variant="secondary" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Save draft'
                  )}
                </Button>

                {!confirmingFinalize ? (
                  <Button type="button" disabled={!payslip.hasSalaryStructure} onClick={() => setConfirmingFinalize(true)}>
                    Finalize
                  </Button>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-[12.5px] text-muted">Locks this payslip — it can't be edited after.</span>
                    <Button type="button" variant="secondary" onClick={() => setConfirmingFinalize(false)} disabled={finalizing}>
                      Cancel
                    </Button>
                    <Button type="button" onClick={() => void handleFinalize()} disabled={finalizing}>
                      {finalizing ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Finalizing…
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          Confirm finalize
                        </>
                      )}
                    </Button>
                  </span>
                )}
              </div>
            )}
          </div>

          {downloadError && (
            <div role="alert" className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
              <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
              <p className="text-[13px] leading-relaxed text-clay">{downloadError}</p>
            </div>
          )}

          {finalizeError && (
            <div role="alert" className="flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
              <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
              <p className="text-[13px] leading-relaxed text-clay">{finalizeError}</p>
            </div>
          )}
        </Card>
      </form>
    </div>
  )
}
