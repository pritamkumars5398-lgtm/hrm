import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { organizationService, type Organization } from '@/services/organizationService'
import Breadcrumbs from './Breadcrumbs'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user)
  const { pathname } = useLocation()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    let cancelled = false

    void organizationService.getMine().then((org) => {
      if (!cancelled) setOrganization(org)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  // Someone who has not finished the wizard has no company to show (§11.2).
  if (user && !user.organizationId) {
    return <Navigate to="/onboarding" replace />
  }

  if (!user) return <Navigate to="/login" replace />

  const organizationName = organization?.name ?? 'Your company'

  return (
    <div className="flex min-h-dvh">
      {/* Desktop rail */}
      <aside className={`hidden shrink-0 lg:block transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
        <div className={`fixed inset-y-0 z-20 transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
          <Sidebar permissions={user.permissions} role={user.role} organizationName={organizationName} collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-ink/25"
              aria-hidden="true"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Navigation"
              initial={reduced ? false : { x: -260 }}
              animate={{ x: 0 }}
              exit={reduced ? undefined : { x: -260 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-60"
            >
              <Sidebar
                permissions={user.permissions}
                role={user.role}
                organizationName={organizationName}
                collapsed={false}
                onNavigate={() => setDrawerOpen(false)}
              />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="absolute top-4 -right-11 inline-flex size-9 items-center justify-center rounded-ctl border border-hairline bg-paper"
              >
                <X size={16} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          onOpenSidebar={() => setDrawerOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 bg-wash">
          <div className="border-b border-hairline bg-paper px-4 py-3 sm:px-6">
            <Breadcrumbs />
          </div>

          <div className="p-4 sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
