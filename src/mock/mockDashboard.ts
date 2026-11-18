import { MOCK_ORGANIZATION_ID } from './mockUsers'
import { mockEmployees } from './mockEmployees'

// Derived, not typed by hand: a dashboard that says 248 while the directory shows
// 38 is the kind of thing a client notices immediately.
const headcount = mockEmployees.length
const onLeave = mockEmployees.filter((e) => e.status === 'ON_LEAVE').length
const active = mockEmployees.filter((e) => e.status !== 'INACTIVE').length
const presentToday = active - onLeave

export type DashboardStat = {
  id: string
  organizationId: string
  label: string
  value: string
  delta: string | null
  /** Permission key gating this figure — payroll cost is not for everyone (§10). */
  restrictedPermission?: string
}

export type ActivityItem = {
  id: string
  organizationId: string
  title: string
  meta: string
  kind: 'leave' | 'payroll' | 'employee' | 'performance'
}

const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long' })

export const mockDashboardStats: DashboardStat[] = [
  {
    id: 'st-headcount',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'Employees',
    value: String(headcount),
    delta: '+3 this month',
  },
  {
    id: 'st-present',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'Present today',
    value: String(presentToday),
    delta: `${Math.round((presentToday / active) * 100)}%`,
  },
  {
    id: 'st-leave',
    organizationId: MOCK_ORGANIZATION_ID,
    label: 'On leave',
    value: String(onLeave),
    delta: '6 pending approval',
  },
  {
    id: 'st-payroll',
    organizationId: MOCK_ORGANIZATION_ID,
    label: `${currentMonth} payroll`,
    value: '₹31,20,000',
    delta: 'Ready to review',
    // Anyone without real payroll access has no business seeing this figure.
    restrictedPermission: 'payroll.view',
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
    title: `${currentMonth} payroll is ready to review`,
    meta: `${headcount} employees · ₹31,20,000`,
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
    meta: `12 of ${headcount} completed`,
    kind: 'performance',
  },
]
