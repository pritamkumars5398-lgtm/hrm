import { create } from 'zustand'
import {
  leaveService,
  type ApplyLeavePayload,
  type LeaveData,
  type LeaveRequest,
  type Viewer,
} from '@/services/leaveService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type LeaveState = {
  status: Status
  data: LeaveData | null
  error: string | null

  load: (viewer: Viewer, options?: { force?: boolean }) => Promise<void>
  apply: (viewer: Viewer, payload: ApplyLeavePayload) => Promise<LeaveRequest>
  decide: (viewer: Viewer, id: string, decision: 'APPROVED' | 'REJECTED') => Promise<void>
}

export const useLeaveStore = create<LeaveState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,

  load: async (viewer, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().data ? 'ready' : 'loading', error: null })

    try {
      set({ status: 'ready', data: await leaveService.get(viewer) })
    } catch {
      set({ status: 'error', error: 'We could not load leave for your team.' })
    }
  },

  apply: async (viewer, payload) => {
    const request = await leaveService.apply(viewer, payload)
    // Refetch rather than splice: applying changes balances and the upcoming list
    // too, and recomputing those by hand in the store is how they drift.
    await get().load(viewer, { force: true })
    return request
  },

  decide: async (viewer, id, decision) => {
    await leaveService.decide(viewer, id, decision)
    await get().load(viewer, { force: true })
  },
}))
