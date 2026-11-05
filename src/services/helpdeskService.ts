import { apiClient } from './apiClient'

export type Ticket = {
  id: string
  ticketNo: string
  subject: string
  category: 'HR' | 'IT' | 'Finance' | 'Admin'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  requestedBy: string
  assignedTo: string
  slaHoursLeft: number
  notes?: string | null
  createdAt: string
  updatedAt?: string
}

export type CreateTicketPayload = {
  subject: string
  category: 'HR' | 'IT' | 'Finance' | 'Admin'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  notes?: string
}

export const helpdeskService = {
  getAll: async (search?: string, status?: string): Promise<Ticket[]> => {
    const res = await apiClient.get<Ticket[]>('/helpdesk', {
      params: {
        search: search?.trim() || undefined,
        status: status && status !== 'ALL' ? status : undefined,
      },
    })
    return res.data
  },

  create: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const res = await apiClient.post<Ticket>('/helpdesk', payload)
    return res.data
  },

  updateStatus: async (
    id: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  ): Promise<Ticket> => {
    const res = await apiClient.patch<Ticket>(`/helpdesk/${id}/status`, { status })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/helpdesk/${id}`)
  },
}
