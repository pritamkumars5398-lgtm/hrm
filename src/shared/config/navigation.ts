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

/**
 * The draft matrix from §10. Treat as adjustable, not final — Settings →
 * Roles & Permissions becomes the surface that edits this.
 *
 * This is the single source of truth for who sees what. The sidebar filters
 * from it AND the router guards from it, so typing a URL you lack access to
 * gets you nowhere — a sidebar that merely hides a link is not access control.
 */
export const ROLE_MODULES: Record<Role, ModuleKey[]> = {
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

export function canAccess(role: Role, moduleKey: ModuleKey): boolean {
  return ROLE_MODULES[role].includes(moduleKey)
}

export function navItemsFor(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(role, item.key))
}
