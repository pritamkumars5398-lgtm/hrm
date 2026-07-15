import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { KeyRound, Loader2, AlertCircle } from 'lucide-react'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import { authService, AuthError } from '@/services/authService'
import { useAuthStore } from './store/authStore'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setSession = useAuthStore((s) => s.setSession)
  
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  // If they somehow land here without needing a reset, send them away.
  if (!user?.requiresPasswordReset) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const onSubmit = async (values: any) => {
    try {
      setError(null)
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      
      // Update session locally to reflect that they no longer need a reset.
      setSession({
        ...user,
        requiresPasswordReset: false,
      } as any)
      
      navigate('/dashboard', { replace: true })
    } catch (err) {
      if (err instanceof AuthError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }

  return (
    <main className="flex min-h-screen bg-sand px-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-[400px] pt-12 pb-16 sm:py-16">
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-forest text-sand shadow-sm">
            <KeyRound size={24} />
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-center font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Set a new password
          </h1>
          <p className="mt-2 text-center text-[14px] text-muted">
            For security, you must set a new password before you can access your workspace.
          </p>

          {error && (
            <div className="mt-6 flex gap-2.5 rounded-ctl border border-clay/30 bg-clay/5 p-3">
              <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
              <p className="text-[13px] leading-relaxed text-clay">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
            <Input
              label="Temporary password"
              type="password"
              revealable
              error={errors.currentPassword?.message}
              {...register('currentPassword', { required: 'Enter your temporary password.' })}
            />

            <Input
              label="New password"
              type="password"
              revealable
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'Enter a new password.',
                minLength: {
                  value: 8,
                  message: 'Use at least 8 characters.',
                },
              })}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating…
                </>
              ) : (
                'Set password'
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
