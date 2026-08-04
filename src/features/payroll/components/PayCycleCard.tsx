import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { AlertCircle, Calendar, Check, Loader2 } from 'lucide-react'
import Card from '@/shared/components/Card'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import { PayCycleError, payCycleService, type PayCycle, type PayCycleType } from '@/services/payCycleService'

type Form = {
  type: PayCycleType
  fixedDay: number
  rangeStart: number
  rangeEnd: number
}

const ordinal = (day: number) => {
  if (day % 10 === 1 && day !== 11) return `${day}st`
  if (day % 10 === 2 && day !== 12) return `${day}nd`
  if (day % 10 === 3 && day !== 13) return `${day}rd`
  return `${day}th`
}

const describe = (cycle: PayCycle): string | null => {
  if (cycle.type === 'FIXED' && cycle.fixedDay) return `Paid on the ${ordinal(cycle.fixedDay)} of every month.`
  if (cycle.type === 'RANGE' && cycle.rangeStart && cycle.rangeEnd) {
    return `Paid between the ${ordinal(cycle.rangeStart)} and ${ordinal(cycle.rangeEnd)} of every month.`
  }
  return null
}

type Props = { canManage: boolean }

export default function PayCycleCard({ canManage }: Props) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [cycle, setCycle] = useState<PayCycle | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Form>({ defaultValues: { type: 'FIXED', fixedDay: 1, rangeStart: 1, rangeEnd: 7 } })

  const type = watch('type')

  useEffect(() => {
    payCycleService
      .get()
      .then((data) => {
        setCycle(data)
        reset({
          type: data.type ?? 'FIXED',
          fixedDay: data.fixedDay ?? 1,
          rangeStart: data.rangeStart ?? 1,
          rangeEnd: data.rangeEnd ?? 7,
        })
        setStatus('ready')
      })
      .catch((err) => {
        setLoadError(err instanceof PayCycleError ? err.message : 'We could not load the pay cycle.')
        setStatus('error')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = handleSubmit(async (values) => {
    setSaveError(null)
    try {
      const updated = await payCycleService.update(
        values.type === 'FIXED'
          ? { type: 'FIXED', fixedDay: Number(values.fixedDay) }
          : { type: 'RANGE', rangeStart: Number(values.rangeStart), rangeEnd: Number(values.rangeEnd) },
      )
      setCycle(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setSaveError(err instanceof PayCycleError ? err.message : 'We could not save the pay cycle.')
    }
  })

  if (status === 'loading') {
    return (
      <Card className="p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-wash" />
        <div className="mt-3 h-8 w-full animate-pulse rounded bg-wash" />
      </Card>
    )
  }

  if (status === 'error') {
    return (
      <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
        <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
        <p className="text-[13px] text-clay">{loadError}</p>
      </Card>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-xl shadow-teal-900/5 flex flex-col md:flex-row transition-all duration-300 hover:shadow-teal-900/10">
      {/* Left Panel: Context */}
      <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#047857] via-[#059669] to-[#10b981] p-5 sm:p-6 md:w-[260px] md:shrink-0">
        {/* Decorative background blurs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 hover:scale-110" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#34d399]/20 blur-3xl transition-transform duration-700 hover:scale-110" />
        
        <div className="relative z-10 flex flex-col items-start">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg shadow-emerald-900/20">
            <Calendar className="text-[#059669]" size={20} strokeWidth={2.5} />
          </div>
          <h2 className="mb-1 text-xl font-extrabold tracking-tight text-white drop-shadow-sm font-display">
            Pay cycle
          </h2>
          <p className="text-[12px] leading-relaxed text-emerald-50 max-w-[200px]">
            When salary lands, company-wide.
          </p>
        </div>
      </div>

      {/* Right Panel: Content */}
      <div className="flex flex-1 flex-col justify-center p-5 sm:p-6 bg-white">
        {!canManage ? (
          <p className="text-[13px] text-muted">
            {cycle && describe(cycle) ? describe(cycle) : 'Not set up yet.'}
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="flex gap-1 rounded-ctl border border-hairline bg-wash/50 p-1">
              {(
                [
                  { value: 'FIXED', label: 'Fixed date' },
                  { value: 'RANGE', label: 'Date range' },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 cursor-pointer rounded-[5px] px-3 py-1.5 text-center text-[12.5px] font-medium transition-colors ${
                    type === opt.value ? 'bg-surface text-ink shadow-sm border border-hairline' : 'text-muted hover:text-ink'
                  }`}
                >
                  <input type="radio" value={opt.value} className="sr-only" {...register('type')} />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="mt-4">
              {type === 'FIXED' ? (
                <Input
                  label="Day of month"
                  type="number"
                  min={1}
                  max={31}
                  error={errors.fixedDay?.message}
                  hint="e.g. 1 for the 1st of every month"
                  {...register('fixedDay', {
                    required: 'Pick a day.',
                    min: { value: 1, message: 'Must be between 1 and 31.' },
                    max: { value: 31, message: 'Must be between 1 and 31.' },
                  })}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="From day"
                    type="number"
                    min={1}
                    max={31}
                    error={errors.rangeStart?.message}
                    {...register('rangeStart', {
                      required: 'Pick a start day.',
                      min: { value: 1, message: 'Must be between 1 and 31.' },
                      max: { value: 31, message: 'Must be between 1 and 31.' },
                    })}
                  />
                  <Input
                    label="To day"
                    type="number"
                    min={1}
                    max={31}
                    error={errors.rangeEnd?.message}
                    hint="Actual payment can vary a day or two within this window."
                    {...register('rangeEnd', {
                      required: 'Pick an end day.',
                      min: { value: 1, message: 'Must be between 1 and 31.' },
                      max: { value: 31, message: 'Must be between 1 and 31.' },
                    })}
                  />
                </div>
              )}
            </div>

            {saveError && (
              <div className="mt-3 flex gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2">
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
                <p className="text-[12px] text-red-700 leading-relaxed">{saveError}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#059669]">
                  <Check size={14} strokeWidth={3} />
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
                  'Save pay cycle'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
