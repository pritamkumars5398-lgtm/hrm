import { hasBackend } from '@/config/env'
import { hasPermission } from '@/shared/config/navigation'
import { apiClient, apiErrorMessage } from './apiClient'
import { mockEmployees } from '@/mock/mockEmployees'
import { mockLeaveRequests } from '@/mock/mockLeave'
import { mockPayrollRuns } from '@/mock/mockPayroll'
import { buildMonth } from '@/mock/mockAttendance'

const LATENCY_MS = 650
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

export type DepartmentRow = {
  department: string
  headcount: number
  attendanceRate: number
  leaveDaysTaken: number
  share: number
}

export type ReportsData = {
  headcount: number
  activeCount: number
  attritionRate: number
  avgAttendance: number
  leaveDaysTaken: number
  /** Null unless the caller holds payroll.view/payroll.manage/* — never just reports.view (§10). */
  payrollCost: number | null
  departments: DepartmentRow[]
  headcountByMonth: Array<{ label: string; value: number }>
}

export class ReportsError extends Error {}

/**
 * Real backend once configured — every figure is aggregated server-side from
 * the other real modules (Employees, Attendance, Leave, Payroll), scoped by
 * organizationId. The mock path exists for the offline/no-backend demo and
 * derives from the mock data the same way this used to work end-to-end.
 */
export const reportsService = {
  async get(permissions: string[]): Promise<ReportsData> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<ReportsData>('/reports')
        return data
      } catch (error) {
        throw new ReportsError(apiErrorMessage(error, 'We could not build your reports.'))
      }
    }

    await delay()

    if (!hasPermission(permissions, 'reports.view')) {
      throw new ReportsError('Reports are restricted to those with reports access.')
    }

    const active = mockEmployees.filter((e) => e.status !== 'INACTIVE')
    const leavers = mockEmployees.filter((e) => e.status === 'INACTIVE' || e.status === 'NOTICE')

    const now = new Date()
    const attendance = buildMonth(now.getFullYear(), now.getMonth())
    const workdays = attendance.filter((r) => r.status !== 'WEEKEND')
    const attended = workdays.filter((r) =>
      ['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status),
    )

    const approvedLeave = mockLeaveRequests.filter((r) => r.status === 'APPROVED')

    const departments: DepartmentRow[] = [...new Set(active.map((e) => e.department))]
      .map((department) => {
        const people = active.filter((e) => e.department === department)
        const ids = new Set(people.map((p) => p.id))

        const deptWorkdays = workdays.filter((r) => ids.has(r.employeeId))
        const deptAttended = deptWorkdays.filter((r) =>
          ['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status),
        )

        return {
          department,
          headcount: people.length,
          attendanceRate:
            deptWorkdays.length === 0
              ? 0
              : Math.round((deptAttended.length / deptWorkdays.length) * 1000) / 10,
          leaveDaysTaken: approvedLeave
            .filter((r) => ids.has(r.employeeId))
            .reduce((sum, r) => sum + r.days, 0),
          share: Math.round((people.length / active.length) * 1000) / 10,
        }
      })
      .sort((a, b) => b.headcount - a.headcount)

    const headcountByMonth = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const cutoff = date.toISOString().slice(0, 10)

      return {
        label: date.toLocaleDateString('en-GB', { month: 'short' }),
        value: mockEmployees.filter((e) => e.joinedAt <= cutoff && e.status !== 'INACTIVE').length,
      }
    })

    return {
      headcount: mockEmployees.length,
      activeCount: active.length,
      attritionRate: Math.round((leavers.length / mockEmployees.length) * 1000) / 10,
      avgAttendance:
        workdays.length === 0
          ? 0
          : Math.round((attended.length / workdays.length) * 1000) / 10,
      leaveDaysTaken: approvedLeave.reduce((sum, r) => sum + r.days, 0),
      payrollCost: hasPermission(permissions, 'payroll.view')
        ? Math.round((mockPayrollRuns[0]?.gross ?? 0) / 100)
        : null,
      departments,
      headcountByMonth,
    }
  },

  /** Downloads the real CSV export. No mock equivalent — there is no file to export offline. */
  async exportCsv(): Promise<void> {
    if (!hasBackend) {
      throw new ReportsError('Export requires a connected backend.')
    }

    try {
      const { data } = await apiClient.get('/reports/export', { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(data as Blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = 'reports.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      throw new ReportsError(apiErrorMessage(error, 'We could not export your reports.'))
    }
  },
}
