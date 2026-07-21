import { create } from 'zustand'
import { performanceService, type PerformanceData } from '@/services/performanceService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type PerformanceState = {
  status: Status
  data: PerformanceData | null
  error: string | null
  load: (permissions: string[], viewerName: string, options?: { force?: boolean }) => Promise<void>
  submitReview: (
    permissions: string[],
    viewerName: string,
    employeeId: string,
    payload: { rating: number; summary: string },
  ) => Promise<void>
  addGoal: (
    permissions: string[],
    viewerName: string,
    employeeId: string,
    payload: { title: string; dueOn: string },
  ) => Promise<void>
  updateGoalProgress: (
    permissions: string[],
    viewerName: string,
    goalId: string,
    progress: number,
  ) => Promise<void>
}

export const usePerformanceStore = create<PerformanceState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,

  load: async (permissions, viewerName, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().data ? 'ready' : 'loading', error: null })

    try {
      set({ status: 'ready', data: await performanceService.get(permissions, viewerName) })
    } catch {
      set({ status: 'error', error: 'We could not load performance data.' })
    }
  },

  submitReview: async (permissions, viewerName, employeeId, payload) => {
    await performanceService.submitReview(employeeId, viewerName, payload)
    await get().load(permissions, viewerName, { force: true })
  },

  addGoal: async (permissions, viewerName, employeeId, payload) => {
    await performanceService.addGoal(employeeId, payload)
    await get().load(permissions, viewerName, { force: true })
  },

  updateGoalProgress: async (permissions, viewerName, goalId, progress) => {
    await performanceService.updateGoalProgress(goalId, progress)
    await get().load(permissions, viewerName, { force: true })
  },
}))
