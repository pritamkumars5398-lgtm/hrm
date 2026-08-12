import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type ApprovalRequest = {
  id: string;
  sourceModule: string;
  sourceRecordId: string;
  title: string;
  summary?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy?: string;
  createdAt: string;
};

export class ApprovalsError extends Error {}

export const approvalsService = {
  async listPending(): Promise<ApprovalRequest[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<ApprovalRequest[]>('/approvals/pending');
        return data;
      } catch (error) {
        throw new ApprovalsError(apiErrorMessage(error, 'Could not load pending approvals.'));
      }
    }
    return [];
  },

  async decide(
    id: string,
    payload: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string },
  ): Promise<ApprovalRequest> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<ApprovalRequest>(`/approvals/${id}/decide`, payload);
        return data;
      } catch (error) {
        throw new ApprovalsError(apiErrorMessage(error, 'Could not process approval decision.'));
      }
    }
    return { id, sourceModule: '', sourceRecordId: '', title: '', status: payload.status, createdAt: '' };
  },
};
