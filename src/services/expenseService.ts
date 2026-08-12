import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type ExpenseClaim = {
  id: string;
  title: string;
  category: string;
  amount: number;
  claimDate: string;
  receiptUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  rejectionReason?: string | null;
  employeeName?: string;
  history?: { status: string; changedAt: string }[];
};

export class ExpenseError extends Error {}

export const expenseService = {
  async list(): Promise<ExpenseClaim[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<ExpenseClaim[]>('/expenses');
        return data;
      } catch (error) {
        throw new ExpenseError(apiErrorMessage(error, 'Could not load expense claims.'));
      }
    }
    return [];
  },

  async create(payload: {
    title: string;
    category: string;
    amount: number;
    claimDate: string;
    receiptUrl?: string;
  }): Promise<ExpenseClaim> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<ExpenseClaim>('/expenses', payload);
        return data;
      } catch (error) {
        throw new ExpenseError(apiErrorMessage(error, 'Could not submit expense claim.'));
      }
    }
    return {
      id: `exp-${Date.now()}`,
      ...payload,
      status: 'PENDING',
      claimDate: payload.claimDate,
    };
  },
};
