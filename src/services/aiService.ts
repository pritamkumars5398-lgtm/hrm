import { apiClient } from './apiClient'

export type AiMetrics = {
  payrollAudit: {
    status: string
    scannedCount: number
    details: string
  }
  attritionRisk: {
    flaggedCount: number
    flaggedEmployees: string[]
    riskDepartment: string
    driver: string
  }
  resumeMatch: {
    ratePercent: number
    activeJobsCount: number
    details: string
  }
  activeWorkforceCount: number
}

export type AiMessage = {
  id: string
  sender: 'user' | 'ai'
  text: string
  createdAt?: string
}

export const aiService = {
  getMetrics: async (): Promise<AiMetrics> => {
    const res = await apiClient.get<AiMetrics>('/ai-copilot/metrics')
    return res.data
  },

  getHistory: async (): Promise<AiMessage[]> => {
    const res = await apiClient.get<AiMessage[]>('/ai-copilot/history')
    return res.data
  },

  ask: async (query: string): Promise<{ id: string; response: string; category: string }> => {
    const res = await apiClient.post<{ id: string; response: string; category: string }>(
      '/ai-copilot/ask',
      { query },
    )
    return res.data
  },

  clearHistory: async (): Promise<void> => {
    await apiClient.delete('/ai-copilot/history')
  },
}
