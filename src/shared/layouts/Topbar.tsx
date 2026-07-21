import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings, User, Building, Check, CheckCheck, ChevronDown, Plus } from 'lucide-react'
import Card from '@/shared/components/Card'
import { useAuthStore, type SessionUser } from '@/features/auth/store/authStore'
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore'
import { timeAgo } from '@/shared/utils/timeAgo'
import { notificationsService } from '@/services/notificationsService'
import { requestPushToken, onForegroundPush } from '@/config/firebase'
import { subscribeToNotifications } from '@/config/socket'

type TopbarProps = {
  user: SessionUser
  onOpenSidebar: () => void
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

const POLL_MS = 30000

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
  const { notifications, unreadCount, load: loadNotifications, markRead, markAllRead, receiveRealtime } = useNotificationsStore()

  const [openMenu, setOpenMenu] = useState<'profile' | 'notifications' | 'workspaces' | null>(null)
  const ref = useDismiss(() => setOpenMenu(null))

  useEffect(() => {
    void loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    // The actual real-time channel — a notification lands here the instant
    // it's created server-side. The poll below is just a safety net for a
    // dropped connection or a missed event, not the primary path anymore.
    return subscribeToNotifications(receiveRealtime)
  }, [receiveRealtime])

  useEffect(() => {
    const interval = setInterval(() => void loadNotifications({ force: true }), POLL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Silently no-ops with no Firebase web config, a denied permission
    // prompt, or an unsupported browser — push is a bonus channel on top of
    // the real in-app bell above, never required for it to work.
    void requestPushToken().then((token) => {
      if (token) void notificationsService.registerToken(token)
    })

    // A push landing while this tab is already open won't trigger the service
    // worker's background handler — refresh the bell immediately instead of
    // waiting up to POLL_MS for the next poll.
    return onForegroundPush(() => {
      void loadNotifications({ force: true })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        {/* Workspace Switcher — always visible so users can add a company */}
        <div className="relative mr-1">
          <button
            type="button"
            onClick={() => setOpenMenu((m) => (m === 'workspaces' ? null : 'workspaces'))}
            aria-label="Switch workspace"
            aria-expanded={openMenu === 'workspaces'}
            className="flex items-center gap-2 rounded-ctl border border-hairline bg-surface px-3 py-1.5 text-[13px] font-medium transition-colors hover:border-pine hover:bg-wash"
          >
            <Building size={14} className="text-muted" />
            <span className="truncate max-w-[120px]">
              {user.memberships.find((m) => m.organizationId === user.activeOrganizationId)?.organizationName || 'Workspace'}
            </span>
            <ChevronDown size={14} className="text-muted" />
          </button>

          {openMenu === 'workspaces' && (
            <Card overlay flush className="absolute right-0 mt-2 w-64 z-50">
              <p className="border-b border-hairline px-4 py-2.5 text-[12px] font-semibold text-muted tracking-wider">
                Workspaces
              </p>
              <ul className="py-1">
                {user.memberships.map((m) => {
                  const isActive = m.organizationId === user.activeOrganizationId
                  return (
                    <li key={m.organizationId}>
                      <button
                        type="button"
                        onClick={() => {
                          useAuthStore.getState().setActiveOrg(m.organizationId)
                          setOpenMenu(null)
                          // Force reload to refresh data for new workspace
                          window.location.href = '/dashboard'
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-wash ${
                          isActive ? 'bg-pine-tint/30 font-medium text-pine-deep' : 'text-ink'
                        }`}
                      >
                        <span className="truncate">{m.organizationName || 'Unknown Company'}</span>
                        {isActive && <Check size={14} className="text-pine shrink-0" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-hairline p-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null)
                    navigate('/dashboard/add-company')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-ctl px-3 py-2 text-left text-[13px] text-pine transition-colors hover:bg-pine-tint/30"
                >
                  <Plus size={15} />
                  Add Company
                </button>
              </div>
            </Card>
          )}
        </div>

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
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-pine" />
            )}
          </button>

          {openMenu === 'notifications' && (
            <Card overlay flush className="absolute right-0 mt-2 w-80">
              <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
                <p className="text-[12px] font-semibold">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="tnum ml-1.5 font-normal text-muted bg-wash px-1.5 py-0.2 rounded-full text-[11px]">
                      {unreadCount}
                    </span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="flex items-center gap-1 text-[11.5px] font-semibold text-pine hover:underline cursor-pointer"
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[13px] font-medium text-ink">Nothing yet</p>
                  <p className="mt-1 text-[12px] text-muted">
                    Leave, payroll, performance and document updates will show up here.
                  </p>
                </div>
              ) : (
                <ul className="max-h-96 overflow-y-auto">
                  {notifications.map((n) => {
                    const content = (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[13px] ${n.read ? 'text-muted font-medium' : 'text-ink font-bold'}`}>{n.title}</p>
                          {!n.read && <span className="mt-1 size-1.5 shrink-0 rounded-full bg-pine" />}
                        </div>
                        <p className="mt-0.5 text-[12px] text-muted">{n.body}</p>
                        <p className="tnum mt-1 text-[10.5px] text-muted/70 font-medium">{timeAgo(n.createdAt)}</p>
                      </>
                    )

                    const rowClass = 'block border-b border-hairline px-4 py-3 last:border-0 hover:bg-wash/50 transition-colors text-left w-full cursor-pointer'

                    return (
                      <li key={n.id}>
                        {n.link ? (
                          <Link
                            to={n.link}
                            onClick={() => {
                              setOpenMenu(null)
                              if (!n.read) void markRead(n.id)
                            }}
                            className={rowClass}
                          >
                            {content}
                          </Link>
                        ) : (
                          <button type="button" onClick={() => void markRead(n.id)} className={rowClass}>
                            {content}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
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
            {user.name.includes('Priya') ? (
              <img
                src="/priya_avatar.png"
                alt={user.name}
                className="size-7 rounded-full object-cover border border-hairline-strong shadow-sm"
              />
            ) : (
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-pine text-[11px] font-semibold text-white">
                {user.avatarInitials}
              </span>
            )}
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
