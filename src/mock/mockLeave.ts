import { mockEmployees } from './mockEmployees'
import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'UNPAID'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type LeaveBalance = {
  type: LeaveType
  total: number
  used: number
}

export type LeaveRequest = {
  id: string
  organizationId: string
  employeeId: string
  employeeName: string
  avatarInitials: string
  department: string
  managerName: string | null
  type: LeaveType
  /** YYYY-MM-DD, inclusive. */
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  requestedAt: string
  decidedBy: string | null
  decidedAt: string | null
}

export const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID']

/** The company's yearly entitlement default. Unpaid has no cap. */
export const LEAVE_ENTITLEMENT: Record<LeaveType, number> = {
  ANNUAL: 25,
  SICK: 10,
  PERSONAL: 5,
  UNPAID: 0,
}

/** Mutable so the Owner's policy edits persist for the session (mock/offline path). */
export let mockLeavePolicy: Record<LeaveType, number> = { ...LEAVE_ENTITLEMENT }

export function updateMockLeavePolicy(patch: Partial<Record<'ANNUAL' | 'SICK' | 'PERSONAL', number>>) {
  mockLeavePolicy = { ...mockLeavePolicy, ...patch }
  return mockLeavePolicy
}

const byName = (name: string) => mockEmployees.find((e) => e.name === name)!

/** Whole days between two ISO dates, inclusive. */
export function daysBetween(start: string, end: string): number {
  const from = new Date(`${start}T00:00:00`)
  const to = new Date(`${end}T00:00:00`)
  const diff = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
  return diff + 1
}

type Seed = [
  employee: string,
  type: LeaveType,
  start: string,
  end: string,
  reason: string,
  status: LeaveStatus,
]

const SEEDS: Seed[] = [
  ['Samuel Okafor', 'ANNUAL', '2026-07-20', '2026-07-24', 'Family holiday.', 'PENDING'],
  ['Aisha Rahman', 'ANNUAL', '2026-07-27', '2026-07-31', 'Trip abroad, booked in March.', 'PENDING'],
  ['Tom Okada', 'SICK', '2026-07-15', '2026-07-15', 'Doctor’s appointment.', 'PENDING'],
  ['Dan Whitfield', 'PERSONAL', '2026-07-17', '2026-07-17', 'Moving house.', 'PENDING'],
  ['Chloe Dubois', 'ANNUAL', '2026-08-03', '2026-08-14', 'Summer break.', 'PENDING'],
  ['Amira Haddad', 'SICK', '2026-07-06', '2026-07-10', 'Flu — signed off by GP.', 'APPROVED'],
  ['Kai Tanaka', 'ANNUAL', '2026-06-15', '2026-06-19', 'Annual leave.', 'APPROVED'],
  ['Mei Chen', 'ANNUAL', '2026-06-01', '2026-06-05', 'Wedding.', 'APPROVED'],
  ['Lucas Meyer', 'PERSONAL', '2026-06-22', '2026-06-22', 'Jury duty.', 'APPROVED'],
  ['Grace Liu', 'ANNUAL', '2026-05-11', '2026-05-15', 'Half-term with the kids.', 'APPROVED'],
  ['Rory Gallagher', 'UNPAID', '2026-06-08', '2026-06-26', 'Extended personal leave.', 'REJECTED'],
  ['Yusuf Demir', 'ANNUAL', '2026-07-13', '2026-07-17', 'Clashes with the campaign launch.', 'REJECTED'],
  ['Ethan Wallace', 'SICK', '2026-06-29', '2026-06-30', 'Migraine.', 'APPROVED'],
  ['Freya Nilsson', 'ANNUAL', '2026-08-17', '2026-08-21', 'Holiday.', 'PENDING'],
]

export const mockLeaveRequests: LeaveRequest[] = SEEDS.map(
  ([name, type, startDate, endDate, reason, status], i) => {
    const employee = byName(name)

    return {
      id: `lv-${String(i + 1).padStart(3, '0')}`,
      organizationId: MOCK_ORGANIZATION_ID,
      employeeId: employee.id,
      employeeName: employee.name,
      avatarInitials: employee.avatarInitials,
      department: employee.department,
      managerName: employee.managerName,
      type,
      startDate,
      endDate,
      days: daysBetween(startDate, endDate),
      reason,
      status,
      requestedAt: new Date(
        new Date(`${startDate}T00:00:00`).getTime() - 12 * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .slice(0, 10),
      decidedBy: status === 'PENDING' ? null : 'Priya Nair',
      decidedAt: status === 'PENDING' ? null : startDate,
    }
  },
)

/**
 * Balances are derived from approved requests rather than stored separately —
 * two sources of truth for "days used" is how a leave system starts lying.
 */
export function balancesFor(employeeId: string): LeaveBalance[] {
  return LEAVE_TYPES.map((type) => {
    const used = mockLeaveRequests
      .filter((r) => r.employeeId === employeeId && r.type === type && r.status === 'APPROVED')
      .reduce((sum, r) => sum + r.days, 0)

    return { type, total: mockLeavePolicy[type], used }
  })
}
