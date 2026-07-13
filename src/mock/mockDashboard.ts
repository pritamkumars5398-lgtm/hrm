import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type DashboardStat = {
  id: string
  organizationId: string
  label: string
  value: string
  delta: string | null
  /** Which roles may see this figure — payroll cost is not for everyone (§10). */
  restrictedTo?: Array<'OWNER' | 'HR' | 'MANAGER'>
}

export type ActivityItem = {
  id: string
  organizationId: string
  title: string
  meta: string
  kind: 'leave' | 'payroll' | 'employee' | 'performance'
}

export const mockDashboardStats: DashboardStat[] = [
  {
    id: 'st-headcount',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'Employees',
    value: '248',
    delta: '+4 this month',
  },
  {
    id: 'st-present',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'Present today',
    value: '231',
    delta: '93.1%',
  },
  {
    id: 'st-leave',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'On leave',
    value: '9',
    delta: '3 pending approval',
  },
  {
    id: 'st-payroll',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'March payroll',
    value: '£847,204',
    delta: 'Ready to review',
    // A Manager has no business seeing the company's total payroll cost.
    restrictedTo: ['OWNER'],
  },
]

export const mockActivity: ActivityItem[] = [
  {
    id: 'ac-1',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Samuel Okafor requested 5 days annual leave',
    meta: '18–22 Mar · awaiting your approval',
    kind: 'leave',
  },
  {
    id: 'ac-2',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'March payroll is ready to review',
    meta: '248 employees · £847,204',
    kind: 'payroll',
  },
  {
    id: 'ac-3',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Marta Lindqvist completed onboarding',
    meta: 'Yesterday · Engineering',
    kind: 'employee',
  },
  {
    id: 'ac-4',
    organizationId: MOCK_ORGANIZATION_ID,
    title: 'Q1 performance reviews opened',
    meta: '12 of 248 completed',
    kind: 'performance',
  },
]
