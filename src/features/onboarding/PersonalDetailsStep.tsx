import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowRight } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
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
    // Don't make them retype the name they just gave us at signup.
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

  return (
    <WizardShell
      current={1}
      title="First, a little about you"
      subtitle="This is how your name and title appear to everyone you invite. You can change it later in Settings."
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Priya Nair"
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'Enter your name.',
              minLength: { value: 2, message: 'That name looks too short.' },
            })}
          />

          <Input
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="+44 7700 900123"
            hint="Used for account recovery and urgent approvals."
            error={errors.phone?.message}
            {...register('phone', {
              required: 'Enter a phone number.',
              pattern: {
                // Deliberately permissive — international formats vary wildly and a
                // strict regex here rejects real numbers.
                value: /^[+\d][\d\s()-]{6,}$/,
                message: 'That does not look like a phone number.',
              },
            })}
          />

          <Input
            label="Job title"
            autoComplete="organization-title"
            placeholder="Head of People"
            error={errors.jobTitle?.message}
            {...register('jobTitle', { required: 'Enter your job title.' })}
          />
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 border-t border-hairline pt-6">
          <p className="text-[12px] text-muted">Step 1 of 2</p>

          <Button type="submit" size="lg" disabled={isSubmitting}>
            Continue
            <ArrowRight size={16} />
          </Button>
        </div>
      </form>
    </WizardShell>
  )
}
