import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * Client-side guard only — it stops a signed-out person landing on a screen that
 * assumes a session, nothing more. The real protection is the backend refusing
 * requests without a valid JWT, which arrives with that §4 item.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const user = useAuthStore.getState().user
  if (user?.requiresPasswordReset && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />
  }

  return <>{children}</>
}
