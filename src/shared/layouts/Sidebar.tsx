import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Layers, FormInput, Sparkles, Building2 } from 'lucide-react'
import Logo from '@/shared/components/Logo'
import { navItemsFor, type NavItem } from '@/shared/config/navigation'
import type { Role } from '@/services/authService'

type SidebarProps = {
  permissions: string[]
  role: Role
  organizationName: string
  collapsed?: boolean
  onNavigate?: () => void
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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const items = navItemsFor(permissions)

  const groups: GroupConfig[] = [
    {
      key: 'main',
      title: 'Core HR',
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

  // Find active item label for top header
  const activeItem = items.find((item) =>
    item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)
  )
  const pageTitle = activeItem?.label || 'Home'

  return (
    <div className="flex h-full flex-col border-r border-hairline bg-[#f9fafb] text-ink select-none w-[210px]">
      {/* Top Header: Current Page Title on Left, + Create button on Right (Matching Screenshot UI) */}
      <div className={`flex h-14 shrink-0 items-center border-b border-hairline px-3.5 ${collapsed ? 'justify-center' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-[15px] text-ink tracking-tight truncate max-w-[120px]">{pageTitle}</span>
          </div>
        ) : (
          <Logo className="[&>span:last-child]:hidden" />
        )}
      </div>

      {/* Navigation Accordion Sections */}
      <nav aria-label="Modules" className={`flex-1 overflow-y-auto space-y-1.5 ${collapsed ? 'p-1.5' : 'p-2'}`}>
        {groups.map((group) => {
          const isOpen = openGroups[group.key] ?? false
          const hasActiveChild = group.items.some((item) =>
            item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)
          )

          if (collapsed) {
            return (
              <div key={group.key} className="space-y-1 border-b border-hairline/60 pb-1.5 mb-1.5 last:border-0">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)
                  return (
                    <NavLink
                      key={item.key}
                      to={item.path}
                      onClick={onNavigate}
                      title={item.label}
                      className={`flex size-8 items-center justify-center rounded-lg transition ${
                        isActive
                          ? 'bg-gray-200 text-ink font-bold shadow-2xs'
                          : 'text-muted hover:bg-wash hover:text-ink'
                      }`}
                    >
                      <Icon size={15} />
                    </NavLink>
                  )
                })}
              </div>
            )
          }

          return (
            <div key={group.key} className="rounded-lg border border-hairline/50 bg-white/70 overflow-hidden">
              {/* Category Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer ${
                  hasActiveChild ? 'text-ink bg-gray-100/70' : 'text-muted hover:text-ink hover:bg-wash/50'
                }`}
              >
                <span>{group.title}</span>
                <span className="text-muted">
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
              </button>

              {/* Collapsible Sub-menu */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeInOut' }}
                    className="overflow-hidden bg-white"
                  >
                    <ul className="p-1 space-y-0.5 border-t border-hairline/40">
                      {group.items.map((item) => {
                        const Icon = item.icon
                        const isActive =
                          item.key === 'dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path)

                        return (
                          <li key={item.key}>
                            <NavLink
                              to={item.path}
                              onClick={onNavigate}
                              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] transition ${
                                isActive
                                  ? 'bg-[#e5e7eb] text-ink font-bold shadow-2xs'
                                  : 'text-gray-700 font-medium hover:bg-gray-100/80 hover:text-ink'
                              }`}
                            >
                              <Icon size={14} className={isActive ? 'text-ink' : 'text-gray-500'} />
                              <span className="flex-1 truncate">{item.label}</span>
                            </NavLink>
                          </li>
                        )
                      })}

                      {/* Form Builder Quick Action */}
                      {group.key === 'engagement' && (
                        <li className="pt-1 mt-1 border-t border-hairline/40">
                          <NavLink
                            to="/dashboard/forms/builder"
                            onClick={onNavigate}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 transition"
                          >
                            <FormInput size={13} />
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
