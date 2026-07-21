import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowLeft, Loader2, Sparkles, Building, MapPin, Briefcase } from 'lucide-react'
import { OrganizationError, organizationService } from '@/services/organizationService'
import { useAuthStore } from '@/features/auth/store/authStore'
import WizardShell from './components/WizardShell'
import { useOnboardingStore } from './store/onboardingStore'
import SectionHeading from '@/shared/components/SectionHeading'

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

      attachOrganization(org.id, isAdditional ? 'Owner' : (personal?.jobTitle || 'Owner'), org.name)
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50/50">
        <div className="w-full max-w-[960px] overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-2xl shadow-teal-900/5 flex flex-col md:flex-row transition-all duration-300 hover:shadow-teal-900/10">
          
          {/* Left Panel: Branding & Context */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-600 p-8 sm:p-12 md:w-[400px] md:shrink-0">
            {/* Decorative background blurs */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl transition-transform duration-700 hover:scale-110" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl transition-transform duration-700 hover:scale-110" />
            
            <div className="relative z-10">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-xl border border-white/10">
                <Building className="text-white drop-shadow-md" size={32} />
              </div>
              <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-white drop-shadow-sm font-display">
                New Workspace
              </h1>
              <p className="text-[15px] leading-relaxed text-teal-50/90 max-w-[280px]">
                Create a new workspace and become its owner instantly. Set up your team and manage everything in one centralized place.
              </p>
            </div>
            
            <div className="relative z-10 mt-16 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 shadow-inner">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-white drop-shadow-sm">{user?.name}</p>
                  <p className="text-[13px] font-medium tracking-wide text-teal-100/80 uppercase mt-0.5">Will be Owner</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Form */}
          <div className="flex flex-1 flex-col justify-center p-8 sm:p-12 lg:px-16 bg-white">
            <SectionHeading
              label="Company Details"
              title="Add Company"
              intro="Please provide your company details to set up the new workspace."
              className="mb-8"
            />
            <div>
              {formContent}
            </div>
          </div>
        </div>
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
