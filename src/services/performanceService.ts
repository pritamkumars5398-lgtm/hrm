import { CURRENT_CYCLE, mockPerformance, type PerformanceRecord } from '@/mock/mockPerformance'
import type { Role } from './authService'

export type { PerformanceRecord }
export { CURRENT_CYCLE }

export class PerformanceError extends Error {}

const LATENCY_MS = 550
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

export type PerformanceData = {
  scope: 'company' | 'team'
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

/** Local mutable copy so ratings persist across session/refetches. */
let performanceRecords: PerformanceRecord[] = [...mockPerformance]

export const performanceService = {
  /** Mock-only (§11.4). Owner and Manager only (§10) — HR has no Performance access. */
  async get(role: Role, viewerName: string): Promise<PerformanceData> {
    await delay()

    const scope: PerformanceData['scope'] = role === 'MANAGER' ? 'team' : 'company'

    // A Manager reviews their own reports, nobody else's.
    const records =
      scope === 'company'
        ? performanceRecords
        : performanceRecords.filter((r) => r.managerName === viewerName)

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
    _role: Role,
    viewerName: string,
    recordId: string,
    payload: { rating: number; summary: string },
  ): Promise<PerformanceRecord> {
    await delay()

    const record = performanceRecords.find((r) => r.id === recordId)
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
      r.id === recordId ? updatedRecord : r,
    )
    return updatedRecord
  },
}
