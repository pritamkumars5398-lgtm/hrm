import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check, Loader2, Settings2, AlertCircle } from 'lucide-react'

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
    <div className="w-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-xl shadow-teal-900/5 flex flex-col md:flex-row transition-all duration-300 hover:shadow-teal-900/10">
      {/* Left Panel: Context */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#047857] via-[#059669] to-[#10b981] p-5 sm:p-6 md:w-[260px] md:shrink-0">
        {/* Decorative background blurs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 hover:scale-110" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#34d399]/20 blur-3xl transition-transform duration-700 hover:scale-110" />
        
        <div className="relative z-10 flex flex-col items-start">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-emerald-900/20">
            <Settings2 className="text-[#059669]" size={20} strokeWidth={2.5} />
          </div>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight text-white drop-shadow-sm font-display">
            Leave policy
          </h2>
          <p className="text-[12px] leading-relaxed text-emerald-50 max-w-[200px]">
            Yearly days allowed per type, company-wide.
          </p>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 bg-white">
        <form onSubmit={onSubmit} noValidate>
          <div className="mb-4">
            <h3 className="text-[12.5px] font-bold text-gray-800 uppercase tracking-widest">Leave allowances</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <p className="mt-2.5 text-[11.5px] text-gray-500">Unpaid leave has no cap — it's always unlimited.</p>

          {error && (
            <div className="mt-3 flex gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-[12px] text-red-700 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#059669]">
                <Check size={14} strokeWidth={3} />
                Policy saved
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
      </div>
    </div>
  )
}
