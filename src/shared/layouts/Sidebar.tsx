import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Layers, FormInput, Sparkles, Building2 } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import { navItemsFor, type NavItem, type ModuleKey } from '@/shared/config/navigation'
import type { Role } from '@/services/authService'

type SidebarProps = {
  permissions: string[]
  role: Role
  organizationName: string
  collapsed?: boolean
  onNavigate?: () => void
}

const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  HR: 'HR Manager',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

type GroupConfig = {
  key: string
  title: string
  icon: typeof Layers
  items: NavItem[]
}

export default function Sidebar({
  permissions,
  role,
  organizationName,
  collapsed = false,
  onNavigate,
}: SidebarProps) {
  const { pathname } = useLocation()
  const items = navItemsFor(permissions)

  const groups: GroupConfig[] = [
    {
      key: 'main',
      title: 'Core HR & Workforce',
      icon: Layers,
      items: items.filter((i) => i.group === 'main'),
    },
    {
      key: 'operations',
      title: 'Operations & Talent',
      icon: Building2,
      items: items.filter((i) => i.group === 'operations'),
    },
    {
      key: 'engagement',
      title: 'Engagement & Forms',
      icon: FormInput,
      items: items.filter((i) => i.group === 'engagement'),
    },
    {
      key: 'ai_saas',
      title: 'Intelligence & SaaS',
      icon: Sparkles,
      items: items.filter((i) => i.group === 'ai_saas'),
    },
    {
      key: 'admin',
      title: 'Administration',
      icon: Layers,
      items: items.filter((i) => i.group === 'admin'),
    },
  ]

  // Track expanded accordion categories (by default, expanding category containing current pathname)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const activeGroup = groups.find((g) => g.items.some((item) => pathname.startsWith(item.path)))?.key
    return {
      main: true,
      [activeGroup || 'operations']: true,
      engagement: true,
      ai_saas: true,
      admin: true,
    }
  })

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const orgInitials =
    organizationName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'EM'

  return (
    <div className="flex h-full flex-col border-r border-hairline bg-paper select-none">
      {/* Brand Header */}
      <div className={`flex h-16 shrink-0 items-center border-b border-hairline px-4 ${collapsed ? 'justify-center' : ''}`}>
        <Logo className={collapsed ? '[&>span:last-child]:hidden' : ''} />
      </div>

      {/* Org Badge */}
      {!collapsed && (
        <div className="border-b border-hairline bg-wash/30 px-4 py-3 flex items-center gap-3">
          <div className="size-8 rounded-xl flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-br from-emerald-600 to-teal-700 shadow-sm shrink-0">
            {orgInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-bold text-ink leading-none">{organizationName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-semibold text-muted uppercase">Role:</span>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                  role === 'OWNER'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : role === 'HR'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : role === 'MANAGER'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-wash text-muted border-hairline'
                }`}
              >
                {ROLE_LABEL[role]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Accordion Sections */}
      <nav aria-label="Modules" className={`flex-1 overflow-y-auto space-y-2 ${collapsed ? 'p-2' : 'p-3'}`}>
        {groups.map((group) => {
          const isOpen = openGroups[group.key] ?? false
          const hasActiveChild = group.items.some((item) =>
            item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)
          )

          if (collapsed) {
            return (
              <div key={group.key} className="space-y-1.5 border-b border-hairline/60 pb-2 mb-2 last:border-0">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      onClick={onNavigate}
                      title={item.label}
                      className={`flex size-9 items-center justify-center rounded-xl transition ${
                        isActive
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'text-muted hover:bg-wash hover:text-ink'
                      }`}
                    >
                      <Icon size={16} />
                    </NavLink>
                  )
                })}
              </div>
            )
          }

          return (
            <div key={group.key} className="rounded-xl border border-hairline/40 bg-wash/10 overflow-hidden">
              {/* Category Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left text-[11px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  hasActiveChild ? 'text-emerald-700 bg-emerald-500/5' : 'text-muted hover:text-ink hover:bg-wash/40'
                }`}
              >
                <span>{group.title}</span>
                <span className="text-muted">
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>

              {/* Collapsible Sub-menu */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden bg-surface"
                  >
                    <ul className="p-1 space-y-0.5 border-t border-hairline/30">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive =
                          item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)

                        return (
                          <li key={item.key}>
                            <NavLink
                              to={item.path}
                              onClick={onNavigate}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12.5px] transition ${
                                isActive
                                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                  : 'text-ink font-medium hover:bg-wash'
                              }`}
                            >
                              <Icon size={15} className={isActive ? 'text-white' : 'text-muted'} />
                              <span className="flex-1 truncate">{item.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}

                      {/* Explicit Form Builder Quick Action under Engagement */}
                      {group.key === 'engagement' && (
                        <li className="pt-1 mt-1 border-t border-hairline/40">
                          <NavLink
                            to="/dashboard/forms/builder"
                            onClick={onNavigate}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11.5px] font-bold text-indigo-600 hover:bg-indigo-50 transition"
                          >
                            <FormInput size={14} />
                            <span>+ Create New Form</span>
                          </NavLink>
                        </li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
