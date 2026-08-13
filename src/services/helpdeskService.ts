import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type HelpdeskTicket = {
  id: string;
  ticketNo?: string;
  subject: string;
  description?: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  assignedToId?: string | null;
  resolution?: string | null;
  requesterName?: string;
  comments?: { author: string; comment: string; createdAt: string }[];
};

export type HelpdeskComment = {
  author: string;
  comment: string;
  createdAt: string;
};

export class HelpdeskError extends Error {}

export const helpdeskService = {
  async list(): Promise<HelpdeskTicket[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<HelpdeskTicket[]>('/helpdesk');
        return data;
      } catch (error) {
        throw new HelpdeskError(apiErrorMessage(error, 'Could not load helpdesk tickets.'));
      }
    }
    return [];
  },

  async listAll(): Promise<HelpdeskTicket[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<HelpdeskTicket[]>('/helpdesk/all');
        return data;
      } catch (error) {
        throw new HelpdeskError(apiErrorMessage(error, 'Could not load all helpdesk tickets.'));
      }
    }
    return [];
  },

  async create(payload: {
    subject: string;
    description?: string;
    category: string;
    priority: HelpdeskTicket['priority'];
  }): Promise<HelpdeskTicket> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<HelpdeskTicket>('/helpdesk', payload);
        return data;
      } catch (error) {
        throw new HelpdeskError(apiErrorMessage(error, 'Could not create helpdesk ticket.'));
      }
    }
    return {
      id: `hd-${Date.now()}`,
      ...payload,
      status: 'OPEN',
      ticketNo: `HD-${Math.floor(1000 + Math.random() * 9000)}`,
    };
  },

  async updateStatus(
    id: string,
    payload: { status: HelpdeskTicket['status']; assignedToId?: string; resolution?: string },
  ): Promise<HelpdeskTicket> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<HelpdeskTicket>(`/helpdesk/${id}/status`, payload);
        return data;
      } catch (error) {
        throw new HelpdeskError(apiErrorMessage(error, 'Could not update ticket status.'));
      }
    }
    return { id, subject: '', category: '', priority: 'MEDIUM', status: payload.status };
  },

  async addComment(id: string, comment: string): Promise<HelpdeskComment[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<HelpdeskComment[]>(`/helpdesk/${id}/comment`, { comment });
        return data;
      } catch (error) {
        throw new HelpdeskError(apiErrorMessage(error, 'Could not post comment.'));
      }
    }
    return [];
  },
};
