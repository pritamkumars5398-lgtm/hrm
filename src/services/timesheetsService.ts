import { apiClient } from './apiClient'

export type TimeRow = {
  id: string
  client: string
  project: string
  task: string
  hours: number[] // 7 days Mon-Sun
  isBillable: boolean
}

export type Timesheet = {
  id: string
  organizationId: string
  userId?: string
  employeeName: string
  weekStartDate: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  rows: TimeRow[]
  totalHours: number
  billableHours: number
  submittedAt?: string
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
  createdAt?: string
}

export const timesheetsService = {
  getCurrent: async (): Promise<Timesheet> => {
    const res = await apiClient.get<Timesheet>('/timesheets/current')
    return res.data
  },

  getAll: async (): Promise<Timesheet[]> => {
    const res = await apiClient.get<Timesheet[]>('/timesheets')
    return res.data
  },

  save: async (rows: TimeRow[], weekStartDate?: string): Promise<Timesheet> => {
    const res = await apiClient.post<Timesheet>('/timesheets', {
      rows,
      weekStartDate,
    })
    return res.data
  },

  submit: async (id: string): Promise<Timesheet> => {
    const res = await apiClient.patch<Timesheet>(`/timesheets/${id}/submit`)
    return res.data
  },

  approve: async (id: string): Promise<Timesheet> => {
    const res = await apiClient.patch<Timesheet>(`/timesheets/${id}/approve`)
    return res.data
  },

  reject: async (id: string, reason: string): Promise<Timesheet> => {
    const res = await apiClient.patch<Timesheet>(`/timesheets/${id}/reject`, { reason })
    return res.data
  },
}
