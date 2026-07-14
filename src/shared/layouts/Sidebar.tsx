import { NavLink } from 'react-router-dom'
import Logo from '@/shared/components/Logo'
import { navItemsFor, type NavItem } from '@/shared/config/navigation'
import { useRoleMatrix } from '@/features/settings/store/permissionsStore'
import type { Role } from '@/services/authService'

type SidebarProps = {
  role: Role
  organizationName: string
  collapsed?: boolean
  /** Closes the drawer after navigating on mobile. */
  onNavigate?: () => void
}

const ROLE_LABEL: Record<Role, string> = {
  OWNER: 'Owner',
  HR: 'HR',
  MANAGER: 'Manager',
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
    <ul className="space-y-0.5">
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
                `group flex items-center transition-colors ${
                  isActive
                    ? 'bg-pine font-medium text-white'
                    : 'text-muted hover:bg-pine-tint/50 hover:text-pine'
                } ${
                  collapsed
                    ? 'h-9 w-9 justify-center rounded-ctl mx-auto p-0'
                    : 'gap-2.5 rounded-ctl px-2.5 py-2 text-[13.5px]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-muted group-hover:text-pine'
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
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
  role,
  organizationName,
  collapsed = false,
  onNavigate,
}: SidebarProps) {
  // Live matrix — editing Settings → Roles & Permissions changes this immediately.
  const matrix = useRoleMatrix()
  const items = navItemsFor(matrix, role)
  const main = items.filter((i) => i.group === 'main')
  const admin = items.filter((i) => i.group === 'admin')

  return (
    <div className="flex h-full flex-col border-r border-hairline bg-paper">
      <div className={`flex h-16 shrink-0 items-center border-b border-hairline px-4 ${collapsed ? 'justify-center' : ''}`}>
        <Logo className={collapsed ? '[&>span:last-child]:hidden' : ''} />
      </div>

      {!collapsed && (
        <div className="border-b border-hairline px-4 py-3">
          <p className="truncate text-[13px] font-medium">{organizationName}</p>
          <p className="mt-0.5 text-[11px] text-muted">
            Signed in as <span className="text-pine">{ROLE_LABEL[role]}</span>
          </p>
        </div>
      )}

      <nav aria-label="Modules" className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-3'}`}>
        <NavSection items={main} collapsed={collapsed} onNavigate={onNavigate} />

        {admin.length > 0 && (
          <>
            {collapsed ? (
              <hr className="my-4 border-hairline" />
            ) : (
              <p className="mt-6 mb-2 px-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
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
