import { create } from 'zustand'
import {
  salaryService,
  type CompanySalaryRow,
  type SalaryStructurePayload,
} from '@/services/salaryService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type SalaryState = {
  status: Status
  rows: CompanySalaryRow[]
  error: string | null

  load: (options?: { force?: boolean }) => Promise<void>
  revise: (employeeId: string, payload: SalaryStructurePayload) => Promise<void>
}

export const useSalaryStore = create<SalaryState>()((set, get) => ({
  status: 'idle',
  rows: [],
  error: null,

  load: async (options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().rows.length ? 'ready' : 'loading', error: null })

    try {
      const rows = await salaryService.listCompany()
      set({ status: 'ready', rows })
    } catch {
      set({ status: 'error', error: 'We could not load salary structures.' })
    }
  },

  revise: async (employeeId, payload) => {
    await salaryService.upsert(employeeId, payload)
    await get().load({ force: true })
  },
}))
