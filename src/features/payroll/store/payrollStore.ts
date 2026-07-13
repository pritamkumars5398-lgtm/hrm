import { create } from 'zustand'
import { payrollService, type PayrollData } from '@/services/payrollService'
import type { Role } from '@/services/authService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type PayrollState = {
  status: Status
  data: PayrollData | null
  error: string | null
  period: string | null

  load: (role: Role, options?: { force?: boolean }) => Promise<void>
  selectPeriod: (role: Role, period: string) => Promise<void>
}

export const usePayrollStore = create<PayrollState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,
  period: null,

  load: async (role, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().data ? 'ready' : 'loading', error: null })

    try {
      const data = await payrollService.get(role, get().period ?? undefined)
      set({ status: 'ready', data, period: data.selected.period })
    } catch {
      set({ status: 'error', error: 'We could not load payroll.' })
    }
  },

  selectPeriod: async (role, period) => {
    set({ period })
    await get().load(role, { force: true })
  },
}))
