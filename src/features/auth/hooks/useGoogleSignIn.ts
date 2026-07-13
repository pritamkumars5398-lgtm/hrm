import { useEffect, useRef } from 'react'
import { env, hasGoogleOAuth } from '@/config/env'
import type { User } from '@/services/authService'

type UseGoogleSignInOptions = {
  onSuccess: (user: User) => void
}

/**
 * Replaces the fake dialog with the real Google Identity Services (GIS) flow.
 *
 * Uses the new `accounts.google.com/gsi/client` SDK, which is loaded via a
 * script tag in `index.html`.
 */
export function useGoogleSignIn({ onSuccess }: UseGoogleSignInOptions) {
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess
  const buttonWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasGoogleOAuth || !window.google || !buttonWrapperRef.current) return

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
    })

    // GIS does not allow programmatically opening the auth popup. To use our own
    // custom-styled button, we render the official Google button completely
    // transparent and position it exactly over our custom button.
    window.google.accounts.id.renderButton(buttonWrapperRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 400, // Make it wide enough to cover our button
    })
  }, [])

  return { buttonWrapperRef }
}
