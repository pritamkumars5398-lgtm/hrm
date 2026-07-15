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

export type PermissionMatrix = Record<ModuleKey, string[]>

/**
 * Maps each module to the granular permissions that grant access to it.
 * If a user holds ANY of the listed permissions, they can access the module.
 */
export const PERMISSION_MODULES: PermissionMatrix = {
  dashboard: [], // Handled by ALWAYS_GRANTED
  employees: ['employees.view', 'employees.manage'],
  attendance: ['attendance.view', 'attendance.manage'],
  leave: ['leave.view', 'leave.approve'],
  payroll: ['payroll.view', 'payroll.manage'],
  performance: ['performance.view', 'performance.manage'],
  documents: ['documents.view', 'documents.manage'],
  reports: ['reports.view'],
  team: ['team.view', 'team.invite', 'team.managePermissions'],
  settings: ['settings.manage'],
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

export function canAccess(permissions: string[] | undefined, moduleKey: ModuleKey): boolean {
  const perms = permissions ?? []
  if (perms.includes('*')) return true
  if (ALWAYS_GRANTED.includes(moduleKey)) return true
  
  const requiredPerms = PERMISSION_MODULES[moduleKey] || []
  return requiredPerms.some((p) => perms.includes(p))
}

export function navItemsFor(permissions: string[] | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(permissions, item.key))
}

/**
 * Does this permission set grant a specific key? Mirrors the backend's
 * PermissionsGuard exactly: full access (`*`), the exact key, or the namespace
 * wildcard (`employees.*` grants `employees.manage`). Use this to gate protected
 * actions inside a module (Edit/Delete buttons, Approve, etc.).
 */
export function hasPermission(permissions: string[] | undefined, key: string): boolean {
  const perms = permissions ?? []
  if (perms.includes('*') || perms.includes(key)) return true
  const namespace = key.split('.')[0]
  return perms.includes(`${namespace}.*`)
}
