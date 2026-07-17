import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowLeft, Loader2, Sparkles, Building, MapPin, Briefcase } from 'lucide-react'
import { OrganizationError, organizationService } from '@/services/organizationService'
import { useAuthStore } from '@/features/auth/store/authStore'
import WizardShell from './components/WizardShell'
import { useOnboardingStore } from './store/onboardingStore'

type CompanyForm = {
  name: string
  address: string
  industry: string
}

export default function CompanyDetailsStep({ isAdditional = false }: { isAdditional?: boolean }) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const attachOrganization = useAuthStore((s) => s.attachOrganization)

  const personal = useOnboardingStore((s) => s.personal)
  const goTo = useOnboardingStore((s) => s.goTo)

  const [formError, setFormError] = useState<string | null>(null)
  const industries = organizationService.getIndustryOptions()

  useEffect(() => {
    if (!isAdditional && !personal) goTo(1)
  }, [personal, goTo, isAdditional])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyForm>({ defaultValues: { name: '', address: '', industry: '' } })

  if (!isAdditional && user?.organizationId) return <Navigate to="/dashboard" replace />
  if (!isAdditional && !personal) return <Navigate to="/onboarding" replace />

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    if (!user) return

    try {
      const org = await organizationService.create({
        ...values,
        jobTitle: isAdditional ? 'Owner' : (personal?.jobTitle || 'Owner'),
        ownerId: user.id,
      })

      attachOrganization(org.id, org.name, isAdditional ? 'Owner' : (personal?.jobTitle || 'Owner'))
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

  const inputClass = (hasError: boolean) =>
    [
      'w-full bg-transparent border-0 border-b-2 pb-2.5 pt-1 text-[15px] text-gray-900 placeholder-gray-300 outline-none transition-all',
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200 focus:border-teal-500',
    ].join(' ')

  const formContent = (
    <form onSubmit={onSubmit} noValidate>
      {formError && (
        <div
          role="alert"
          className="mb-5 flex gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3"
        >
          <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-[12.5px] text-red-700 leading-relaxed">{formError}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Building size={12} className="text-gray-400 shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Company name
            </label>
          </div>
          <input
            type="text"
            autoComplete="organization"
            placeholder="Alderway Labs"
            className={inputClass(!!errors.name)}
            {...register('name', {
              required: 'Enter your company name.',
              minLength: { value: 2, message: 'That name looks too short.' },
            })}
          />
          {errors.name && (
            <p className="mt-1.5 text-[11.5px] text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Address
            </label>
          </div>
          <input
            type="text"
            autoComplete="street-address"
            placeholder="4 Wharf Road, London, E15 2QR"
            className={inputClass(!!errors.address)}
            {...register('address', { required: 'Enter your company address.' })}
          />
          {errors.address ? (
            <p className="mt-1.5 text-[11.5px] text-red-500">{errors.address.message}</p>
          ) : (
            <p className="mt-1.5 text-[11.5px] text-gray-400">Appears on payslips and offer letters.</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={12} className="text-gray-400 shrink-0" />
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Industry
            </label>
          </div>
          <select
            className={inputClass(!!errors.industry)}
            {...register('industry', { required: 'Choose an industry.' })}
          >
            <option value="" disabled className="text-gray-400">Select an industry</option>
            {industries.map((ind) => (
              <option key={ind.value} value={ind.value}>{ind.label}</option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1.5 text-[11.5px] text-red-500">{errors.industry.message}</p>
          )}
        </div>
      </div>

      {/* Info Pill */}
      <div className="mt-6 flex gap-2.5 rounded-xl bg-gray-50 border border-gray-100 p-3.5">
        <Sparkles size={14} className="mt-0.5 shrink-0 text-teal-600" aria-hidden="true" />
        <p className="text-[12px] leading-relaxed text-gray-500">
          You'll join as <span className="font-semibold text-gray-800">{user?.name}</span>,{' '}
          <span className="font-semibold text-gray-800">{isAdditional ? 'Owner' : personal?.jobTitle}</span> — the{' '}
          <span className="font-semibold text-gray-800">Owner</span> of this workspace.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={isSubmitting}
          className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-2xl px-6 py-2.5 text-[14px] font-bold text-white transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Creating workspace…
            </>
          ) : (
            'Create workspace'
          )}
        </button>
      </div>
    </form>
  )

  if (isAdditional) {
    return (
      <div className="mx-auto max-w-md pt-12">
        <h1 className="mb-2 text-2xl font-bold">Add Company</h1>
        <p className="mb-6 text-[14px] text-muted">Create an additional workspace.</p>
        {formContent}
      </div>
    )
  }

  return (
    <WizardShell
      current={2}
      title="Now, your company"
      subtitle="This creates your workspace. You'll be its owner, and you can invite your HR team and managers straight after."
    >
      {formContent}
    </WizardShell>
  )
}
