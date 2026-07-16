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
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-7 items-center justify-center rounded-full bg-pine-tint text-pine">
          <Calendar size={14} />
        </span>
        <div>
          <h2 className="text-[14px] font-semibold text-ink">Pay cycle</h2>
          <p className="text-[12px] text-muted">When salary lands, company-wide.</p>
        </div>
      </div>

      {!canManage ? (
        <p className="mt-4 text-[13px] text-muted">
          {cycle && describe(cycle) ? describe(cycle) : 'Not set up yet.'}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-4">
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

          {saveError && <p className="mt-2.5 text-[12px] text-clay">{saveError}</p>}

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
                'Save pay cycle'
              )}
            </Button>
          </div>
        </form>
      )}
    </Card>
  )
}
