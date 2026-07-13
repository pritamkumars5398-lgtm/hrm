import {
  BarChart3,
  Banknote,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Settings,
  Target,
  Users,
  UserPlus,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/services/authService'

export type ModuleKey =
  | 'dashboard'
  | 'employees'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'performance'
  | 'documents'
  | 'reports'
  | 'team'
  | 'settings'

export type NavItem = {
  key: ModuleKey
  label: string
  path: string
  icon: LucideIcon
  /** Sidebar grouping — modules vs. the administrative tail. */
  group: 'main' | 'admin'
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'main' },
  { key: 'employees', label: 'Employees', path: '/dashboard/employees', icon: Users, group: 'main' },
  { key: 'attendance', label: 'Attendance', path: '/dashboard/attendance', icon: Clock, group: 'main' },
  { key: 'leave', label: 'Leave', path: '/dashboard/leave', icon: CalendarDays, group: 'main' },
  { key: 'payroll', label: 'Payroll', path: '/dashboard/payroll', icon: Banknote, group: 'main' },
  { key: 'performance', label: 'Performance', path: '/dashboard/performance', icon: Target, group: 'main' },
  { key: 'documents', label: 'Documents', path: '/dashboard/documents', icon: FileText, group: 'main' },
  { key: 'reports', label: 'Reports', path: '/dashboard/reports', icon: BarChart3, group: 'main' },
  { key: 'team', label: 'Team Members', path: '/dashboard/team', icon: UserPlus, group: 'admin' },
  { key: 'settings', label: 'Settings', path: '/dashboard/settings', icon: Settings, group: 'admin' },
]

export type RoleMatrix = Record<Role, ModuleKey[]>

/**
 * The draft defaults from §10 — the starting point, not the live value.
 *
 * Settings → Roles & Permissions edits a copy of this held in `permissionsStore`,
 * and the sidebar AND the route guard both read from that store. So changing the
 * matrix changes what a role can reach, immediately and everywhere. Use
 * `useRoleMatrix()` to read the live matrix; this constant is only the default
 * and the "reset" target.
 */
export const DEFAULT_ROLE_MODULES: RoleMatrix = {
  OWNER: [
    'dashboard',
    'employees',
    'attendance',
    'leave',
    'payroll',
    'performance',
    'documents',
    'reports',
    'team',
    'settings',
  ],
  // HR: no Payroll, no full Settings. Team Members is invite-only, not config.
  HR: ['dashboard', 'employees', 'attendance', 'leave', 'documents', 'reports', 'team'],
  // Manager: their team's attendance and leave approvals, plus performance. No
  // Payroll, no Settings, Documents view-only.
  MANAGER: ['dashboard', 'attendance', 'leave', 'performance', 'documents'],
}

/**
 * Modules nobody can be locked out of.
 *
 * `dashboard` is every role's landing page — removing it strands them on a page
 * they cannot see. The Owner keeps everything unconditionally, so an admin cannot
 * revoke their own Settings access and lock themselves out of the very screen
 * that would undo it.
 */
export const ALWAYS_GRANTED: ModuleKey[] = ['dashboard']

export function canAccess(matrix: RoleMatrix, role: Role, moduleKey: ModuleKey): boolean {
  if (role === 'OWNER') return true
  if (ALWAYS_GRANTED.includes(moduleKey)) return true
  return matrix[role].includes(moduleKey)
}

export function navItemsFor(matrix: RoleMatrix, role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(matrix, role, item.key))
}
