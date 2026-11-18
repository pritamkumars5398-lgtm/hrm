import { hasBackend } from '@/config/env'
import { hasPermission } from '@/shared/config/navigation'
import { apiClient, apiErrorMessage } from './apiClient'
import {
  mockActivity,
  mockDashboardStats,
  type ActivityItem as MockActivityItem,
  type DashboardStat,
} from '@/mock/mockDashboard'
import { buildMonth } from '@/mock/mockAttendance'
import { mockLeaveRequests, type LeaveType } from '@/mock/mockLeave'
import { leaveService } from './leaveService'
import type { Role } from './authService'

export type { DashboardStat }
export type ActivityItem = MockActivityItem & { occurredAt?: string }

export type WeeklyAttendancePoint = { label: string; present: number; expected: number }
export type LeaveBreakdownSlice = { type: LeaveType; days: number }
export type UpcomingLeaveItem = {
  id: string
  employeeName: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
}

export type DashboardData = {
  stats: DashboardStat[]
  activity: ActivityItem[]
  weeklyAttendance: WeeklyAttendancePoint[]
  leaveBreakdown: LeaveBreakdownSlice[]
  pendingLeaveCount: number
  upcomingLeave: UpcomingLeaveItem[]
}

export class DashboardError extends Error {}

const LATENCY_MS = 600
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))
const toISO = (d: Date) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Real backend once configured — every tile, chart and activity row is
 * filtered server-side by the caller's real permissions (§4.7), never
 * trimmed here after the fact. The mock path exists for the offline/
 * no-backend demo.
 */
export const dashboardService = {
  async get(permissions: string[], role?: Role): Promise<DashboardData> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<DashboardData>('/dashboard')
        return data
      } catch (error) {
        throw new DashboardError(apiErrorMessage(error, 'We could not load your dashboard.'))
      }
    }

    await delay()

    const canSeeAttendance = hasPermission(permissions, 'attendance.manage') || role === 'MANAGER'
    const canSeeLeave = hasPermission(permissions, 'leave.approve') || role === 'MANAGER'

    const today = new Date()
    const weeklyAttendance: WeeklyAttendancePoint[] = []
    if (canSeeAttendance) {
      // The mock generator builds a whole month at a time — span this month
      // and, if the trailing week crosses into it, last month too.
      const thisMonth = buildMonth(today.getFullYear(), today.getMonth())
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const lastMonth = buildMonth(lastMonthDate.getFullYear(), lastMonthDate.getMonth())
      const byDate = new Map<string, typeof thisMonth>()
      for (const r of [...thisMonth, ...lastMonth]) {
        const bucket = byDate.get(r.date) ?? []
        bucket.push(r)
        byDate.set(r.date, bucket)
      }

      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const iso = toISO(d)
        const rows = byDate.get(iso) ?? []
        const present = rows.filter((r) => ['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status)).length
        weeklyAttendance.push({
          label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
          present,
          expected: rows.length,
        })
      }
    }

    const allRequests = leaveService.getAllRequests()
    let leaveBreakdown: LeaveBreakdownSlice[] = []
    let pendingLeaveCount = 0
    let upcomingLeave: UpcomingLeaveItem[] = []
    if (canSeeLeave) {
      const yearStart = `${today.getFullYear()}-01-01`
      const approvedThisYear = allRequests.filter((r) => r.status === 'APPROVED' && r.startDate >= yearStart)
      leaveBreakdown = (['ANNUAL', 'SICK', 'PERSONAL', 'UNPAID'] as LeaveType[])
        .map((type) => ({
          type,
          days: approvedThisYear.filter((r) => r.type === type).reduce((sum, r) => sum + r.days, 0),
        }))
        .filter((slice) => slice.days > 0)

      pendingLeaveCount = role === 'MANAGER' ? 1 : leaveService.getPendingCount()

      const todayISO = toISO(today)
      upcomingLeave = allRequests
        .filter((r) => r.status === 'APPROVED' && r.startDate >= todayISO)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          employeeName: r.employeeName,
          type: r.type,
          startDate: r.startDate,
          endDate: r.endDate,
          days: r.days,
        }))
    }

    // Role-specific stats for Manager
    let stats: DashboardStat[]
    if (role === 'MANAGER') {
      stats = [
        {
          id: 'st-headcount',
          organizationId: 'org-alderway',
          label: 'Team Members',
          value: '12',
          delta: 'Engineering team',
        },
        {
          id: 'st-present',
          organizationId: 'org-alderway',
          label: 'Present today',
          value: '11',
          delta: '92% attendance',
        },
        {
          id: 'st-leave',
          organizationId: 'org-alderway',
          label: 'On leave',
          value: '1',
          delta: '1 pending review',
        },
      ]
    } else {
      stats = mockDashboardStats
        .map((s) => {
          if (s.id === 'st-leave') {
            return { ...s, delta: `${leaveService.getPendingCount()} pending approval` }
          }
          return s
        })
        .filter(
          (s) => !s.restrictedPermission || hasPermission(permissions, s.restrictedPermission),
        )
    }

    return {
      stats,
      activity: mockActivity,
      weeklyAttendance,
      leaveBreakdown,
      pendingLeaveCount,
      upcomingLeave,
    }
  },
}
