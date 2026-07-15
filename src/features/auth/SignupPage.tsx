import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Check, Loader2 } from 'lucide-react'
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

function strengthOf(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (/\d/.test(password) && /[A-Za-z]/.test(password)) score++

  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-teal-400', 'bg-emerald-500']
  return { score, label: labels[score] ?? 'Weak', color: colors[score] ?? 'bg-red-400' }
}

export default function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [googleOpen, setGoogleOpen] = useState(false)

  const { signIn } = useGoogleSignIn({
    onSuccess: (user) => enter(user),
  })

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
      enter(await authService.signup(values))
    } catch (err) {
      setFormError(
        err instanceof AuthError ? err.message : 'Something went wrong. Please try again.',
      )
    }
  })

  // Shared input style — boxed layout
  const inputClass = (hasError: boolean) =>
    [
      'w-full rounded-xl border px-3.5 py-2.5 text-[13.5px] text-gray-900 placeholder-gray-400 outline-none transition-all',
      'focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white',
      hasError
        ? 'border-red-300 bg-red-50/40'
        : 'border-gray-200 bg-gray-50 hover:border-gray-300',
    ].join(' ')

  return (
    <AuthLayout
      title="Create your workspace "
      subtitle="You'll be the owner. Invite your HR team and managers once you're in."
      compact
      footer={
        <>
          Already have a workspace?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Sign in →
          </Link>
        </>
      }
    >
      <div className="space-y-5">

        {/* Google SSO */}
        <GoogleButton
          label="Sign up with Google"
          disabled={isSubmitting}
          onClick={() => {
            if (hasGoogleOAuth) signIn()
            else setGoogleOpen(true)
          }}
        />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">or</span>
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Error */}
        {formError && (
          <div role="alert" className="flex gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[12.5px] text-red-700 leading-relaxed">{formError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} noValidate className="space-y-4">

          {/* Full name */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              placeholder="Priya Nair"
              className={inputClass(!!errors.fullName)}
              {...register('fullName', {
                required: 'Enter your name.',
                minLength: { value: 2, message: 'Name is too short.' },
              })}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Work email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Work email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className={inputClass(!!errors.email)}
              {...register('email', {
                required: 'Enter your work email.',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Not a valid email.' },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={[inputClass(!!errors.password), 'pr-10'].join(' ')}
                {...register('password', {
                  required: 'Choose a password.',
                  minLength: { value: 8, message: 'Use at least 8 characters.' },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPass ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength bar */}
            {password && !errors.password && (
              <div className="mt-3 space-y-1.5">
                <div className="flex gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : 'bg-gray-200'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400">
                  Strength: <span className="font-semibold text-gray-600">{strength.label}</span>
                </p>
              </div>
            )}

            {errors.password && (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3 text-[14.5px] font-bold text-white transition-all duration-200 disabled:opacity-60 active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating workspace…
              </>
            ) : (
              <>
                Create my workspace
                <ArrowRight size={16} />
              </>
            )}
          </button>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-between gap-y-1.5">
            {['14-day free trial', 'No card required', 'Cancel any time'].map((p) => (
              <span key={p} className="flex items-center gap-1.5 text-[11.5px] text-gray-400">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-teal-100">
                  <Check size={9} className="text-teal-600" />
                </span>
                {p}
              </span>
            ))}
          </div>

          {/* Legal */}
          {/* <p className="text-[11px] leading-relaxed text-gray-400">
            By continuing you agree to our{' '}
            <a href="#terms" className="text-gray-600 underline underline-offset-2 hover:text-teal-600 transition-colors">
              Terms
            </a>{' '}
            and{' '}
            <a href="#privacy" className="text-gray-600 underline underline-offset-2 hover:text-teal-600 transition-colors">
              Privacy Policy
            </a>
            .
          </p> */}

          {/* Sign-in link */}
          {/* <div className="pt-2 border-t border-gray-100 text-center">
            <p className="text-[13px] text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Sign in →
              </Link>
            </p>
          </div> */}
        </form>
      </div>

      <GoogleSignInDialog
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onSignedIn={enter}
      />
    </AuthLayout>
  )
}
