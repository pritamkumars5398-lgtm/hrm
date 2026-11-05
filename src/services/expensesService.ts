import { apiClient } from './apiClient'

export type Expense = {
  id: string
  title: string
  category: 'Travel' | 'Food' | 'Fuel' | 'Hotel' | 'Client Dinner' | 'Misc'
  amount: number
  date: string
  employee: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED'
  receiptName: string
  createdAt?: string
}

export type CreateExpensePayload = {
  title: string
  category: 'Travel' | 'Food' | 'Fuel' | 'Hotel' | 'Client Dinner' | 'Misc'
  amount: number
  date?: string
  receiptName?: string
}

export const expensesService = {
  getAll: async (status?: string): Promise<Expense[]> => {
    const res = await apiClient.get<Expense[]>('/expenses', {
      params: { status: status && status !== 'ALL' ? status : undefined },
    })
    return res.data
  },

  create: async (payload: CreateExpensePayload): Promise<Expense> => {
    const res = await apiClient.post<Expense>('/expenses', payload)
    return res.data
  },

  updateStatus: async (
    id: string,
    status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED',
  ): Promise<Expense> => {
    const res = await apiClient.patch<Expense>(`/expenses/${id}/status`, { status })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`)
  },
}
