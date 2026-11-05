import { apiClient } from './apiClient'

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

export const onboardingTrackerService = {
  getAll: async (status?: string): Promise<OnboardingItem[]> => {
    const res = await apiClient.get<OnboardingItem[]>('/onboarding', {
      params: { status: status && status !== 'ALL' ? status : undefined },
    })
    return res.data
  },

  getById: async (id: string): Promise<OnboardingItem> => {
    const res = await apiClient.get<OnboardingItem>(`/onboarding/${id}`)
    return res.data
  },

  create: async (payload: CreateOnboardingPayload): Promise<OnboardingItem> => {
    const res = await apiClient.post<OnboardingItem>('/onboarding', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<OnboardingItem>): Promise<OnboardingItem> => {
    const res = await apiClient.patch<OnboardingItem>(`/onboarding/${id}`, payload)
    return res.data
  },

  toggleTask: async (id: string, taskId: string, completed: boolean): Promise<OnboardingItem> => {
    const res = await apiClient.patch<OnboardingItem>(`/onboarding/${id}/tasks/${taskId}`, {
      completed,
    })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/onboarding/${id}`)
  },
}
