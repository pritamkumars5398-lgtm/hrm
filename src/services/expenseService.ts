import { apiClient, apiErrorMessage } from './apiClient';

export type ExpenseClaim = {
  id: string;
  title: string;
  category: string;
  amount: number;
  approvedAmount?: number | null;
  reimbursedAmount?: number | null;
  claimDate: string;
  receiptUrl?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  rejectionReason?: string | null;
  employeeName?: string;
  history?: { action: string; userId: string; timestamp: string }[];
};

export class ExpenseError extends Error {}

export const expenseService = {
  async list(): Promise<ExpenseClaim[]> {
    try {
      const { data } = await apiClient.get<ExpenseClaim[]>('/expenses');
      return data;
    } catch (error) {
      throw new ExpenseError(apiErrorMessage(error, 'Could not load expense claims.'));
    }
  },

  async listAll(): Promise<ExpenseClaim[]> {
    try {
      const { data } = await apiClient.get<ExpenseClaim[]>('/expenses/all');
      return data;
    } catch (error) {
      throw new ExpenseError(apiErrorMessage(error, 'Could not load all expense claims.'));
    }
  },

  async create(payload: {
    title: string;
    category: string;
    amount: number;
    claimDate: string;
    receiptUrl?: string;
  }): Promise<ExpenseClaim> {
    try {
      const { data } = await apiClient.post<ExpenseClaim>('/expenses', payload);
      return data;
    } catch (error) {
      throw new ExpenseError(apiErrorMessage(error, 'Could not submit expense claim.'));
    }
  },

  async reimburse(id: string): Promise<ExpenseClaim> {
    try {
      const { data } = await apiClient.patch<ExpenseClaim>(`/expenses/${id}/reimburse`, {});
      return data;
    } catch (error) {
      throw new ExpenseError(apiErrorMessage(error, 'Could not reimburse expense claim.'));
    }
  },
};
