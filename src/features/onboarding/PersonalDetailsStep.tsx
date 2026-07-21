import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight, Loader2, User, Phone, Briefcase } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import WizardShell from './components/WizardShell'
import { useOnboardingStore, type PersonalDetails } from './store/onboardingStore'

export default function PersonalDetailsStep() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const personal = useOnboardingStore((s) => s.personal)
  const setPersonal = useOnboardingStore((s) => s.setPersonal)
  const goTo = useOnboardingStore((s) => s.goTo)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PersonalDetails>({
    defaultValues: personal ?? {
      fullName: user?.name ?? '',
      phone: '',
      jobTitle: '',
    },
  })

  const onSubmit = handleSubmit((values) => {
    setPersonal(values)
    goTo(2)
    navigate('/onboarding/company')
  })

  if (user?.organizationId) {
    return <Navigate to="/dashboard" replace />
  }

  const inputClass = (hasError: boolean) =>
    [
      'w-full bg-transparent border-0 border-b-2 pb-2.5 pt-1 text-[15px] text-gray-900 placeholder-gray-300 outline-none transition-all',
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200 focus:border-teal-500',
    ].join(' ')

  return (
    <WizardShell
      current={1}
      title="First, a little about you"
      subtitle="This is how your name and title appear to everyone you invite. You can change this later in Settings."
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-7">

          {/* Full name */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <User size={12} className="text-gray-400 shrink-0" />
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Full name
              </label>
            </div>
            <input
              type="text"
              autoComplete="name"
              placeholder="Priya Nair"
              className={inputClass(!!errors.fullName)}
              {...register('fullName', {
                required: 'Enter your name.',
                minLength: { value: 2, message: 'That name looks too short.' },
              })}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Phone size={12} className="text-gray-400 shrink-0" />
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Phone number
              </label>
            </div>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              className={inputClass(!!errors.phone)}
              {...register('phone', {
                required: 'Enter a phone number.',
                pattern: {
                  value: /^[+\d][\d\s()-]{6,}$/,
                  message: 'That does not look like a phone number.',
                },
              })}
            />
            {errors.phone ? (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.phone.message}</p>
            ) : (
              <p className="mt-1.5 text-[11.5px] text-gray-400">Used for account recovery and urgent approvals.</p>
            )}
          </div>

          {/* Job title */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={12} className="text-gray-400 shrink-0" />
              <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Job title
              </label>
            </div>
            <input
              type="text"
              autoComplete="organization-title"
              placeholder="Head of People"
              className={inputClass(!!errors.jobTitle)}
              {...register('jobTitle', { required: 'Enter your job title.' })}
            />
            {errors.jobTitle && (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.jobTitle.message}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[12px] text-gray-400">
            Your data is encrypted and stored securely.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2.5 rounded-2xl px-6 py-2.5 text-[14px] font-bold text-white transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </WizardShell>
  )
}
