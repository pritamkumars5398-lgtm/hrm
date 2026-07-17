import {
  BarChart3,
  Banknote,
  CalendarDays,
  Clock,
  FileText,
  LayoutDashboard,
  Receipt,
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
  | 'payslip'
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
  { key: 'payslip', label: 'Payslip', path: '/dashboard/payslip', icon: Receipt, group: 'main' },
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
  attendance: [], // Handled by ALWAYS_GRANTED — self-service check-in is a baseline
  leave: [], // Handled by ALWAYS_GRANTED — applying for leave is a baseline
  payroll: ['payroll.view', 'payroll.manage'],
  payslip: [], // Handled by ALWAYS_GRANTED — seeing your own finalized payslip is a baseline
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
 * that would undo it. `attendance` is here too — checking yourself in/out and
 * seeing your own history is baseline self-service, not a granted privilege;
 * `attendance.manage` only changes what the page shows once you're on it
 * (company-wide vs. just you), decided server-side (§4.1). `payslip` is NOT
 * unconditional like the others — see the carve-out in `canAccess` below.
 */
export const ALWAYS_GRANTED: ModuleKey[] = ['dashboard', 'attendance', 'leave']

/**
 * Payslip is the "my own payslip" ESS view, distinct from the Payroll
 * management module. Anyone who manages payroll (or holds full access, i.e.
 * the Owner) administers *other people's* payslips through Payroll itself —
 * they don't get a separate "my payslip" tab.
 */
export function canAccessPayslip(permissions: string[] | undefined): boolean {
  const perms = permissions ?? []
  if (perms.includes('*')) return false
  if (perms.includes('payroll.manage')) return false
  return true
}

export function canAccess(permissions: string[] | undefined, moduleKey: ModuleKey): boolean {
  const perms = permissions ?? []
  if (moduleKey === 'payslip') return canAccessPayslip(perms)
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
