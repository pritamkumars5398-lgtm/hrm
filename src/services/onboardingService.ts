import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type OnboardingTask = {
  id: string;
  title: string;
  description: string | null;
  category: 'HR' | 'IT' | 'MANAGER' | 'EMPLOYEE';
  status: 'PENDING' | 'COMPLETED';
  dueDate: string | null;
};

export type OnboardingRecord = {
  id: string;
  organizationId: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  joiningDate: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  buddy: string | null;
  checklistProgress: number;
  tasks: OnboardingTask[];
};

export type OnboardingData = {
  scope: 'company' | 'team' | 'me';
  records: OnboardingRecord[];
  summary: {
    total: number;
    pending: number;
    completed: number;
    avgProgress: number;
  };
};

export class OnboardingError extends Error {}

export const onboardingService = {
  async getOnboardings(): Promise<OnboardingData> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<OnboardingData>('/onboarding');
        return data;
      } catch (error) {
        throw new OnboardingError(apiErrorMessage(error, 'Could not load onboarding records.'));
      }
    }
    return {
      scope: 'company',
      records: [],
      summary: { total: 0, pending: 0, completed: 0, avgProgress: 0 },
    };
  },

  async addTask(employeeId: string, payload: { title: string; description?: string; category: OnboardingTask['category']; dueDate?: string }): Promise<OnboardingTask> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<OnboardingTask>(`/onboarding/${employeeId}/tasks`, payload);
        return data;
      } catch (error) {
        throw new OnboardingError(apiErrorMessage(error, 'Could not add onboarding task.'));
      }
    }
    return {
      id: `task-${Date.now()}`,
      title: payload.title,
      description: payload.description || null,
      category: payload.category,
      status: 'PENDING',
      dueDate: payload.dueDate || null,
    };
  },

  async updateTaskStatus(taskId: string, status: OnboardingTask['status']): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.patch(`/onboarding/tasks/${taskId}`, { status });
      } catch (error) {
        throw new OnboardingError(apiErrorMessage(error, 'Could not update onboarding task status.'));
      }
    }
  },

  async completeOnboarding(employeeId: string): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.post(`/onboarding/${employeeId}/complete`);
      } catch (error) {
        throw new OnboardingError(apiErrorMessage(error, 'Could not complete onboarding checklist.'));
      }
    }
  },
};
