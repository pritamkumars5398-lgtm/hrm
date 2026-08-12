import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';
import type { FormDefinition, FormResponse } from '@/features/forms/store/formStore';

export class FormsError extends Error {}

export const formsService = {
  async listForms(): Promise<FormDefinition[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<FormDefinition[]>('/forms');
        return data;
      } catch (error) {
        throw new FormsError(apiErrorMessage(error, 'Could not load forms catalog.'));
      }
    }
    return [];
  },

  async createForm(payload: Omit<FormDefinition, 'id' | 'responses' | 'createdAt'>): Promise<FormDefinition> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<FormDefinition>('/forms', payload);
        return data;
      } catch (error) {
        throw new FormsError(apiErrorMessage(error, 'Could not create form.'));
      }
    }
    return {
      ...payload,
      id: `form-${Date.now()}`,
      responses: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
  },

  async deleteForm(id: string): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.delete(`/forms/${id}`);
      } catch (error) {
        throw new FormsError(apiErrorMessage(error, 'Could not delete form.'));
      }
    }
  },

  async submitResponse(formId: string, respondentName: string, answers: Record<string, string | number>): Promise<FormResponse> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<FormResponse>(`/forms/${formId}/responses`, {
          respondentName,
          answers,
        });
        return data;
      } catch (error) {
        throw new FormsError(apiErrorMessage(error, 'Could not submit form response.'));
      }
    }
    return {
      id: `resp-${Date.now()}`,
      formId,
      respondentName,
      submittedAt: new Date().toLocaleString(),
      answers,
    };
  },
};
