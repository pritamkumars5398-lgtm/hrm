import {
  DEPARTMENTS,
  EMPLOYEE_STATUSES,
  mockEmployees,
  type Employee,
  type EmployeeStatus,
} from '@/mock/mockEmployees'

export type { Employee, EmployeeStatus }
export { DEPARTMENTS, EMPLOYEE_STATUSES }

export type SortField = 'name' | 'department' | 'joinedAt' | 'status'
export type SortDirection = 'asc' | 'desc'

export type EmployeeQuery = {
  search?: string
  department?: string
  status?: EmployeeStatus | ''
  sortBy?: SortField
  sortDir?: SortDirection
  page?: number
  pageSize?: number
}

export type Paginated<T> = {
  rows: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class EmployeeError extends Error {}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/**
 * Mock-only, and it stays that way this phase — employee records are HR business
 * data (§11.4), so there is no API and no Prisma model behind this.
 *
 * Filtering, sorting and pagination are done here rather than in the component
 * on purpose: that is where a real backend does them, so the component is already
 * written against the interface it will keep in Phase 2 (§9).
 */
export const employeeService = {
  async getAll(query: EmployeeQuery = {}): Promise<Paginated<Employee>> {
    await delay()

    const {
      search = '',
      department = '',
      status = '',
      sortBy = 'name',
      sortDir = 'asc',
      page = 1,
      pageSize = 10,
    } = query

    const term = search.trim().toLowerCase()

    let rows = mockEmployees.filter((e) => {
      const matchesTerm =
        !term ||
        e.name.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.designation.toLowerCase().includes(term)

      const matchesDepartment = !department || e.department === department
      const matchesStatus = !status || e.status === status

      return matchesTerm && matchesDepartment && matchesStatus
    })

    rows = [...rows].sort((a, b) => {
      const factor = sortDir === 'asc' ? 1 : -1

      switch (sortBy) {
        case 'joinedAt':
          return a.joinedAt.localeCompare(b.joinedAt) * factor
        case 'department':
          // Ties fall back to name, so the order is stable rather than arbitrary.
          return (a.department.localeCompare(b.department) || a.name.localeCompare(b.name)) * factor
        case 'status':
          return (a.status.localeCompare(b.status) || a.name.localeCompare(b.name)) * factor
        default:
          return a.name.localeCompare(b.name) * factor
      }
    })

    const total = rows.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    // A filter change can strand you past the last page — clamp instead of
    // returning an empty list that looks like "no results".
    const safePage = Math.min(Math.max(1, page), totalPages)
    const start = (safePage - 1) * pageSize

    return {
      rows: rows.slice(start, start + pageSize),
      total,
      page: safePage,
      pageSize,
      totalPages,
    }
  },

  async getById(id: string): Promise<Employee> {
    await delay()

    const employee = mockEmployees.find((e) => e.id === id)
    if (!employee) throw new EmployeeError('That employee no longer exists.')

    return employee
  },

  getDepartmentOptions() {
    return DEPARTMENTS.map((d) => ({ value: d, label: d }))
  },
}
