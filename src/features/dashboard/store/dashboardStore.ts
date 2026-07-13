import { create } from 'zustand'
import { dashboardService, type DashboardData } from '@/services/dashboardService'
import type { Role } from '@/services/authService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type DashboardState = {
  status: Status
  data: DashboardData | null
  error: string | null
  /** Cached after the first load — navigating away and back is instant (§9). */
  load: (role: Role, options?: { force?: boolean }) => Promise<void>
}

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,

  load: async (role, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: 'loading', error: null })

    try {
      const data = await dashboardService.get(role)
      set({ status: 'ready', data })
    } catch {
      set({ status: 'error', error: 'We could not load your dashboard.' })
    }
  },
}))
