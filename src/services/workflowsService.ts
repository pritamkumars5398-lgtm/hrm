import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

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

const SEED_WORKFLOWS: WorkflowRule[] = [
  {
    id: 'wf-1',
    name: 'New Employee Equipment Provisioning',
    trigger: 'employee.created',
    condition: "department == 'Engineering'",
    action: 'Send IT ticket: Assign M3 Max MacBook Pro & YubiKey',
    status: 'ACTIVE',
    executedCount: 14,
    lastExecutedAt: '2026-03-12 11:20:00',
    createdAt: '2026-01-15',
  },
  {
    id: 'wf-2',
    name: 'Leave Approval Escalation Alert',
    trigger: 'leave.submitted',
    condition: 'days > 3 && duration_hours > 48',
    action: 'Notify Department Manager & Slack #hr-alerts',
    status: 'ACTIVE',
    executedCount: 29,
    lastExecutedAt: '2026-03-14 09:15:00',
    createdAt: '2026-01-20',
  },
  {
    id: 'wf-3',
    name: 'Auto Welcome Pack & Company Handbook Email',
    trigger: 'invite.accepted',
    condition: 'true',
    action: 'Email PDF Handbook & Setup Checklist to personal email',
    status: 'ACTIVE',
    executedCount: 38,
    lastExecutedAt: '2026-03-11 16:45:00',
    createdAt: '2026-02-01',
  },
]

let mockWorkflows: WorkflowRule[] = [...SEED_WORKFLOWS]

export const workflowsService = {
  getAll: async (): Promise<WorkflowRule[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<WorkflowRule[]>('/workflows')
        return res.data
      } catch {}
    }
    return mockWorkflows
  },

  create: async (payload: CreateWorkflowPayload): Promise<WorkflowRule> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<WorkflowRule>('/workflows', payload)
        return res.data
      } catch {}
    }
    const newWf: WorkflowRule = {
      id: `wf-${crypto.randomUUID().slice(0, 8)}`,
      name: payload.name,
      trigger: payload.trigger,
      condition: payload.condition || 'true',
      action: payload.action,
      status: 'ACTIVE',
      executedCount: 0,
      lastExecutedAt: null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mockWorkflows = [newWf, ...mockWorkflows]
    return newWf
  },

  toggleStatus: async (id: string): Promise<WorkflowRule> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch<WorkflowRule>(`/workflows/${id}/toggle`)
        return res.data
      } catch {}
    }
    const idx = mockWorkflows.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Workflow not found')
    const current = mockWorkflows[idx]!
    const updated: WorkflowRule = {
      ...current,
      status: current.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
    }
    mockWorkflows[idx] = updated
    return updated
  },

  testRun: async (id: string): Promise<WorkflowRule> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<WorkflowRule>(`/workflows/${id}/test-run`)
        return res.data
      } catch {}
    }
    const idx = mockWorkflows.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Workflow not found')
    const current = mockWorkflows[idx]!
    const updated: WorkflowRule = {
      ...current,
      executedCount: current.executedCount + 1,
      lastExecutedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    mockWorkflows[idx] = updated
    return updated
  },

  delete: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/workflows/${id}`)
        return
      } catch {}
    }
    mockWorkflows = mockWorkflows.filter((w) => w.id !== id)
  },
}
