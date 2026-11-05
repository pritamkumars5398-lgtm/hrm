import { apiClient } from './apiClient'

export type WorkflowRule = {
  id: string
  name: string
  trigger: string
  condition: string
  action: string
  status: 'ACTIVE' | 'PAUSED'
  executedCount: number
  lastExecutedAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CreateWorkflowPayload = {
  name: string
  trigger: string
  condition?: string
  action: string
}

export const workflowsService = {
  getAll: async (): Promise<WorkflowRule[]> => {
    const res = await apiClient.get<WorkflowRule[]>('/workflows')
    return res.data
  },

  create: async (payload: CreateWorkflowPayload): Promise<WorkflowRule> => {
    const res = await apiClient.post<WorkflowRule>('/workflows', payload)
    return res.data
  },

  toggleStatus: async (id: string): Promise<WorkflowRule> => {
    const res = await apiClient.patch<WorkflowRule>(`/workflows/${id}/toggle`)
    return res.data
  },

  testRun: async (id: string): Promise<WorkflowRule> => {
    const res = await apiClient.post<WorkflowRule>(`/workflows/${id}/test-run`)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/workflows/${id}`)
  },
}
