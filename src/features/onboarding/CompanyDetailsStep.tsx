import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import { OrganizationError, organizationService } from '@/services/organizationService'
import { useAuthStore } from '@/features/auth/store/authStore'
import WizardShell from './components/WizardShell'
import { useOnboardingStore } from './store/onboardingStore'

type CompanyForm = {
  name: string
  address: string
  industry: string
}

export default function CompanyDetailsStep() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const attachOrganization = useAuthStore((s) => s.attachOrganization)

  const personal = useOnboardingStore((s) => s.personal)
  const goTo = useOnboardingStore((s) => s.goTo)

  const [formError, setFormError] = useState<string | null>(null)
  const industries = organizationService.getIndustryOptions()

  // Landing here directly, without having done step 1, would submit a half-built
  // profile — send them back rather than letting them through.
  useEffect(() => {
    if (!personal) goTo(1)
  }, [personal, goTo])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyForm>({ defaultValues: { name: '', address: '', industry: '' } })

  if (user?.organizationId) return <Navigate to="/dashboard" replace />
  if (!personal) return <Navigate to="/onboarding" replace />

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    if (!user) return

    try {
      const org = await organizationService.create({
        ...values,
        jobTitle: personal.jobTitle,
        ownerId: user.id,
      })

      // This is the moment the workspace exists and this person owns it (§11.2).
      attachOrganization(org.id, personal.jobTitle)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(
        err instanceof OrganizationError
          ? err.message
          : 'We could not create your workspace. Please try again.',
      )
    }
  })

  const back = () => {
    goTo(1)
    navigate('/onboarding')
  }

  return (
    <WizardShell
      current={2}
      title="Now, your company"
      subtitle="This creates your workspace. You'll be its owner, and you can invite your HR team and managers straight after."
    >
      <form onSubmit={onSubmit} noValidate>
        {formError && (
          <div
            role="alert"
            className="mb-5 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3"
          >
            <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
            <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Company name"
            autoComplete="organization"
            placeholder="Alderway Labs"
            error={errors.name?.message}
            {...register('name', {
              required: 'Enter your company name.',
              minLength: { value: 2, message: 'That name looks too short.' },
            })}
          />

          <Input
            label="Address"
            autoComplete="street-address"
            placeholder="4 Wharf Road, London, E15 2QR"
            hint="Appears on payslips and offer letters."
            error={errors.address?.message}
            {...register('address', { required: 'Enter your company address.' })}
          />

          <Select
            label="Industry"
            placeholder="Select an industry"
            options={industries}
            error={errors.industry?.message}
            {...register('industry', { required: 'Choose an industry.' })}
          />
        </div>

        <div className="mt-6 flex gap-2.5 rounded-ctl border border-hairline bg-wash p-3.5">
          <Sparkles size={15} className="mt-px shrink-0 text-pine" aria-hidden="true" />
          <p className="text-[12px] leading-relaxed text-muted">
            You'll join as <span className="font-medium text-ink">{personal.fullName}</span>,{' '}
            <span className="font-medium text-ink">{personal.jobTitle}</span> — the{' '}
            <span className="font-medium text-ink">Owner</span> of this workspace.
          </p>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 border-t border-hairline pt-6">
          <Button type="button" variant="ghost" onClick={back} disabled={isSubmitting}>
            <ArrowLeft size={16} />
            Back
          </Button>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating workspace…
              </>
            ) : (
              'Create workspace'
            )}
          </Button>
        </div>
      </form>
    </WizardShell>
  )
}
