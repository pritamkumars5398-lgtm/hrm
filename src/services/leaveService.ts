import {
  LEAVE_ENTITLEMENT,
  LEAVE_TYPES,
  balancesFor,
  daysBetween,
  mockLeaveRequests,
  type LeaveBalance,
  type LeaveRequest,
  type LeaveStatus,
  type LeaveType,
} from '@/mock/mockLeave'
import { mockEmployees } from '@/mock/mockEmployees'
import { MOCK_ORGANIZATION_ID } from '@/mock/mockUsers'
import type { Role } from './authService'

export type { LeaveBalance, LeaveRequest, LeaveStatus, LeaveType }
export { LEAVE_TYPES, LEAVE_ENTITLEMENT, daysBetween }

export class LeaveError extends Error {}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Mutable copy so approvals persist for the session without touching the seed. */
let requests: LeaveRequest[] = [...mockLeaveRequests]

export type Viewer = {
  role: Role
  /** The signed-in person's name — matched against the employee directory. */
  name: string
}

export type LeaveData = {
  balances: LeaveBalance[]
  /** Requests this viewer is allowed to see. */
  requests: LeaveRequest[]
  /** The subset they can actually decide on. */
  pendingApprovals: LeaveRequest[]
  scope: 'company' | 'team'
  /** Approved leave overlapping the next 30 days — the "who is off" calendar. */
  upcoming: LeaveRequest[]
}

export type ApplyLeavePayload = {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}

const employeeFor = (name: string) => mockEmployees.find((e) => e.name === name) ?? null

/**
 * Who may decide on a request.
 *
 * Owner and HR can decide company-wide. A Manager can only decide for their own
 * reports. Nobody — not even an Owner — may approve their own leave; that is the
 * one rule a leave system cannot bend.
 */
function canDecide(viewer: Viewer, request: LeaveRequest): boolean {
  if (request.employeeName === viewer.name) return false
  if (request.status !== 'PENDING') return false

  if (viewer.role === 'OWNER' || viewer.role === 'HR') return true
  return request.managerName === viewer.name
}

export const leaveService = {
  /** Mock-only (§11.4) — no API, no DB model. */
  async get(viewer: Viewer): Promise<LeaveData> {
    await delay()

    const me = employeeFor(viewer.name)
    const scope: LeaveData['scope'] = viewer.role === 'MANAGER' ? 'team' : 'company'

    // A Manager sees their team's requests plus their own — never the whole company.
    const visible =
      scope === 'company'
        ? requests
        : requests.filter(
            (r) => r.managerName === viewer.name || r.employeeName === viewer.name,
          )

    const today = new Date().toISOString().slice(0, 10)
    const horizon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    return {
      balances: me ? balancesFor(me.id) : LEAVE_TYPES.map((type) => ({
        type,
        total: LEAVE_ENTITLEMENT[type],
        used: 0,
      })),
      requests: [...visible].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
      pendingApprovals: visible.filter((r) => canDecide(viewer, r)),
      scope,
      upcoming: visible
        .filter((r) => r.status === 'APPROVED' && r.endDate >= today && r.startDate <= horizon)
        .sort((a, b) => a.startDate.localeCompare(b.startDate)),
    }
  },

  async apply(viewer: Viewer, payload: ApplyLeavePayload): Promise<LeaveRequest> {
    await delay()

    const me = employeeFor(viewer.name)
    if (!me) throw new LeaveError('We could not find your employee record.')

    if (payload.endDate < payload.startDate) {
      throw new LeaveError('The end date cannot be before the start date.')
    }

    const days = daysBetween(payload.startDate, payload.endDate)

    // Unpaid leave has no allowance to run out of; the others do.
    if (payload.type !== 'UNPAID') {
      const balance = balancesFor(me.id).find((b) => b.type === payload.type)!
      const remaining = balance.total - balance.used

      if (days > remaining) {
        throw new LeaveError(
          `You only have ${remaining} ${remaining === 1 ? 'day' : 'days'} of that leave left.`,
        )
      }
    }

    // Booking the same days twice is the classic double-count bug.
    const overlapping = requests.find(
      (r) =>
        r.employeeId === me.id &&
        r.status !== 'REJECTED' &&
        r.startDate <= payload.endDate &&
        r.endDate >= payload.startDate,
    )
    if (overlapping) {
      throw new LeaveError('You already have leave booked that overlaps those dates.')
    }

    const request: LeaveRequest = {
      id: `lv-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: MOCK_ORGANIZATION_ID,
      employeeId: me.id,
      employeeName: me.name,
      avatarInitials: me.avatarInitials,
      department: me.department,
      managerName: me.managerName,
      type: payload.type,
      startDate: payload.startDate,
      endDate: payload.endDate,
      days,
      reason: payload.reason.trim(),
      status: 'PENDING',
      requestedAt: new Date().toISOString().slice(0, 10),
      decidedBy: null,
      decidedAt: null,
    }

    requests = [request, ...requests]
    return request
  },

  async decide(
    viewer: Viewer,
    id: string,
    decision: 'APPROVED' | 'REJECTED',
  ): Promise<LeaveRequest> {
    await delay()

    const request = requests.find((r) => r.id === id)
    if (!request) throw new LeaveError('That request no longer exists.')

    // Enforced here, not just hidden in the UI — a hidden button is not a rule.
    if (!canDecide(viewer, request)) {
      throw new LeaveError('You are not allowed to decide on this request.')
    }

    const decided: LeaveRequest = {
      ...request,
      status: decision,
      decidedBy: viewer.name,
      decidedAt: new Date().toISOString().slice(0, 10),
    }

    requests = requests.map((r) => (r.id === id ? decided : r))
    return decided
  },
}
