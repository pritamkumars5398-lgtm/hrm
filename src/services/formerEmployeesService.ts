import { apiClient } from './apiClient'

export type FormerEmployee = {
  id: string
  name: string
  jobTitle: string
  department: string
  exitDate: string
  fnfStatus: 'SETTLED' | 'IN_PROCESS'
  relievingLetterUrl?: string | null
  exitReason?: string | null
  settledAmount?: number | null
  settledDate?: string | null
  createdAt?: string
}

export type RecordExitPayload = {
  name: string
  jobTitle: string
  department: string
  exitDate: string
  fnfStatus?: 'SETTLED' | 'IN_PROCESS'
  exitReason?: string
  settledAmount?: number
}

export const formerEmployeesService = {
  getAll: async (search?: string): Promise<FormerEmployee[]> => {
    const res = await apiClient.get<FormerEmployee[]>('/former-employees', {
      params: { search: search?.trim() || undefined },
    })
    return res.data
  },

  recordExit: async (payload: RecordExitPayload): Promise<FormerEmployee> => {
    const res = await apiClient.post<FormerEmployee>('/former-employees', payload)
    return res.data
  },

  updateFnf: async (
    id: string,
    status: 'SETTLED' | 'IN_PROCESS',
    settledAmount?: number,
  ): Promise<FormerEmployee> => {
    const res = await apiClient.patch<FormerEmployee>(`/former-employees/${id}/fnf`, {
      status,
      settledAmount,
    })
    return res.data
  },

  getRelievingLetter: async (
    id: string,
  ): Promise<{ id: string; name: string; fileName: string; content: string }> => {
    const res = await apiClient.get<{ id: string; name: string; fileName: string; content: string }>(
      `/former-employees/${id}/relieving-letter`,
    )
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/former-employees/${id}`)
  },
}
