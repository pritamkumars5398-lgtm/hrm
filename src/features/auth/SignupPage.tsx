import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Check, Loader2 } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import { AuthError, authService, type User } from '@/services/authService'
import { useAuthStore } from './store/authStore'
import AuthLayout from './components/AuthLayout'
import GoogleButton from './components/GoogleButton'
import GoogleSignInDialog from './components/GoogleSignInDialog'
import { useGoogleSignIn } from './hooks/useGoogleSignIn'
import { hasGoogleOAuth } from '@/config/env'

type SignupForm = {
  fullName: string
  email: string
  password: string
}

/** Cheap, honest strength signal — not a security control. */
function strengthOf(password: string): { score: number; label: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (/\d/.test(password) && /[A-Za-z]/.test(password)) score++

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  return { score, label: labels[score] ?? 'Weak' }
}

export default function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)
  
  // For the simulated fallback only
  const [googleOpen, setGoogleOpen] = useState(false)

  // Real GIS flow
  const { signIn } = useGoogleSignIn({
    onSuccess: (user) => enter(user),
  })

  /**
   * A Google user who already has a company goes straight to it; a brand-new one
   * still owes us the onboarding wizard, which is what creates the org (§11.2).
   */
  const enter = (user: User) => {
    setSession(user)
    navigate(user.organizationId ? '/dashboard' : '/onboarding', { replace: true })
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ defaultValues: { fullName: '', email: '', password: '' } })

  const password = watch('password')
  const strength = strengthOf(password ?? '')

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      // Signing up creates a person, not yet a company — the wizard does that (§11.2).
      enter(await authService.signup(values))
    } catch (err) {
      setFormError(
        err instanceof AuthError ? err.message : 'Something went wrong. Please try again.',
      )
    }
  })

  return (
    <AuthLayout
      title="Create your company workspace"
      subtitle="You'll be the owner. Invite your HR team and managers once you're in."
      compact
      footer={
        <>
          Already have a workspace?{' '}
          <Link to="/login" className="font-medium text-pine hover:text-pine-deep">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <GoogleButton
          label="Sign up with Google"
          disabled={isSubmitting}
          onClick={() => {
            if (hasGoogleOAuth) signIn()
            else setGoogleOpen(true)
          }}
        />

        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-hairline" />
          <span className="text-[12px] text-muted">or with email</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        {formError && (
          <div
            role="alert"
            className="mb-4 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-2.5"
          >
            <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
            <p className="text-[13px] leading-relaxed text-clay">{formError}</p>
          </div>
        )}

        <div className="space-y-3">
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
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Enter your work email.',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'That does not look like an email.' },
            })}
          />

          <div>
            <Input
              label="Password"
              revealable
              autoComplete="new-password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register('password', {
                required: 'Choose a password.',
                minLength: { value: 8, message: 'Use at least 8 characters.' },
              })}
            />

            {password && !errors.password && (
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex flex-1 gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((n) => (
                    <span
                      key={n}
                      className={`h-1 flex-1 rounded-full ${
                        n <= strength.score ? 'bg-pine' : 'bg-hairline'
                      }`}
                    />
                  ))}
                </div>
                <span className="w-12 text-right text-[11px] text-muted">{strength.label}</span>
              </div>
            )}
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating your workspace…
            </>
          ) : (
            <>
              Continue
              <ArrowRight size={16} />
            </>
          )}
        </Button>

        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-muted">
          {['14-day free trial', 'No card required', 'Cancel any time'].map((p) => (
            <span key={p} className="flex items-center gap-1">
              <Check size={12} className="shrink-0 text-pine" aria-hidden="true" />
              {p}
            </span>
          ))}
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted">
          By continuing you agree to our{' '}
          <a href="#terms" className="text-ink underline underline-offset-2">
            Terms
          </a>{' '}
          and{' '}
          <a href="#privacy" className="text-ink underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
      </form>

      <GoogleSignInDialog
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onSignedIn={enter}
      />
    </AuthLayout>
  )
}
