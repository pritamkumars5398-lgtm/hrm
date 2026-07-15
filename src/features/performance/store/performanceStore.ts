import { create } from 'zustand'
import { performanceService, type PerformanceData } from '@/services/performanceService'
import type { Role } from '@/services/authService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type PerformanceState = {
  status: Status
  data: PerformanceData | null
  error: string | null
  load: (role: Role, name: string, options?: { force?: boolean }) => Promise<void>
  submitReview: (
    role: Role,
    viewerName: string,
    recordId: string,
    payload: { rating: number; summary: string },
  ) => Promise<void>
}

export const usePerformanceStore = create<PerformanceState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,

  load: async (role, name, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().data ? 'ready' : 'loading', error: null })

    try {
      set({ status: 'ready', data: await performanceService.get(role, name) })
    } catch {
      set({ status: 'error', error: 'We could not load performance data.' })
    }
  },

  submitReview: async (role, viewerName, recordId, payload) => {
    await performanceService.submitReview(role, viewerName, recordId, payload)
    await get().load(role, viewerName, { force: true })
  },
}))
