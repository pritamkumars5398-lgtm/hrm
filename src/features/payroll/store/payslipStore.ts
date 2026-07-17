import { create } from 'zustand'
import { payslipService, type Payslip } from '@/services/payslipService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

const now = new Date()
const currentMonth = () => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

type PayslipState = {
  status: Status
  month: string
  rows: Payslip[]
  error: string | null

  load: (options?: { force?: boolean }) => Promise<void>
  goToMonth: (delta: number) => Promise<void>
}

export const usePayslipStore = create<PayslipState>()((set, get) => ({
  status: 'idle',
  month: currentMonth(),
  rows: [],
  error: null,

  load: async (options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().rows.length ? 'ready' : 'loading', error: null })

    try {
      const rows = await payslipService.list(get().month)
      set({ status: 'ready', rows })
    } catch {
      set({ status: 'error', error: 'We could not load payroll for that month.' })
    }
  },

  goToMonth: async (delta) => {
    const [year, mon] = get().month.split('-').map(Number) as [number, number]
    const next = new Date(year, mon - 1 + delta, 1)
    set({ month: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}` })
    await get().load({ force: true })
  },
}))
