import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Building2, Loader2, MailX } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Logo from '@/shared/components/Logo'
import { TeamError, teamService, type InvitePreview } from '@/services/teamService'
import { useAuthStore } from './store/authStore'
import AuthLayout from './components/AuthLayout'

type AcceptForm = {
  fullName: string
  phone: string
  jobTitle: string
  password: string
}

const ROLE_LABEL: Record<string, string> = { HR: 'HR', MANAGER: 'Manager' }

/** The link is dead — expired, revoked, already used, or simply wrong. */
function InvalidInvite({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />

      <span className="mt-8 flex size-11 items-center justify-center rounded-full bg-wash">
        <MailX size={18} className="text-muted" aria-hidden="true" />
      </span>

      <h1 className="font-display mt-5 text-2xl font-semibold tracking-[-0.02em]">
        This invite isn't valid
      </h1>
      <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-muted">{message}</p>
      <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-muted">
        Ask whoever invited you to send a fresh link.
      </p>

      <Link
        to="/login"
        className="mt-7 text-[14px] font-medium text-pine hover:text-pine-deep"
      >
        Go to sign in
      </Link>
    </div>
  )
}

function LoadingInvite() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 size={22} className="animate-spin text-muted" aria-label="Loading invite" />
    </div>
  )
}

export default function AcceptInvitePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setSession = useAuthStore((s) => s.setSession)

  const token = searchParams.get('token') ?? ''

  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptForm>({
    defaultValues: { fullName: '', phone: '', jobTitle: '', password: '' },
  })

  useEffect(() => {
    if (!token) {
      setPreviewError('This link is missing its invite code.')
      return
    }

    let cancelled = false

    void teamService
      .previewInvite(token)
      .then((data) => {
        if (!cancelled) setPreview(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setPreviewError(
          err instanceof TeamError ? err.message : 'This invite link is not valid.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)

    try {
      const user = await teamService.acceptInvite({ token, ...values })
      setSession(user)
      // They join a company that already exists — no Company Details step (§14.2).
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setFormError(err instanceof TeamError ? err.message : 'We could not accept that invite.')
    }
  })

  if (previewError) return <InvalidInvite message={previewError} />
  if (!preview) return <LoadingInvite />

  return (
    <AuthLayout
      title={`Join ${preview.organizationName}`}
      subtitle={
        <>
          <span className="font-medium text-ink">{preview.invitedByName}</span> invited you. Set a
          password and tell us a little about yourself.
        </>
      }
      footer={
        <>
          Not you?{' '}
          <Link to="/login" className="font-medium text-pine hover:text-pine-deep">
            Sign in to a different account
          </Link>
        </>
      }
    >
      {/* Read-only: the inviter set these, and the invitee cannot change them (§14.2). */}
      <div className="rounded-card border border-hairline bg-wash p-4">
        <div className="flex items-center gap-2.5">
          <Building2 size={15} className="shrink-0 text-pine" aria-hidden="true" />
          <p className="text-[13px] font-medium">{preview.organizationName}</p>
        </div>

        <dl className="mt-3 space-y-1.5 border-t border-hairline pt-3">
          <div className="flex justify-between gap-3">
            <dt className="text-[12px] text-muted">Email</dt>
            <dd className="truncate text-[12px] font-medium">{preview.email}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[12px] text-muted">Role</dt>
            <dd className="text-[12px] font-medium">
              {ROLE_LABEL[preview.role] ?? preview.role}
            </dd>
          </div>
        </dl>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6">
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
            label="Full name"
            autoComplete="name"
            placeholder="Jo Bennett"
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
            error={errors.phone?.message}
            {...register('phone', { required: 'Enter a phone number.' })}
          />

          <Input
            label="Job title"
            autoComplete="organization-title"
            placeholder="Recruiter"
            error={errors.jobTitle?.message}
            {...register('jobTitle', { required: 'Enter your job title.' })}
          />

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
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Join {preview.organizationName}
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
