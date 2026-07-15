import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import { AuthError, authService, type User } from '@/services/authService'
import { useAuthStore } from './store/authStore'
import AuthLayout from './components/AuthLayout'
import GoogleButton from './components/GoogleButton'
import GoogleSignInDialog from './components/GoogleSignInDialog'
import { useGoogleSignIn } from './hooks/useGoogleSignIn'
import { hasGoogleOAuth } from '@/config/env'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)
  const [googleOpen, setGoogleOpen] = useState(false)

  const { signIn } = useGoogleSignIn({
    onSuccess: (user) => enter(user),
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })

  const demo = authService.getDemoCredentials()

  const enter = (user: User) => {
    setSession(user)
    navigate(user.organizationId ? '/dashboard' : '/onboarding', { replace: true })
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      enter(await authService.login(values))
    } catch (err) {
      setFormError(
        err instanceof AuthError ? err.message : 'Something went wrong. Please try again.',
      )
    }
  })

  const applyDemoAccount = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', demo.password, { shouldValidate: true })
    setFormError(null)
  }

  // Shared input style — underline style, clean and open
  const inputClass = (hasError: boolean) =>
    [
      'w-full bg-transparent border-0 border-b-2 pb-2 pt-1 text-[15px] text-gray-900 placeholder-gray-300 outline-none transition-all',
      hasError
        ? 'border-red-400 focus:border-red-500'
        : 'border-gray-200 focus:border-teal-500',
    ].join(' ')

  return (
    <AuthLayout
      title="Welcome back "
      subtitle="Sign in to your Keystone workspace and pick up where you left off."
      reverse
      image="/hrm-login.png"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-teal-600 hover:text-teal-700 transition-colors">
            Create one free →
          </Link>
        </>
      }
    >
      <div className="space-y-5">

        {/* Google SSO */}
        <GoogleButton
          label="Continue with Google"
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

        {/* Fields */}
        <form onSubmit={onSubmit} noValidate className="space-y-6">

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Work email
            </label>
            <input
              id="login-email"
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11.5px] font-semibold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputClass(!!errors.password)}
                {...register('password', { required: 'Enter your password.' })}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-0 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
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
            {errors.password && (
              <p className="mt-1.5 text-[11.5px] text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
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
                Signing in…
              </>
            ) : (
              <>
                Sign in to Keystone
                <ArrowRight size={16} />
              </>
            )}
          </button>
          {/* Sign-up link */}

        </form>

        {/* Demo accounts */}
        <div className="pt-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
            Try a demo account
            <span className="normal-case tracking-normal font-normal ml-2 text-gray-300">
              pw: <code className="font-mono text-gray-500">{demo.password}</code>
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {demo.accounts.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => applyDemoAccount(a.email)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-gray-600 transition-all hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700 shadow-sm"
              >
                {a.role.charAt(0) + a.role.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

      </div>

      <GoogleSignInDialog
        open={googleOpen}
        onClose={() => setGoogleOpen(false)}
        onSignedIn={enter}
      />
    </AuthLayout>
  )
}
