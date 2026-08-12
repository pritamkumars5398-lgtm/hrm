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
  activeCount?: number
  inactiveCount?: number
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
  dob?: string
  gender?: string
}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Mutable copy for the offline path, so edit/delete persist within a session. */
let mockState: Employee[] = [...mockEmployees]

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

  // Calculate counts across the entire source list (before pagination or filters)
  const activeCount = source.filter((e) => e.status !== 'INACTIVE').length
  const inactiveCount = source.filter((e) => e.status === 'INACTIVE').length

  let rows = source.filter((e) => {
    const matchesTerm =
      !term ||
      e.name.toLowerCase().includes(term) ||
      (e.employeeId ?? '').toLowerCase().includes(term) ||
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
        return (a.department.localeCompare(b.department) || a.name.localeCompare(b.name)) * factor
      case 'status':
        return (a.status.localeCompare(b.status) || a.name.localeCompare(b.name)) * factor
      default:
        return a.name.localeCompare(b.name) * factor
    }
  })

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize

  return {
    rows: rows.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
    activeCount,
    inactiveCount,
  }
}

export const employeeService = {
  async getAll(query: EmployeeQuery = {}, apiStatus?: 'ACTIVE' | 'INACTIVE' | 'ALL'): Promise<Paginated<Employee>> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Employee[]>('/employees', { params: { status: apiStatus || 'ALL' } })
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

  // ── Sub-resource fetchers (real API only) ──────────────────────────────

  async getAttendance(id: string): Promise<any[]> {
    try {
      const { data } = await apiClient.get<any[]>(`/employees/${id}/attendance`)
      return data
    } catch {
      return []
    }
  },

  async getLeave(id: string): Promise<any[]> {
    try {
      const { data } = await apiClient.get<any[]>(`/employees/${id}/leave`)
      return data
    } catch {
      return []
    }
  },

  async getPayroll(id: string): Promise<any[]> {
    try {
      const { data } = await apiClient.get<any[]>(`/employees/${id}/payroll`)
      return data
    } catch {
      return []
    }
  },

  async getPerformance(id: string): Promise<{ goals: any[]; reviews: any[] }> {
    try {
      const { data } = await apiClient.get<{ goals: any[]; reviews: any[] }>(`/employees/${id}/performance`)
      return data
    } catch {
      return { goals: [], reviews: [] }
    }
  },

  async getDocuments(id: string): Promise<any[]> {
    try {
      const { data } = await apiClient.get<any[]>(`/employees/${id}/documents`)
      return data
    } catch {
      return []
    }
  },

  async getHistory(id: string): Promise<{ employmentHistory: any[]; auditLogs: any[] }> {
    try {
      const { data } = await apiClient.get<{ employmentHistory: any[]; auditLogs: any[] }>(`/employees/${id}/history`)
      return data
    } catch {
      return { employmentHistory: [], auditLogs: [] }
    }
  },

  getDepartmentOptions() {
    return DEPARTMENTS.map((d) => ({ value: d, label: d }))
  },
}
