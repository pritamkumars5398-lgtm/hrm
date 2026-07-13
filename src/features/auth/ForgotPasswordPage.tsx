import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowLeft, ArrowRight, Check, Copy, Loader2, MailCheck } from 'lucide-react'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import { authService } from '@/services/authService'
import AuthLayout from './components/AuthLayout'

type ForgotForm = { email: string }

type Sent = {
  email: string
  /** null when no account matched — the UI must not reveal that either way. */
  resetLink: string | null
}

/**
 * Prototype-only. In production the link is emailed and never rendered; there is
 * no SMTP in this phase (§11.3), so we surface it to keep the flow demoable.
 * Note this does reveal whether an account exists — acceptable in the prototype,
 * and it disappears the moment real email sending lands.
 */
function DemoResetLink({ resetLink }: { resetLink: string | null }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!resetLink) return
    await navigator.clipboard.writeText(resetLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-6 rounded-card border border-hairline bg-wash p-4">
      <p className="text-[12px] font-medium">Prototype shortcut</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        No email is actually sent in this phase. A real deployment emails this link and never shows
        it on screen.
      </p>

      {resetLink ? (
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 truncate rounded-ctl border border-hairline bg-surface px-2.5 py-1.5 text-[12px] text-muted">
            {resetLink}
          </code>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-2.5 text-[12px] font-medium transition-colors hover:border-pine hover:text-pine"
          >
            {copied ? <Check size={13} className="text-pine" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-[12px] text-muted">
          No account matched that email, so no link was generated.
        </p>
      )}
    </div>
  )
}

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState<Sent | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ defaultValues: { email: '' } })

  const onSubmit = handleSubmit(async ({ email }) => {
    setFormError(null)
    try {
      const { resetLink } = await authService.requestPasswordReset({ email })
      setSent({ email: email.trim(), resetLink })
    } catch {
      setFormError('Something went wrong. Please try again.')
    }
  })

  const backToSignIn = (
    <Link
      to="/login"
      className="inline-flex items-center gap-1.5 font-medium text-pine hover:text-pine-deep"
    >
      <ArrowLeft size={14} />
      Back to sign in
    </Link>
  )

  // The confirmation is identical whether or not the account exists.
  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={
          <>
            If an account exists for <span className="font-medium text-ink">{sent.email}</span>,
            we've sent a link to reset its password. The link expires in 30 minutes.
          </>
        }
        footer={backToSignIn}
      >
        <div className="flex items-start gap-3 rounded-card border border-hairline bg-surface p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-tint">
            <MailCheck size={16} className="text-pine" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[13px] font-medium">Didn't get it?</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              Check your spam folder, or{' '}
              <button
                type="button"
                onClick={() => void onSubmit()}
                className="font-medium text-pine underline underline-offset-2 hover:text-pine-deep"
              >
                send it again
              </button>
              .
            </p>
          </div>
        </div>

        <DemoResetLink resetLink={sent.resetLink} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email you use for Keystone and we'll send you a link to set a new password."
      footer={backToSignIn}
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

        <Input
          label="Work email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          defaultValue={getValues('email')}
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your work email.',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'That does not look like an email.' },
          })}
        />

        <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending link…
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
