import type { BadgeTone } from '@/shared/components/Badge'
import type { LeaveStatus, LeaveType } from '@/services/leaveService'

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = {
  ANNUAL: 'Annual leave',
  SICK: 'Sick leave',
  PERSONAL: 'Personal leave',
  UNPAID: 'Unpaid leave',
}

/** Short form, for table cells where the full label is too long. */
export const LEAVE_TYPE_SHORT: Record<LeaveType, string> = {
  ANNUAL: 'Annual',
  SICK: 'Sick',
  PERSONAL: 'Personal',
  UNPAID: 'Unpaid',
}

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

export const LEAVE_STATUS_TONE: Record<LeaveStatus, BadgeTone> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
}
