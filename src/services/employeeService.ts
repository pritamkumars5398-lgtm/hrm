import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
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

/** Fields an edit can change. Sent sparse — only what the form actually touched. */
export type EmployeeUpdate = {
  firstName?: string
  lastName?: string
  employeeId?: string
  contactNumber?: string
  homeAddress?: string
  jobTitle?: string
  department?: string
  startDate?: string
  employmentType?: string
  workLocation?: string
  managerId?: string
}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Mutable copy for the offline path, so edit/delete persist within a session. */
let mockState: Employee[] = [...mockEmployees]

/**
 * Search, filter, sort and paginate a full employee list into one page of
 * results. Kept as a pure function so both paths — the real API (which returns
 * the whole org's directory) and the offline mock — present the component the
 * exact same `Paginated<Employee>` contract.
 */
function applyQuery(source: Employee[], query: EmployeeQuery): Paginated<Employee> {
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

  let rows = source.filter((e) => {
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
}

/**
 * The directory reads REAL employee identity records from the backend
 * (`GET /employees`, scoped to the active company) once a backend is configured
 * — people added through the invite flow show up here (§11.4). The mock list is
 * only the offline fallback for the no-backend Vercel demo.
 *
 * Filtering, sorting and pagination stay client-side in `applyQuery` for now:
 * the endpoint returns the whole (small) company directory and the component
 * keeps the same interface either way.
 */
export const employeeService = {
  async getAll(query: EmployeeQuery = {}): Promise<Paginated<Employee>> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Employee[]>('/employees')
        return applyQuery(data, query)
      } catch (error) {
        throw new EmployeeError(apiErrorMessage(error, 'We could not load the employee directory.'))
      }
    }

    await delay()
    return applyQuery(mockState, query)
  },

  async getById(id: string): Promise<Employee> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Employee>(`/employees/${id}`)
        return data
      } catch (error) {
        throw new EmployeeError(apiErrorMessage(error, 'That employee no longer exists.'))
      }
    }

    await delay()
    const employee = mockState.find((e) => e.id === id)
    if (!employee) throw new EmployeeError('That employee no longer exists.')

    return employee
  },

  async update(id: string, patch: EmployeeUpdate): Promise<Employee> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<Employee>(`/employees/${id}`, patch)
        return data
      } catch (error) {
        throw new EmployeeError(apiErrorMessage(error, 'We could not save those changes.'))
      }
    }

    await delay()
    const index = mockState.findIndex((e) => e.id === id)
    if (index === -1) throw new EmployeeError('That employee no longer exists.')

    const current = mockState[index]!
    const name = `${patch.firstName ?? current.firstName ?? current.name.split(' ')[0]} ${
      patch.lastName ?? current.lastName ?? current.name.split(' ').slice(1).join(' ')
    }`.trim()
    const updated: Employee = {
      ...current,
      ...(patch.firstName !== undefined ? { firstName: patch.firstName } : {}),
      ...(patch.lastName !== undefined ? { lastName: patch.lastName } : {}),
      ...(patch.employeeId !== undefined ? { employeeId: patch.employeeId } : {}),
      ...(patch.contactNumber !== undefined ? { phone: patch.contactNumber } : {}),
      ...(patch.homeAddress !== undefined ? { homeAddress: patch.homeAddress } : {}),
      ...(patch.jobTitle !== undefined ? { designation: patch.jobTitle } : {}),
      ...(patch.department !== undefined ? { department: patch.department } : {}),
      ...(patch.workLocation !== undefined ? { location: patch.workLocation } : {}),
      ...(patch.startDate !== undefined ? { joinedAt: patch.startDate } : {}),
      name,
    }
    mockState = mockState.map((e) => (e.id === id ? updated : e))
    return updated
  },

  async remove(id: string): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.delete(`/employees/${id}`)
        return
      } catch (error) {
        throw new EmployeeError(apiErrorMessage(error, 'We could not delete that record.'))
      }
    }

    await delay()
    mockState = mockState.filter((e) => e.id !== id)
  },

  getDepartmentOptions() {
    return DEPARTMENTS.map((d) => ({ value: d, label: d }))
  },
}
