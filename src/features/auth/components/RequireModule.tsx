import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { canAccess, type ModuleKey } from '@/shared/config/navigation'

/**
 * Guards a module route against a role that should not reach it. Hiding the
 * sidebar link is presentation; this is the check that matters when someone
 * types the URL.
 *
 * Still client-side — the authoritative version is the backend refusing the
 * request. That arrives with each module's real API in Phase 2.
 */
export default function RequireModule({
  module,
  children,
}: {
  module: ModuleKey
  children: ReactNode
}) {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  if (!canAccess(user.permissions, module)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-wash">
            <ShieldOff size={18} className="text-muted" aria-hidden="true" />
          </span>

          <h1 className="font-display mt-5 text-xl font-semibold tracking-[-0.01em]">
            You don't have access to this
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Your role doesn't include this module. If you think that's wrong, ask an owner or admin
            to update your permissions.
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex text-[14px] font-medium text-pine hover:text-pine-deep"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
