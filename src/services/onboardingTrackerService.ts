import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

export type OnboardingTask = {
  id: string
  title: string
  category: 'DOCS' | 'IT' | 'HR' | 'TRAINING'
  completed: boolean
  completedAt?: string
}

export type OnboardingItem = {
  id: string
  organizationId?: string
  employeeId?: string | null
  name: string
  email?: string
  jobTitle: string
  department: string
  joiningDate: string
  checklistProgress: number // 0-100%
  status: 'IN_PROGRESS' | 'COMPLETED'
  buddy: string
  tasks: OnboardingTask[]
  createdAt?: string
}

export type CreateOnboardingPayload = {
  name: string
  email?: string
  jobTitle: string
  department: string
  joiningDate: string
  buddy?: string
  employeeId?: string
}

const DEFAULT_TASKS: OnboardingTask[] = [
  { id: 'tsk-1', title: 'Sign employment agreement & NDA', category: 'DOCS', completed: true },
  { id: 'tsk-2', title: 'Submit government ID & tax declaration', category: 'DOCS', completed: true },
  { id: 'tsk-3', title: 'Issue company laptop & 2FA credentials', category: 'IT', completed: true },
  { id: 'tsk-4', title: 'Setup Google Workspace & Slack accounts', category: 'IT', completed: false },
  { id: 'tsk-5', title: 'Complete compliance and POSH training', category: 'TRAINING', completed: false },
  { id: 'tsk-6', title: 'Schedule 1:1 induction with department lead', category: 'HR', completed: false },
]

const SEED_ONBOARDINGS: OnboardingItem[] = [
  {
    id: 'onb-1',
    name: 'Dan Whitfield',
    email: 'dan.whitfield@keystone.io',
    jobTitle: 'Account Executive',
    department: 'Sales',
    joiningDate: '2026-05-04',
    checklistProgress: 50,
    status: 'IN_PROGRESS',
    buddy: 'Elena Rossi',
    tasks: [...DEFAULT_TASKS],
    createdAt: '2026-05-01',
  },
  {
    id: 'onb-2',
    name: 'Marco Silva',
    email: 'marco.silva@keystone.io',
    jobTitle: 'Associate PM',
    department: 'Product',
    joiningDate: '2026-04-13',
    checklistProgress: 83,
    status: 'IN_PROGRESS',
    buddy: 'Ruth Adeyemi',
    tasks: DEFAULT_TASKS.map((t, i) => (i < 5 ? { ...t, completed: true } : t)),
    createdAt: '2026-04-10',
  },
  {
    id: 'onb-3',
    name: 'Oscar Lindgren',
    email: 'oscar.lindgren@keystone.io',
    jobTitle: 'Junior Engineer',
    department: 'Engineering',
    joiningDate: '2026-06-01',
    checklistProgress: 100,
    status: 'COMPLETED',
    buddy: 'Kai Tanaka',
    tasks: DEFAULT_TASKS.map((t) => ({ ...t, completed: true })),
    createdAt: '2026-05-25',
  },
]

let mockOnboardings: OnboardingItem[] = [...SEED_ONBOARDINGS]

export const onboardingTrackerService = {
  getAll: async (status?: string): Promise<OnboardingItem[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<OnboardingItem[]>('/onboarding', {
          params: { status: status && status !== 'ALL' ? status : undefined },
        })
        return res.data
      } catch {}
    }

    if (status && status !== 'ALL') {
      return mockOnboardings.filter((o) => o.status === status)
    }
    return mockOnboardings
  },

  getById: async (id: string): Promise<OnboardingItem> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<OnboardingItem>(`/onboarding/${id}`)
        return res.data
      } catch {}
    }
    const found = mockOnboardings.find((o) => o.id === id)
    if (!found) throw new Error('Onboarding record not found')
    return found
  },

  create: async (payload: CreateOnboardingPayload): Promise<OnboardingItem> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<OnboardingItem>('/onboarding', payload)
        return res.data
      } catch {}
    }
    const newItem: OnboardingItem = {
      id: `onb-${crypto.randomUUID().slice(0, 8)}`,
      name: payload.name,
      email: payload.email,
      jobTitle: payload.jobTitle,
      department: payload.department,
      joiningDate: payload.joiningDate,
      buddy: payload.buddy || 'Assigned Buddy',
      checklistProgress: 0,
      status: 'IN_PROGRESS',
      tasks: DEFAULT_TASKS.map((t) => ({ ...t, completed: false })),
      createdAt: new Date().toISOString(),
    }
    mockOnboardings = [newItem, ...mockOnboardings]
    return newItem
  },

  update: async (id: string, payload: Partial<OnboardingItem>): Promise<OnboardingItem> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch<OnboardingItem>(`/onboarding/${id}`, payload)
        return res.data
      } catch {}
    }
    const idx = mockOnboardings.findIndex((o) => o.id === id)
    if (idx !== -1) {
      mockOnboardings[idx] = { ...mockOnboardings[idx], ...payload }
      return mockOnboardings[idx]
    }
    throw new Error('Onboarding record not found')
  },

  toggleTask: async (id: string, taskId: string, completed: boolean): Promise<OnboardingItem> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch<OnboardingItem>(`/onboarding/${id}/tasks/${taskId}`, {
          completed,
        })
        return res.data
      } catch {}
    }
    const item = mockOnboardings.find((o) => o.id === id)
    if (!item) throw new Error('Onboarding record not found')
    item.tasks = item.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t))
    const completedCount = item.tasks.filter((t) => t.completed).length
    item.checklistProgress = Math.round((completedCount / item.tasks.length) * 100)
    if (item.checklistProgress === 100) item.status = 'COMPLETED'
    return { ...item }
  },

  delete: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/onboarding/${id}`)
        return
      } catch {}
    }
    mockOnboardings = mockOnboardings.filter((o) => o.id !== id)
  },
}
