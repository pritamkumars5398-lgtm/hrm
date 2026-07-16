import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { hasPermission } from '@/shared/config/navigation'
import {
  LEAVE_ENTITLEMENT,
  LEAVE_TYPES,
  balancesFor,
  daysBetween,
  mockLeavePolicy,
  mockLeaveRequests,
  updateMockLeavePolicy,
  type LeaveBalance,
  type LeaveRequest,
  type LeaveStatus,
  type LeaveType,
} from '@/mock/mockLeave'
import { mockEmployees } from '@/mock/mockEmployees'
import { MOCK_ORGANIZATION_ID } from '@/mock/mockUsers'

export type { LeaveBalance, LeaveRequest, LeaveStatus, LeaveType }
export { LEAVE_TYPES, LEAVE_ENTITLEMENT, daysBetween }

export class LeaveError extends Error {}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Mutable copy so approvals persist for the session without touching the seed. */
let requests: LeaveRequest[] = [...mockLeaveRequests]

export type Viewer = {
  permissions: string[]
  /** The signed-in person's name — matched against the employee directory (mock path only). */
  name: string
}

export type LeaveData = {
  balances: LeaveBalance[]
  /** Requests this viewer is allowed to see. */
  requests: LeaveRequest[]
  /** The subset they can actually decide on. */
  pendingApprovals: LeaveRequest[]
  scope: 'company' | 'me'
  /** Approved leave overlapping the next 30 days — the "who is off" calendar. */
  upcoming: LeaveRequest[]
  /** False when the caller has no Employee HR record — e.g. a Team-Members-only invite. */
  hasEmployeeRecord: boolean
  /** The company's current entitlement — editable via updatePolicy() by whoever holds leave.approve. */
  policy: { annual: number; sick: number; personal: number }
}

export type LeavePolicyPatch = { annual?: number; sick?: number; personal?: number }

export type ApplyLeavePayload = {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}

const employeeFor = (name: string) => mockEmployees.find((e) => e.name === name) ?? null

/**
 * Who may decide on a request (mock path). Nobody — not even an Owner — may
 * approve their own leave; that is the one rule a leave system cannot bend.
 */
function canDecide(viewer: Viewer, request: LeaveRequest): boolean {
  if (request.employeeName === viewer.name) return false
  if (request.status !== 'PENDING') return false
  return hasPermission(viewer.permissions, 'leave.approve')
}

/**
 * Applying for leave and seeing your own requests is a baseline every member
 * gets — `leave.approve` only changes whether `get` also returns company-wide
 * requests and pending approvals (decided server-side, never trusted from the
 * client). Real API is authoritative once a backend is configured; the mock
 * path exists for the offline/no-backend demo.
 */
export const leaveService = {
  async get(viewer: Viewer): Promise<LeaveData> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<LeaveData>('/leave')
        return data
      } catch (error) {
        throw new LeaveError(apiErrorMessage(error, 'We could not load leave for your company.'))
      }
    }

    await delay()

    const me = employeeFor(viewer.name)
    const manage = hasPermission(viewer.permissions, 'leave.approve')
    const scope: LeaveData['scope'] = manage ? 'company' : 'me'

    const visible = manage ? requests : requests.filter((r) => r.employeeName === viewer.name)

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
      hasEmployeeRecord: me !== null,
      policy: { annual: mockLeavePolicy.ANNUAL, sick: mockLeavePolicy.SICK, personal: mockLeavePolicy.PERSONAL },
    }
  },

  async updatePolicy(patch: LeavePolicyPatch): Promise<LeaveData['policy']> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<LeaveData['policy']>('/leave/policy', patch)
        return data
      } catch (error) {
        throw new LeaveError(apiErrorMessage(error, 'We could not save the leave policy.'))
      }
    }

    await delay()
    const updated = updateMockLeavePolicy({
      ...(patch.annual !== undefined ? { ANNUAL: patch.annual } : {}),
      ...(patch.sick !== undefined ? { SICK: patch.sick } : {}),
      ...(patch.personal !== undefined ? { PERSONAL: patch.personal } : {}),
    })
    return { annual: updated.ANNUAL, sick: updated.SICK, personal: updated.PERSONAL }
  },

  async apply(viewer: Viewer, payload: ApplyLeavePayload): Promise<LeaveRequest> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<LeaveRequest>('/leave', payload)
        return data
      } catch (error) {
        throw new LeaveError(apiErrorMessage(error, 'We could not submit your leave request.'))
      }
    }

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
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<LeaveRequest>(`/leave/${id}/decide`, { decision })
        return data
      } catch (error) {
        throw new LeaveError(apiErrorMessage(error, 'We could not decide on that request.'))
      }
    }

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
