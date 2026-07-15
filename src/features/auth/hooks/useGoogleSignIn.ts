import { useEffect, useRef, useCallback } from 'react'
import { env, hasGoogleOAuth } from '@/config/env'
import type { User } from '@/services/authService'

type UseGoogleSignInOptions = {
  onSuccess: (user: User) => void
}

/**
 * Initialises the GIS SDK once and returns a `signIn()` function that opens
 * the Google account-chooser popup when called.
 *
 * We no longer use the invisible-button overlay trick (`renderButton` +
 * `opacity-0`) because that approach silently breaks when the origin isn't
 * whitelisted yet, or when the GIS iframe fails to mount. Instead we call
 * `google.accounts.id.prompt()` directly from our own button's onClick,
 * which is fully programmatic and works on any authorised origin.
 */
export function useGoogleSignIn({ onSuccess }: UseGoogleSignInOptions) {
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  const initialized = useRef(false)

  useEffect(() => {
    if (!hasGoogleOAuth || !window.google || initialized.current) return

    initialized.current = true

    window.google.accounts.id.initialize({
      client_id: env.googleClientId!,
      callback: async (response) => {
        try {
          const { authService } = await import('@/services/authService')
          const user = await authService.loginWithGoogle({ credential: response.credential })
          onSuccessRef.current(user)
        } catch (error) {
          console.error('Google sign-in failed during backend verification:', error)
        }
      },
      // Cancel the One Tap auto-prompt — we only want explicit button clicks.
      cancel_on_tap_outside: true,
    })
  }, [])

  /** Call this from your button's onClick to open the Google account chooser. */
  const signIn = useCallback(() => {
    if (!hasGoogleOAuth || !window.google) return
    window.google.accounts.id.prompt()
  }, [])

  return { signIn }
}
