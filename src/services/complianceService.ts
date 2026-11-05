import { apiClient } from './apiClient'

export type ComplianceItem = {
  id: string
  name: string
  authority: string
  dueDate: string
  status: 'FILED' | 'PENDING' | 'UPCOMING'
  penaltyRisk: string
  filedDate?: string | null
  acknowledgementNo?: string | null
  period?: string | null
  createdAt?: string
}

export type ComplianceMetrics = {
  scorePercent: number
  filedCount: number
  pendingCount: number
  upcomingCount: number
  form16Status: string
  upcomingDeadline: string
}

export type ComplianceResponse = {
  items: ComplianceItem[]
  metrics: ComplianceMetrics
}

export type CreateCompliancePayload = {
  name: string
  authority: string
  dueDate: string
  penaltyRisk: string
  period?: string
}

export const complianceService = {
  getAll: async (): Promise<ComplianceResponse> => {
    const res = await apiClient.get<ComplianceResponse>('/compliance')
    return res.data
  },

  create: async (payload: CreateCompliancePayload): Promise<ComplianceItem> => {
    const res = await apiClient.post<ComplianceItem>('/compliance', payload)
    return res.data
  },

  markFiled: async (id: string, acknowledgementNo?: string): Promise<ComplianceItem> => {
    const res = await apiClient.patch<ComplianceItem>(`/compliance/${id}/filed`, {
      acknowledgementNo,
    })
    return res.data
  },

  exportEcr: async (): Promise<{ fileName: string; content: string }> => {
    const res = await apiClient.get<{ fileName: string; content: string }>('/compliance/export/ecr')
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/compliance/${id}`)
  },
}
