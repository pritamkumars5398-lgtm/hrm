import { create } from 'zustand'
import { attendanceService, type AttendanceMonth } from '@/services/attendanceService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type Viewer = { permissions: string[]; name: string }

type AttendanceState = {
  status: Status
  data: AttendanceMonth | null
  error: string | null
  year: number
  month: number
  selectedDate: string | null
  /** True while a check-in/out request is in flight — disables the button. */
  checkingInOut: boolean

  load: (viewer: Viewer, options?: { force?: boolean }) => Promise<void>
  goToMonth: (viewer: Viewer, delta: number) => Promise<void>
  selectDate: (viewer: Viewer, date: string) => Promise<void>
  checkIn: (viewer: Viewer) => Promise<{ ok: boolean; error?: string }>
  checkOut: (viewer: Viewer) => Promise<{ ok: boolean; error?: string }>
}

const now = new Date()

export const useAttendanceStore = create<AttendanceState>()((set, get) => ({
  status: 'idle',
  data: null,
  error: null,
  year: now.getFullYear(),
  month: now.getMonth(),
  selectedDate: null,
  checkingInOut: false,

  load: async (viewer, options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    // Keep the previous month on screen while the next one loads, so paging
    // between months doesn't flash an empty grid.
    set({ status: get().data ? 'ready' : 'loading', error: null })

    try {
      const data = await attendanceService.getMonth({
        year: get().year,
        month: get().month,
        selectedDate: get().selectedDate ?? undefined,
        permissions: viewer.permissions,
        viewerName: viewer.name,
      })

      set({ status: 'ready', data, selectedDate: data.todayDate })
    } catch {
      set({ status: 'error', error: 'We could not load attendance for this month.' })
    }
  },

  goToMonth: async (viewer, delta) => {
    const next = new Date(get().year, get().month + delta, 1)

    set({
      year: next.getFullYear(),
      month: next.getMonth(),
      // The selected day belongs to the old month — let the service pick a new one.
      selectedDate: null,
    })

    await get().load(viewer, { force: true })
  },

  selectDate: async (viewer, date) => {
    set({ selectedDate: date })
    await get().load(viewer, { force: true })
  },

  checkIn: async (viewer) => {
    set({ checkingInOut: true })
    try {
      await attendanceService.checkIn()
      await get().load(viewer, { force: true })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Could not check in.' }
    } finally {
      set({ checkingInOut: false })
    }
  },

  checkOut: async (viewer) => {
    set({ checkingInOut: true })
    try {
      await attendanceService.checkOut()
      await get().load(viewer, { force: true })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'Could not check out.' }
    } finally {
      set({ checkingInOut: false })
    }
  },
}))
