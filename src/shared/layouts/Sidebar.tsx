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

const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  HR: 'HR Manager',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
}

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
  role,
  organizationName,
  collapsed = false,
  onNavigate,
}: SidebarProps) {
  const items = navItemsFor(permissions)
  const main = items.filter((i) => i.group === 'main')
  const admin = items.filter((i) => i.group === 'admin')

  // Generate initials for organization selector
  const orgInitials = organizationName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'KS'

  return (
    <div className="flex h-full flex-col border-r border-hairline bg-paper">
      <div className={`flex h-16 shrink-0 items-center border-b border-hairline px-4 ${collapsed ? 'justify-center' : ''}`}>
        <Logo className={collapsed ? '[&>span:last-child]:hidden' : ''} />
      </div>

      {!collapsed && (
        <div className="border-b border-hairline bg-wash/10 px-4 py-3.5 flex items-center gap-3">
          {/* Workspace Avatar box */}
          <div className="size-8 rounded-ctl flex items-center justify-center text-[12px] font-bold text-white bg-gradient-to-br from-[#10b981] to-[#15803d] shadow-inner shrink-0 select-none">
            {orgInitials}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-bold text-ink leading-none">{organizationName}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9.5px] font-semibold text-muted uppercase tracking-wider">Role:</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${
                role === 'OWNER' ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50' :
                role === 'HR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                role === 'MANAGER' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                'bg-wash text-muted border-hairline-strong'
              }`}>
                {ROLE_LABEL[role]}
              </span>
            </div>
          </div>
        </div>
      )}

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
