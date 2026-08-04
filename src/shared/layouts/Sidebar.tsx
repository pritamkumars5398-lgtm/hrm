import { NavLink } from 'react-router-dom'
import Logo from '@/shared/components/Logo'
import { navItemsFor, type NavItem } from '@/shared/config/navigation'
import type { Role } from '@/services/authService'

type SidebarProps = {
  permissions: string[]
  role: Role // For display only
  organizationName: string
  collapsed?: boolean
  /** Closes the drawer after navigating on mobile. */
  onNavigate?: () => void
}

// ROLE_LABEL constant removed as it is unused

function NavSection({
  items,
  collapsed = false,
  onNavigate,
}: {
  items: NavItem[]
  collapsed?: boolean
  onNavigate?: () => void
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <li key={item.key}>
            <NavLink
              to={item.path}
              end={item.key === 'dashboard'}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `group flex items-center relative transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#10b981] to-[#15803d] font-semibold text-white shadow-sm shadow-emerald-500/10'
                    : 'text-muted hover:bg-wash hover:text-ink'
                } ${
                  collapsed
                    ? 'h-9 w-9 justify-center rounded-full mx-auto p-0'
                    : 'gap-3 rounded-ctl px-3 py-2.5 text-[13.5px]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Left Active vertical highlight strip */}
                  {isActive && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full" />
                  )}
                  
                  <Icon
                    size={16}
                    className={`transition-all duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-muted group-hover:text-emerald-600'
                    }`}
                  />
                  {!collapsed && (
                    <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Rendered entirely from the role → module matrix (§15.2, Hard Rule 6). There is
 * no hardcoded list here: change ROLE_MODULES and this changes with it.
 */
export default function Sidebar({
  permissions,
  role: _role,
  organizationName: _organizationName,
  collapsed = false,
  onNavigate,
}: SidebarProps) {
  const items = navItemsFor(permissions)
  const main = items.filter((i) => i.group === 'main')
  const admin = items.filter((i) => i.group === 'admin')

  return (
    <div className="flex h-full flex-col border-r border-hairline bg-paper">
      <div className={`flex h-16 shrink-0 items-center border-b border-hairline px-4 ${collapsed ? 'justify-center' : ''}`}>
        <Logo className={collapsed ? '[&>span:last-child]:hidden' : ''} />
      </div>



      <nav aria-label="Modules" className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-3'}`}>
        <NavSection items={main} collapsed={collapsed} onNavigate={onNavigate} />

        {admin.length > 0 && (
          <>
            {collapsed ? (
              <hr className="my-4 border-hairline" />
            ) : (
              <p className="mt-6 mb-2 px-3 text-[10px] font-bold tracking-widest text-muted/70 uppercase select-none">
                Administration
              </p>
            )}
            <NavSection items={admin} collapsed={collapsed} onNavigate={onNavigate} />
          </>
        )}
      </nav>
    </div>
  )
}
