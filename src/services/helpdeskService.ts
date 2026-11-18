import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

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

const SEED_TICKETS: Ticket[] = [
  {
    id: 'tkt-1',
    ticketNo: 'HD-1042',
    subject: 'MacBook Pro screen flickering and HDMI port issue',
    category: 'IT',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    requestedBy: 'Dan Whitfield',
    assignedTo: 'IT Support Desk',
    slaHoursLeft: 6,
    notes: 'Hardware diagnostic scheduled for Thursday 2 PM.',
    createdAt: '2026-03-12',
  },
  {
    id: 'tkt-2',
    ticketNo: 'HD-1043',
    subject: 'Request for proof of employment letter for mortgage application',
    category: 'HR',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    requestedBy: 'Aisha Rahman',
    assignedTo: 'Marta Lindqvist',
    slaHoursLeft: 24,
    notes: 'Official stamped letter generated and emailed.',
    createdAt: '2026-03-10',
  },
  {
    id: 'tkt-3',
    ticketNo: 'HD-1044',
    subject: 'Clarification on February tax deduction on payslip',
    category: 'Finance',
    priority: 'LOW',
    status: 'OPEN',
    requestedBy: 'Lucas Meyer',
    assignedTo: 'Payroll Ops',
    slaHoursLeft: 42,
    notes: 'Reviewing statutory tax slab adjustment.',
    createdAt: '2026-03-14',
  },
]

let mockTickets: Ticket[] = [...SEED_TICKETS]

export const helpdeskService = {
  getAll: async (search?: string, status?: string): Promise<Ticket[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<Ticket[]>('/helpdesk', {
          params: {
            search: search?.trim() || undefined,
            status: status && status !== 'ALL' ? status : undefined,
          },
        })
        return res.data
      } catch {}
    }
    const q = (search || '').toLowerCase().trim()
    return mockTickets.filter(
      (t) =>
        (!status || status === 'ALL' || t.status === status) &&
        (!q ||
          t.subject.toLowerCase().includes(q) ||
          t.ticketNo.toLowerCase().includes(q) ||
          t.requestedBy.toLowerCase().includes(q)),
    )
  },

  create: async (payload: CreateTicketPayload): Promise<Ticket> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<Ticket>('/helpdesk', payload)
        return res.data
      } catch {}
    }
    const num = Math.floor(1050 + Math.random() * 500)
    const newTicket: Ticket = {
      id: `tkt-${crypto.randomUUID().slice(0, 8)}`,
      ticketNo: `HD-${num}`,
      subject: payload.subject,
      category: payload.category,
      priority: payload.priority || 'MEDIUM',
      status: 'OPEN',
      requestedBy: 'Samuel Green',
      assignedTo: `${payload.category} Team`,
      slaHoursLeft: 48,
      notes: payload.notes || null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mockTickets = [newTicket, ...mockTickets]
    return newTicket
  },

  updateStatus: async (
    id: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
  ): Promise<Ticket> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch<Ticket>(`/helpdesk/${id}/status`, { status })
        return res.data
      } catch {}
    }
    const idx = mockTickets.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Ticket not found')
    mockTickets[idx] = { ...mockTickets[idx]!, status }
    return mockTickets[idx]!
  },

  delete: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/helpdesk/${id}`)
        return
      } catch {}
    }
    mockTickets = mockTickets.filter((t) => t.id !== id)
  },
}
