import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { X, Crown, Users, Target, CheckCircle2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { organizationService, type Organization } from '@/services/organizationService'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

type RoleContent = {
  title: string
  subtitle: string
  themeClass: string
  icon: typeof Crown
  message: string
  actionLabel: string
  points: string[]
}

const ROLE_WELCOME_CONTENT: Record<'OWNER' | 'HR' | 'MANAGER', RoleContent> = {
  OWNER: {
    title: 'Workspace Control Room',
    subtitle: 'Welcome back, Owner!',
    themeClass: 'from-indigo-500/10 to-purple-500/10 text-indigo-700 border-indigo-200/50 bg-indigo-50/50',
    icon: Crown,
    message: 'As the Workspace Owner, you have complete administrative control over the organization. Here is your priority checklist for today:',
    actionLabel: 'Enter Owner Controls',
    points: [
      'Approve pending leave requests from your team',
      'Manage organizational settings and roles configuration',
      'Review headspace headcount costs and trend statistics',
      'Oversee overall performance rating distribution'
    ]
  },
  HR: {
    title: 'People Hub Dashboard',
    subtitle: 'Welcome back, HR Manager!',
    themeClass: 'from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200/50 bg-emerald-50/50',
    icon: Users,
    message: 'Ready to support the team today? Keep the workspace running smoothly with these HR priority areas:',
    actionLabel: 'Enter People Hub',
    points: [
      'Track and log team daily attendance metrics',
      'Manage official company policy and contract documents',
      'Invite new team members and monitor pending invites',
      'Review cycle appraisals and appraisal submissions'
    ]
  },
  MANAGER: {
    title: 'Team Performance Portal',
    subtitle: 'Welcome back, Manager!',
    themeClass: 'from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/50 bg-amber-50/50',
    icon: Target,
    message: 'Help your department grow and excel. Here are your primary management actions today:',
    actionLabel: 'Enter Manager Portal',
    points: [
      'Submit feedback reviews for employees awaiting appraisal',
      'Monitor and align department performance target goals',
      'Track active leave schedules and upcoming team absences',
      'Check department headcount and resource allocations'
    ]
  }
}

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 24,
      stiffness: 280,
      staggerChildren: 0.08,
      delayChildren: 0.12
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -25,
    transition: { duration: 0.22, ease: 'easeInOut' }
  }
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 350 }
  }
}

export default function DashboardLayout() {
  const user = useAuthStore((s) => s.user)
  const { pathname } = useLocation()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
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

  // Show welcome modal once per role per session
  useEffect(() => {
    if (user) {
      const shown = sessionStorage.getItem(`welcome_shown_${user.role}_${user.id}`)
      if (shown !== 'true') {
        setShowWelcome(true)
      }
    }
  }, [user])

  // Auto-dismiss welcome screen after 3.5 seconds
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => {
        dismissWelcome()
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [showWelcome])

  const dismissWelcome = () => {
    if (user) {
      sessionStorage.setItem(`welcome_shown_${user.role}_${user.id}`, 'true')
    }
    setShowWelcome(false)
  }

  // Someone who has not finished the wizard has no company to show (§11.2).
  if (user && !user.organizationId) {
    return <Navigate to="/onboarding" replace />
  }

  if (!user) return <Navigate to="/login" replace />

  const organizationName = organization?.name ?? 'Your company'

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <motion.div
          key="welcome-phase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-paper p-4 overflow-hidden select-none"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative z-10 w-[470px] h-[470px] rounded-full bg-surface border shadow-overlay flex flex-col items-center justify-center p-11 text-center ${user.role === 'OWNER' ? 'border-indigo-500/30' : user.role === 'HR' ? 'border-emerald-500/30' : 'border-amber-500/30'}`}
          >
            {/* Orbiting Satellite Rings */}
            <div className="absolute inset-3 rounded-full border border-dashed border-wash/40 animate-spin [animation-duration:22s] pointer-events-none">
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full border border-surface shadow-[0_0_8px_currentColor] ${user.role === 'OWNER' ? 'bg-indigo-500 text-indigo-400' : user.role === 'HR' ? 'bg-emerald-500 text-emerald-400' : 'bg-amber-500 text-amber-400'}`} />
            </div>
            <div className="absolute inset-6 rounded-full border border-dashed border-wash/20 animate-spin [animation-duration:34s] [animation-direction:reverse] pointer-events-none">
              <div className={`absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 size-1.5 rounded-full border border-surface shadow-[0_0_6px_currentColor] ${user.role === 'OWNER' ? 'bg-purple-500 text-purple-400' : user.role === 'HR' ? 'bg-teal-500 text-teal-400' : 'bg-orange-500 text-orange-400'}`} />
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Circular Avatar Profile Badge with Role overlay */}
              <motion.div
                variants={itemVariants}
                className="relative size-16 flex items-center justify-center rounded-full border border-hairline-strong bg-wash text-[20px] font-bold text-ink shadow-sm"
              >
                {user.name.includes('Priya') ? (
                  <img
                    src="/priya_avatar.png"
                    alt={user.name}
                    className="size-full rounded-full object-cover"
                  />
                ) : (
                  user.avatarInitials
                )}
                
                {/* Small overlay circle indicating secure login role */}
                <div className={`absolute -bottom-0.5 -right-0.5 p-1 rounded-full text-white border border-surface shadow-sm z-10 ${user.role === 'OWNER' ? 'bg-indigo-600' : user.role === 'HR' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                  {user.role === 'OWNER' ? <Crown size={11} /> : user.role === 'HR' ? <Users size={11} /> : <Target size={11} />}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-1.5 mt-3 justify-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  AI Space Configured
                </span>
                <Sparkles size={11} className={user.role === 'OWNER' ? 'text-indigo-500 animate-pulse' : user.role === 'HR' ? 'text-emerald-500 animate-pulse' : 'text-amber-500 animate-pulse'} />
              </motion.div>

              <motion.h2 variants={itemVariants} className="font-display text-[24px] font-bold leading-tight mt-1 text-ink">
                Welcome back, <span className={`bg-clip-text text-transparent bg-gradient-to-r ${user.role === 'OWNER' ? 'from-indigo-600 to-purple-600' : user.role === 'HR' ? 'from-emerald-600 to-teal-600' : 'from-amber-600 to-orange-600'}`}>{user.name}</span>!
              </motion.h2>
              <motion.p variants={itemVariants} className="text-[13px] font-semibold text-muted/80 mt-0.5">
                {ROLE_WELCOME_CONTENT[user.role].subtitle}
              </motion.p>
            </div>

            {/* Pill Rows for priority scope items */}
            <motion.div variants={itemVariants} className="mt-4 space-y-1.5 max-w-[310px] w-full">
              {ROLE_WELCOME_CONTENT[user.role].points.slice(0, 2).map((point, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-wash/40 border border-hairline/30 text-left"
                >
                  <CheckCircle2
                    size={13}
                    className={`shrink-0 ${user.role === 'OWNER' ? 'text-indigo-500' : user.role === 'HR' ? 'text-emerald-500' : 'text-amber-500'}`}
                  />
                  <span className="text-[12px] font-bold text-muted-deep truncate">
                    {point}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Circular Countdown Loader Ring */}
            <motion.div variants={itemVariants} className="relative size-11 flex items-center justify-center mt-3.5">
              {/* Breath glow behind */}
              <div className={`absolute inset-1 rounded-full blur-[4px] opacity-10 animate-ping [animation-duration:2.5s] ${user.role === 'OWNER' ? 'bg-indigo-500' : user.role === 'HR' ? 'bg-emerald-500' : 'bg-amber-500'}`} />

              <svg className="absolute inset-0 size-full transform -rotate-90">
                <circle
                  cx="22"
                  cy="22"
                  r="19"
                  stroke="var(--color-wash)"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <motion.circle
                  cx="22"
                  cy="22"
                  r="19"
                  stroke={user.role === 'OWNER' ? '#6366f1' : user.role === 'HR' ? '#10b981' : '#f59e0b'}
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray={120}
                  initial={{ strokeDashoffset: 120 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 3.5, ease: 'linear' }}
                />
              </svg>
              <span className="text-[10px] font-bold text-muted">3s</span>
            </motion.div>

            {/* Enter Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.04, y: -0.5 }}
              whileTap={{ scale: 0.96 }}
              onClick={dismissWelcome}
              className={`mt-4 px-7 py-2.5 rounded-full text-white text-[13px] font-bold shadow-md transition-all cursor-pointer border border-transparent bg-gradient-to-r ${user.role === 'OWNER' ? 'from-indigo-600 to-purple-600 shadow-indigo-600/15 hover:from-indigo-700 hover:to-purple-700' : user.role === 'HR' ? 'from-emerald-600 to-teal-600 shadow-emerald-600/15 hover:from-emerald-700 hover:to-teal-700' : 'from-amber-600 to-orange-600 shadow-amber-600/15 hover:from-amber-700 hover:to-orange-700'}`}
            >
              Enter Workspace Now
            </motion.button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="dashboard-layout"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="flex min-h-dvh"
        >
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
              <div className="p-4 sm:p-6">
                <Outlet />
              </div>
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
