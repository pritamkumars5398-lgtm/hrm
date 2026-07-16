import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Loader2, Settings2 } from 'lucide-react'
import Card from '@/shared/components/Card'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import type { LeavePolicyPatch } from '@/services/leaveService'

type Form = { annual: number; sick: number; personal: number }

export default function LeavePolicyCard({
  policy,
  onSave,
}: {
  policy: { annual: number; sick: number; personal: number }
  onSave: (patch: LeavePolicyPatch) => Promise<void>
}) {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Form>({ defaultValues: policy })

  // Keep the form in sync if the policy loads/changes after this component mounts.
  useEffect(() => {
    reset(policy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [policy.annual, policy.sick, policy.personal])

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    try {
      await onSave(values)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not save the leave policy.')
    }
  })

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-pine-tint text-pine">
          <Settings2 size={14} />
        </span>
        <div>
          <h2 className="text-[14px] font-semibold text-ink">Leave policy</h2>
          <p className="text-[12px] text-muted">Yearly days allowed per type, company-wide.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-4">
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Annual"
            type="number"
            min={0}
            error={errors.annual?.message}
            {...register('annual', { required: true, valueAsNumber: true, min: { value: 0, message: 'Can\'t be negative.' } })}
          />
          <Input
            label="Sick"
            type="number"
            min={0}
            error={errors.sick?.message}
            {...register('sick', { required: true, valueAsNumber: true, min: { value: 0, message: 'Can\'t be negative.' } })}
          />
          <Input
            label="Personal"
            type="number"
            min={0}
            error={errors.personal?.message}
            {...register('personal', { required: true, valueAsNumber: true, min: { value: 0, message: 'Can\'t be negative.' } })}
          />
        </div>

        <p className="mt-2.5 text-[11.5px] text-muted">Unpaid leave has no cap — it's always unlimited.</p>

        {error && <p className="mt-2.5 text-[12px] text-clay">{error}</p>}

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-hairline pt-3.5">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-pine">
              <Check size={13} />
              Saved
            </span>
          )}
          <Button type="submit" size="sm" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Saving…
              </>
            ) : (
              'Save policy'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
