import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import {
  LEAVE_TYPES,
  LeaveError,
  daysBetween,
  type ApplyLeavePayload,
  type LeaveBalance,
} from '@/services/leaveService'
import { LEAVE_TYPE_LABEL } from '../labels'

type ApplyLeaveModalProps = {
  open: boolean
  onClose: () => void
  balances: LeaveBalance[]
  onApply: (payload: ApplyLeavePayload) => Promise<unknown>
}

type Form = ApplyLeavePayload

export default function ApplyLeaveModal({
  open,
  onClose,
  balances,
  onApply,
}: ApplyLeaveModalProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    defaultValues: { type: 'ANNUAL', startDate: '', endDate: '', reason: '' },
  })

  const type = watch('type')
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  const balance = balances.find((b) => b.type === type)
  const remaining = balance ? balance.total - balance.used : 0
  const requested =
    startDate && endDate && endDate >= startDate ? daysBetween(startDate, endDate) : 0

  const close = () => {
    reset()
    setFormError(null)
    onClose()
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      await onApply(values)
      close()
    } catch (err) {
      setFormError(
        err instanceof LeaveError ? err.message : 'We could not submit that request.',
      )
    }
  })

  return (
    <Modal
      open={open}
      onClose={close}
      title="Request leave"
      description="Your manager is notified as soon as you submit."
    >
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-4 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3"
          >
            <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
            <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
          </div>
        )}

        <div className="space-y-4">
          <Select
            label="Leave type"
            options={LEAVE_TYPES.map((t) => ({ value: t, label: LEAVE_TYPE_LABEL[t] }))}
            hint={
              type === 'UNPAID'
                ? 'Unpaid leave does not draw down an allowance.'
                : `${remaining} ${remaining === 1 ? 'day' : 'days'} remaining`
            }
            error={errors.type?.message}
            {...register('type', { required: 'Pick a leave type.' })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First day"
              type="date"
              error={errors.startDate?.message}
              {...register('startDate', { required: 'Pick a start date.' })}
            />
            <Input
              label="Last day"
              type="date"
              error={errors.endDate?.message}
              {...register('endDate', {
                required: 'Pick an end date.',
                validate: (value) =>
                  !startDate || value >= startDate || 'The last day cannot be before the first.',
              })}
            />
          </div>

          {requested > 0 && (
            <div className="tnum rounded-ctl border border-emerald-500/15 bg-emerald-500/[0.03] px-3.5 py-2.5 text-[13px] text-emerald-800 flex items-center justify-between font-semibold shadow-sm transition-all duration-300">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-500 animate-pulse" />
                <span>
                  {requested} {requested === 1 ? 'day' : 'days'} requested
                </span>
              </span>
              {type !== 'UNPAID' && (
                <span className="text-[11px] text-muted font-bold bg-wash border border-hairline px-2 py-0.5 rounded-full">
                  {remaining - requested} remaining
                </span>
              )}
            </div>
          )}

          <Input
            label="Reason"
            placeholder="Family holiday"
            error={errors.reason?.message}
            {...register('reason', {
              required: 'Add a short reason.',
              minLength: { value: 3, message: 'That reason is too short.' },
            })}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Submitting…
              </>
            ) : (
              'Submit request'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
