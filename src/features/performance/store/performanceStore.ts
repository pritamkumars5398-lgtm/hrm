import { create } from 'zustand'
import { performanceService, type PerformanceData } from '@/services/performanceService'
import type { Role } from '@/services/authService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type PerformanceState = {
  status: Status
  data: PerformanceData | null
  error: string | null
  load: (role: Role, name: string, options?: { force?: boolean }) => Promise<void>
}

export const usePerformanceStore = create<PerformanceState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,

  load: async (role, name, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: 'loading', error: null })

    try {
      set({ status: 'ready', data: await performanceService.get(role, name) })
    } catch {
      set({ status: 'error', error: 'We could not load performance data.' })
    }
  },
}))
