import { create } from 'zustand'
import {
  employeeService,
  type Employee,
  type EmployeeQuery,
  type Paginated,
  type SortField,
} from '@/services/employeeService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type EmployeeState = {
  status: Status
  result: Paginated<Employee> | null
  query: Required<Pick<EmployeeQuery, 'search' | 'department' | 'status' | 'sortBy' | 'sortDir' | 'page' | 'pageSize'>>
  error: string | null

  fetch: () => Promise<void>
  /** Any filter change resets to page 1 — staying on page 4 of a 1-page result is a bug. */
  setQuery: (patch: Partial<EmployeeState['query']>) => void
  toggleSort: (field: SortField) => void
  reset: () => void
}

const INITIAL_QUERY: EmployeeState['query'] = {
  search: '',
  department: '',
  status: '',
  sortBy: 'name',
  sortDir: 'asc',
  page: 1,
  pageSize: 10,
}

export const useEmployeeStore = create<EmployeeState>()((set, get) => ({
  status: 'idle',
  result: null,
  query: INITIAL_QUERY,
  error: null,

  fetch: async () => {
    // Keep the previous rows on screen while refetching: swapping to a skeleton on
    // every keystroke makes the table flicker.
    set({ status: get().result ? 'ready' : 'loading', error: null })

    try {
      const result = await employeeService.getAll(get().query)
      set({ status: 'ready', result })
    } catch {
      set({ status: 'error', error: 'We could not load the employee directory.' })
    }
  },

  setQuery: (patch) => {
    const resetsPage = 'page' in patch ? {} : { page: 1 }
    set({ query: { ...get().query, ...patch, ...resetsPage } })
    void get().fetch()
  },

  toggleSort: (field) => {
    const { sortBy, sortDir } = get().query
    const nextDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc'

    set({ query: { ...get().query, sortBy: field, sortDir: nextDir, page: 1 } })
    void get().fetch()
  },

  reset: () => {
    set({ query: INITIAL_QUERY })
    void get().fetch()
  },
}))
