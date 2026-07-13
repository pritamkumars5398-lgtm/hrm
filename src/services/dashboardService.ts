import {
  mockActivity,
  mockDashboardStats,
  type ActivityItem,
  type DashboardStat,
} from '@/mock/mockDashboard'
import type { Role } from './authService'

export type { ActivityItem, DashboardStat }

export type DashboardData = {
  stats: DashboardStat[]
  activity: ActivityItem[]
}

const LATENCY_MS = 600
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/**
 * Mock-only — dashboard figures are HR business data, which stays out of the
 * backend until Phase 2 (§11.4). The signature is the one the real API will
 * implement, so no component changes when it does.
 */
export const dashboardService = {
  async get(role: Role): Promise<DashboardData> {
    await delay()

    return {
      // Filtering here rather than in the component: a figure a role may not see
      // should not reach the browser at all once this is a real API.
      stats: mockDashboardStats.filter((s) => !s.restrictedTo || s.restrictedTo.includes(role)),
      activity: mockActivity,
    }
  },
}
