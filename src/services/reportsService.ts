import { mockEmployees } from '@/mock/mockEmployees'
import { mockLeaveRequests } from '@/mock/mockLeave'
import { mockPayrollRuns } from '@/mock/mockPayroll'
import { buildMonth } from '@/mock/mockAttendance'
import type { Role } from './authService'

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
  /** Owner-only — HR must not see the company's payroll cost (§10). */
  payrollCost: number | null
  departments: DepartmentRow[]
  headcountByMonth: Array<{ label: string; value: number }>
}

export class ReportsError extends Error {}

/**
 * Every figure here is DERIVED from the other modules' mock data rather than
 * typed by hand. A report that disagrees with the screen it summarises is worse
 * than no report at all.
 *
 * Mock-only (§11.4) — no API, no DB model.
 */
export const reportsService = {
  async get(role: Role): Promise<ReportsData> {
    await delay()

    if (role !== 'OWNER' && role !== 'HR') {
      throw new ReportsError('Reports are restricted to owners and HR.')
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

    // Headcount trend: work backwards from today using each person's join date.
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
      // HR can run every report except the one that reveals what people are paid.
      payrollCost: role === 'OWNER' ? (mockPayrollRuns[0]?.gross ?? 0) : null,
      departments,
      headcountByMonth,
    }
  },
}
