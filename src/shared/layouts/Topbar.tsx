import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings, User } from 'lucide-react'
import Card from '@/shared/components/Card'
import { useAuthStore, type SessionUser } from '@/features/auth/store/authStore'

type TopbarProps = {
  user: SessionUser
  onOpenSidebar: () => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

const NOTIFICATIONS = [
  { id: 'n1', title: 'Leave request from Samuel Okafor', meta: '5 days annual · 18–22 Mar' },
  { id: 'n2', title: 'March payroll is ready to review', meta: '248 employees · £847,204' },
  { id: 'n3', title: 'Marta Lindqvist completed onboarding', meta: 'Yesterday' },
]

/** Closes a popover on outside click or Escape. */
function useDismiss(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onDismiss])

  return ref
}

export default function Topbar({
  user,
  onOpenSidebar,
  sidebarCollapsed = false,
  onToggleSidebar,
}: TopbarProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  const [openMenu, setOpenMenu] = useState<'profile' | 'notifications' | null>(null)
  const ref = useDismiss(() => setOpenMenu(null))

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-hairline bg-paper px-4 sm:px-6">
      {/* Mobile Menu button */}
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="inline-flex size-9 items-center justify-center rounded-ctl border border-hairline lg:hidden"
      >
        <Menu size={17} />
      </button>

      {/* Desktop Collapse Toggle button */}
      {onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden size-9 items-center justify-center rounded-ctl border border-hairline text-muted transition-colors hover:bg-wash hover:text-ink lg:inline-flex"
        >
          <Menu size={17} className={`transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search
          size={15}
          aria-hidden="true"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          placeholder="Search people, documents…"
          aria-label="Search"
          className="h-9 w-full rounded-ctl border border-hairline bg-surface pr-3 pl-9 text-[13.5px] transition-colors placeholder:text-muted/70 hover:border-muted/40 focus:border-pine"
        />
      </div>

      <div ref={ref} className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((m) => (m === 'notifications' ? null : 'notifications'))}
            aria-label="Notifications"
            aria-expanded={openMenu === 'notifications'}
            className="relative inline-flex size-9 items-center justify-center rounded-ctl text-muted transition-colors hover:bg-wash hover:text-ink"
          >
            <Bell size={17} />
            <span className="absolute top-2 right-2 size-1.5 rounded-full bg-pine" />
          </button>

          {openMenu === 'notifications' && (
            <Card overlay flush className="absolute right-0 mt-2 w-80">
              <p className="border-b border-hairline px-4 py-2.5 text-[12px] font-semibold">
                Notifications
              </p>
              <ul>
                {NOTIFICATIONS.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-hairline px-4 py-3 last:border-0 hover:bg-wash"
                  >
                    <p className="text-[13px] font-medium">{n.title}</p>
                    <p className="tnum mt-0.5 text-[12px] text-muted">{n.meta}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu((m) => (m === 'profile' ? null : 'profile'))}
            aria-label="Account menu"
            aria-expanded={openMenu === 'profile'}
            className="flex items-center gap-2 rounded-ctl py-1 pr-2 pl-1 transition-colors hover:bg-wash"
          >
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-pine text-[11px] font-semibold text-white">
              {user.avatarInitials}
            </span>
            <span className="hidden text-[13px] font-medium sm:block">{user.name}</span>
          </button>

          {openMenu === 'profile' && (
            <Card overlay flush className="absolute right-0 mt-2 w-56">
              <div className="border-b border-hairline px-4 py-3">
                <p className="truncate text-[13px] font-medium">{user.name}</p>
                <p className="truncate text-[12px] text-muted">{user.email}</p>
              </div>

              <ul className="p-1">
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-ctl px-3 py-2 text-left text-[13px] text-muted transition-colors hover:bg-wash hover:text-ink"
                  >
                    <User size={15} />
                    Your profile
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-ctl px-3 py-2 text-left text-[13px] text-muted transition-colors hover:bg-wash hover:text-ink"
                  >
                    <Settings size={15} />
                    Preferences
                  </button>
                </li>
              </ul>

              <div className="border-t border-hairline p-1">
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="flex w-full items-center gap-2.5 rounded-ctl px-3 py-2 text-left text-[13px] text-clay transition-colors hover:bg-clay/5"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </header>
  )
}
