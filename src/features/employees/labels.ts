import type { BadgeTone } from '@/shared/components/Badge'
import type { Employee, EmployeeStatus } from '@/services/employeeService'

/**
 * Status and type labels live here, not inside a component file — a module that
 * exports both components and constants breaks React Fast Refresh.
 */
export const STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: 'Active',
  ON_LEAVE: 'On leave',
  PROBATION: 'Probation',
  NOTICE: 'Notice',
  INACTIVE: 'Inactive',
}

/** One mapping, used by the table and the profile alike. */
export const STATUS_TONE: Record<EmployeeStatus, BadgeTone> = {
  ACTIVE: 'success',
  ON_LEAVE: 'warning',
  PROBATION: 'accent',
  NOTICE: 'danger',
  INACTIVE: 'neutral',
}

export const EMPLOYMENT_TYPE_LABEL: Record<Employee['employmentType'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
}
