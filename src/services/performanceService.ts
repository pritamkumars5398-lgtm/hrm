import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { hasPermission } from '@/shared/config/navigation'
import { CURRENT_CYCLE, mockPerformance, type PerformanceRecord } from '@/mock/mockPerformance'

export type { PerformanceRecord }
export { CURRENT_CYCLE }

export class PerformanceError extends Error {}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

export type PerformanceData = {
  scope: 'company' | 'team' | 'me'
  cycle: string
  records: PerformanceRecord[]
  summary: {
    reviewed: number
    pending: number
    avgRating: number
    avgGoalProgress: number
  }
  /** Rating 1–5 → how many people got it. Drives the distribution chart. */
  distribution: Array<{ rating: number; count: number }>
}

/** Local mutable copy so ratings persist across session/refetches (mock path only). */
let performanceRecords: PerformanceRecord[] = [...mockPerformance]

/**
 * Real backend is authoritative once configured (§ Phase 3 §4.4) — company vs.
 * team vs. 'me' scope and who can review whom is decided server-side from
 * `performance.manage`/`*` and the `managerId` graph, never trusted from here.
 * The mock path exists only for the offline/no-backend demo.
 */
export const performanceService = {
  async get(permissions: string[], viewerName: string): Promise<PerformanceData> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<PerformanceData>('/performance')
        return data
      } catch (error) {
        throw new PerformanceError(apiErrorMessage(error, 'We could not load performance data.'))
      }
    }

    await delay()

    const manage = hasPermission(permissions, 'performance.manage')
    const reports = performanceRecords.filter((r) => r.managerName === viewerName)
    const scope: PerformanceData['scope'] = manage ? 'company' : reports.length > 0 ? 'team' : 'me'

    const records =
      scope === 'company'
        ? performanceRecords
        : scope === 'team'
          ? reports
          : performanceRecords.filter((r) => r.employeeName === viewerName)

    const rated = records.filter((r) => r.rating !== null)
    const allGoals = records.flatMap((r) => r.goals)

    return {
      scope,
      cycle: CURRENT_CYCLE,
      records: [...records].sort((a, b) => a.employeeName.localeCompare(b.employeeName)),
      summary: {
        reviewed: rated.length,
        pending: records.length - rated.length,
        avgRating:
          rated.length === 0
            ? 0
            : Math.round((rated.reduce((s, r) => s + r.rating!, 0) / rated.length) * 10) / 10,
        avgGoalProgress:
          allGoals.length === 0
            ? 0
            : Math.round(allGoals.reduce((s, g) => s + g.progress, 0) / allGoals.length),
      },
      distribution: [1, 2, 3, 4, 5].map((rating) => ({
        rating,
        count: rated.filter((r) => r.rating === rating).length,
      })),
    }
  },

  async submitReview(
    employeeId: string,
    viewerName: string,
    payload: { rating: number; summary: string },
  ): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.post(`/performance/reviews/${employeeId}`, payload)
        return
      } catch (error) {
        throw new PerformanceError(apiErrorMessage(error, 'We could not submit that appraisal review.'))
      }
    }

    await delay()

    const record = performanceRecords.find((r) => r.employeeId === employeeId)
    if (!record) throw new PerformanceError('Performance record not found.')

    const newReview = {
      id: `rev-${crypto.randomUUID().slice(0, 8)}`,
      cycle: CURRENT_CYCLE,
      rating: payload.rating,
      reviewer: viewerName,
      summary: payload.summary.trim(),
      reviewedOn: new Date().toISOString().slice(0, 10),
    }

    const updatedRecord: PerformanceRecord = {
      ...record,
      rating: payload.rating,
      reviews: [newReview, ...record.reviews],
    }

    performanceRecords = performanceRecords.map((r) =>
      r.employeeId === employeeId ? updatedRecord : r,
    )
  },

  async addGoal(employeeId: string, payload: { title: string; dueOn: string }): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.post(`/performance/goals/${employeeId}`, payload)
        return
      } catch (error) {
        throw new PerformanceError(apiErrorMessage(error, 'We could not add that goal.'))
      }
    }

    await delay()

    const record = performanceRecords.find((r) => r.employeeId === employeeId)
    if (!record) throw new PerformanceError('Performance record not found.')

    const newGoal = {
      id: `goal-${crypto.randomUUID().slice(0, 8)}`,
      title: payload.title.trim(),
      progress: 0,
      dueOn: payload.dueOn,
    }

    performanceRecords = performanceRecords.map((r) =>
      r.employeeId === employeeId ? { ...r, goals: [...r.goals, newGoal] } : r,
    )
  },

  async updateGoalProgress(goalId: string, progress: number): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.patch(`/performance/goals/${goalId}`, { progress })
        return
      } catch (error) {
        throw new PerformanceError(apiErrorMessage(error, 'We could not update that goal.'))
      }
    }

    await delay()

    performanceRecords = performanceRecords.map((r) => ({
      ...r,
      goals: r.goals.map((g) => (g.id === goalId ? { ...g, progress } : g)),
    }))
  },
}
