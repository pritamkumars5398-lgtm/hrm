import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import { AuthError, authService } from '@/services/authService'
import { useAuthStore } from './store/authStore'
import AuthLayout from './components/AuthLayout'
import GoogleButton from './components/GoogleButton'

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })

  const demo = authService.getDemoCredentials()

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      const user = await authService.login(values)
      setSession(user)
      // Someone who has not finished the wizard has no company yet (§11.2).
      navigate(user.organizationId ? '/dashboard' : '/onboarding', { replace: true })
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

  return (
    <AuthLayout
      title="Sign in to Keystone"
      subtitle="Pick up where your company left off."
      compact
      footer={
        <>
          Don't have a workspace yet?{' '}
          <Link to="/signup" className="font-medium text-pine hover:text-pine-deep">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <GoogleButton
          label="Continue with Google"
          disabled={isSubmitting}
          onClick={() => setFormError('Google Sign-In is not wired up yet — use a demo account.')}
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
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password', { required: 'Enter your password.' })}
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-[12px] text-muted hover:text-ink"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="mt-4 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>

      {/* Demo affordance — lets a reviewer switch roles without knowing the seeds. */}
      <div className="mt-4 rounded-card border border-hairline bg-wash p-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-ink">Demo accounts</p>
          <p className="text-[11px] text-muted">
            Password: <code className="tnum font-medium text-ink">{demo.password}</code>
          </p>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {demo.accounts.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => applyDemoAccount(a.email)}
              className="rounded-ctl border border-hairline-strong bg-surface px-2 py-0.5 text-[11px] font-medium transition-colors hover:border-pine hover:text-pine"
            >
              {a.role.charAt(0) + a.role.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
