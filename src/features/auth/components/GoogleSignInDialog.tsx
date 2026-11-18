import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Modal from '@/shared/components/Modal'
import { authService, type GoogleAccount, type User } from '@/services/authService'

type GoogleSignInDialogProps = {
  open: boolean
  onClose: () => void
  onSignedIn: (user: User) => void
  comingSoon?: boolean
}

/**
 * Deliberately styled as Keystone, not as Google. A faithful replica of Google's
 * account chooser is the exact shape of a credential-phishing page, and this is a
 * simulation with no real OAuth behind it — so it says so, plainly.
 */
export default function GoogleSignInDialog({
  open,
  onClose,
  onSignedIn,
  comingSoon = false,
}: GoogleSignInDialogProps) {
  const [pending, setPending] = useState<string | null>(null)
  const accounts = authService.getSimulatedGoogleAccounts()

  if (comingSoon) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Google Sign-In"
        description="Coming soon"
      >
        <div className="space-y-4">
          <div className="rounded-ctl border border-hairline bg-wash p-4 text-center">
            <span className="inline-block rounded-full bg-pine-tint px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-pine-deep">
              Coming soon
            </span>
            <p className="mt-2.5 text-[13px] leading-relaxed text-muted">
              Google Sign-In is coming soon. Please sign in with your work email and password in the meantime.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-ctl border border-hairline-strong bg-surface px-4 py-2 text-[13px] font-medium transition-colors hover:bg-wash"
          >
            Got it
          </button>
        </div>
      </Modal>
    )
  }

  const choose = async (account: GoogleAccount) => {
    setPending(account.email)
    try {
      const user = await authService.loginWithGoogle(account)
      onSignedIn(user)
    } finally {
      setPending(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simulated Google Sign-In"
      description="Real OAuth arrives with the backend. Pick an account to continue the flow."
    >
      <ul className="space-y-2">
        {accounts.map((a) => {
          const isPending = pending === a.email
          return (
            <li key={a.email}>
              <button
                type="button"
                onClick={() => void choose(a)}
                disabled={pending !== null}
                className="flex w-full items-center gap-3 rounded-ctl border border-hairline bg-surface p-3 text-left transition-colors hover:border-pine hover:bg-wash disabled:pointer-events-none disabled:opacity-60"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-tint text-[12px] font-semibold text-pine-deep">
                  {a.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{a.name}</span>
                  <span className="block truncate text-[12px] text-muted">{a.email}</span>
                </span>

                {isPending ? (
                  <Loader2 size={15} className="shrink-0 animate-spin text-pine" />
                ) : (
                  <span className="shrink-0 text-[11px] whitespace-nowrap text-muted">{a.note}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
