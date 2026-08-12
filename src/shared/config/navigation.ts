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
  Briefcase,
  UserCheck,
  Timer,
  GraduationCap,
  Laptop,
  CreditCard,
  Plane,
  LifeBuoy,
  HeartHandshake,
  MessageSquare,
  FormInput,
  GitBranch,
  ShieldCheck,
  Sparkles,
  ShieldAlert,
  Building2,
  CheckSquare,
  ClipboardList,
  type LucideIcon,
} from 'lucide-react'

export type ModuleKey =
  | 'dashboard'
  | 'employees'
  | 'recruitment'
  | 'onboarding'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'payslip'
  | 'timesheets'
  | 'performance'
  | 'lms'
  | 'assets'
  | 'expenses'
  | 'travel'
  | 'helpdesk'
  | 'approvals'
  | 'engagement'
  | 'communication'
  | 'documents'
  | 'forms'
  | 'workflows'
  | 'reports'
  | 'compliance'
  | 'ai-copilot'
  | 'superadmin'
  | 'billing'
  | 'team'
  | 'settings'
  | 'audit-logs'

export type NavItem = {
  key: ModuleKey
  label: string
  path: string
  icon: LucideIcon
  /** Sidebar grouping — modules vs. administrative/AI tools. */
  group: 'main' | 'operations' | 'engagement' | 'ai_saas' | 'admin'
}

export const NAV_ITEMS: NavItem[] = [
  // Main Core HR
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'main' },
  { key: 'employees', label: 'Employees', path: '/dashboard/employees', icon: Users, group: 'main' },
  { key: 'attendance', label: 'Attendance', path: '/dashboard/attendance', icon: Clock, group: 'main' },
  { key: 'leave', label: 'Leave Planner', path: '/dashboard/leave', icon: CalendarDays, group: 'main' },
  { key: 'payroll', label: 'Payroll', path: '/dashboard/payroll', icon: Banknote, group: 'main' },
  { key: 'payslip', label: 'My Payslip', path: '/dashboard/payslip', icon: Receipt, group: 'main' },
  { key: 'performance', label: 'Performance', path: '/dashboard/performance', icon: Target, group: 'main' },

  // Operations & Talent
  { key: 'recruitment', label: 'Recruitment (ATS)', path: '/dashboard/recruitment', icon: Briefcase, group: 'operations' },
  { key: 'onboarding', label: 'Digital Onboarding', path: '/dashboard/onboarding-tracker', icon: UserCheck, group: 'operations' },
  { key: 'timesheets', label: 'Time Tracking', path: '/dashboard/timesheets', icon: Timer, group: 'operations' },
  { key: 'lms', label: 'LMS Academy', path: '/dashboard/lms', icon: GraduationCap, group: 'operations' },
  { key: 'assets', label: 'Asset Management', path: '/dashboard/assets', icon: Laptop, group: 'operations' },
  { key: 'expenses', label: 'Expense Claims', path: '/dashboard/expenses', icon: CreditCard, group: 'operations' },
  { key: 'travel', label: 'Travel Desk', path: '/dashboard/travel', icon: Plane, group: 'operations' },
  { key: 'helpdesk', label: 'Helpdesk Tickets', path: '/dashboard/helpdesk', icon: LifeBuoy, group: 'operations' },
  { key: 'approvals', label: 'Approvals', path: '/dashboard/approvals', icon: CheckSquare, group: 'operations' },

  // Engagement & Docs
  { key: 'engagement', label: 'Engagement & Kudos', path: '/dashboard/engagement', icon: HeartHandshake, group: 'engagement' },
  { key: 'communication', label: 'Chat & WhatsApp', path: '/dashboard/communication', icon: MessageSquare, group: 'engagement' },
  { key: 'documents', label: 'Document Center', path: '/dashboard/documents', icon: FileText, group: 'engagement' },
  { key: 'forms', label: 'Form Builder', path: '/dashboard/forms', icon: FormInput, group: 'engagement' },

  // Workflows & AI
  { key: 'workflows', label: 'Workflow Engine', path: '/dashboard/workflows', icon: GitBranch, group: 'ai_saas' },
  { key: 'reports', label: 'Reports & Analytics', path: '/dashboard/reports', icon: BarChart3, group: 'ai_saas' },
  { key: 'compliance', label: 'Statutory Compliance', path: '/dashboard/compliance', icon: ShieldCheck, group: 'ai_saas' },
  { key: 'ai-copilot', label: 'AI HR Copilot', path: '/dashboard/ai-copilot', icon: Sparkles, group: 'ai_saas' },
  { key: 'billing', label: 'Subscriptions', path: '/dashboard/billing', icon: Building2, group: 'ai_saas' },
  { key: 'superadmin', label: 'Super Admin SaaS', path: '/dashboard/superadmin', icon: ShieldAlert, group: 'ai_saas' },

  // Admin
  { key: 'team', label: 'Team Members', path: '/dashboard/team', icon: UserPlus, group: 'admin' },
  { key: 'settings', label: 'Settings', path: '/dashboard/settings', icon: Settings, group: 'admin' },
  { key: 'audit-logs', label: 'Audit Logs', path: '/dashboard/audit-logs', icon: ClipboardList, group: 'admin' },
]

export type PermissionMatrix = Record<ModuleKey, string[]>

export const PERMISSION_MODULES: PermissionMatrix = {
  dashboard: [],
  employees: ['employees.view', 'employees.manage'],
  recruitment: ['recruitment.view', 'recruitment.manage'],
  onboarding: ['onboarding.view', 'onboarding.manage'],
  attendance: [],
  leave: [],
  payroll: ['payroll.view', 'payroll.manage'],
  payslip: [],
  timesheets: [],
  performance: ['performance.view', 'performance.manage'],
  lms: [],
  assets: [],
  expenses: [],
  travel: [],
  helpdesk: [],
  approvals: [],
  engagement: [],
  communication: [],
  documents: ['documents.view', 'documents.manage'],
  forms: [],
  workflows: ['settings.manage'],
  reports: ['reports.view'],
  compliance: ['payroll.view', 'payroll.manage'],
  'ai-copilot': [],
  superadmin: ['settings.manage'],
  billing: ['settings.manage'],
  team: ['team.view', 'team.invite', 'team.managePermissions'],
  settings: ['settings.manage'],
  'audit-logs': ['settings.manage'],
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

export function navItemsFor(_permissions?: string[]): NavItem[] {
  // Always return all navigation items so every enterprise feature is visible in the sidebar.
  return NAV_ITEMS
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

/**
 * The full granular permission catalog (§10.1), grouped by module for the
 * Permission Editor's checkbox grid. This is the complete, fixed set of keys
 * the backend actually understands — the editor lets the Owner (or anyone
 * holding `team.managePermissions`) grant any combination of these to
 * anyone, not just the three role presets (HR/Manager/Employee), which are
 * only a starting point for the invite form.
 */
export const PERMISSION_KEY_GROUPS: Array<{ label: string; keys: Array<{ key: string; label: string }> }> = [
  {
    label: 'Employees',
    keys: [
      { key: 'employees.view', label: 'View employee directory' },
      { key: 'employees.manage', label: 'Manage employee records' },
    ],
  },
  {
    label: 'Attendance',
    keys: [
      { key: 'attendance.view', label: 'View attendance' },
      { key: 'attendance.manage', label: 'Manage company-wide attendance' },
    ],
  },
  {
    label: 'Leave',
    keys: [
      { key: 'leave.view', label: 'View leave' },
      { key: 'leave.approve', label: 'Approve or reject leave requests' },
    ],
  },
  {
    label: 'Payroll',
    keys: [
      { key: 'payroll.view', label: 'View payroll' },
      { key: 'payroll.manage', label: 'Run and finalize payroll' },
    ],
  },
  {
    label: 'Performance',
    keys: [
      { key: 'performance.view', label: 'View performance' },
      { key: 'performance.manage', label: 'Manage company-wide reviews' },
    ],
  },
  {
    label: 'Documents',
    keys: [
      { key: 'documents.view', label: 'View documents' },
      { key: 'documents.manage', label: 'Upload and delete documents' },
    ],
  },
  {
    label: 'Reports',
    keys: [{ key: 'reports.view', label: 'View reports' }],
  },
  {
    label: 'Team',
    keys: [
      { key: 'team.view', label: 'View team members' },
      { key: 'team.invite', label: 'Invite new members' },
      { key: 'team.managePermissions', label: 'Edit permissions and remove members' },
    ],
  },
  {
    label: 'Settings',
    keys: [{ key: 'settings.manage', label: 'Manage company settings' }],
  },
]
