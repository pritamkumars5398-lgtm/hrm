import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type AuditLogEntry = {
  id: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string | null;
  result: 'ALLOW' | 'DENY';
  timestamp: string;
};

export type AuditLogsData = {
  logs: AuditLogEntry[];
  total: number;
};

export class AuditLogsError extends Error {}

export const auditLogsService = {
  async list(filters?: {
    resource?: string;
    result?: 'ALLOW' | 'DENY' | '';
    userEmail?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<AuditLogsData> {
    if (!hasBackend) return { logs: [], total: 0 };
    try {
      const params: Record<string, string> = {};
      if (filters?.resource) params.resource = filters.resource;
      if (filters?.result) params.result = filters.result;
      if (filters?.userEmail) params.userEmail = filters.userEmail;
      if (filters?.from) params.from = filters.from;
      if (filters?.to) params.to = filters.to;
      if (filters?.limit) params.limit = String(filters.limit);
      const { data } = await apiClient.get<AuditLogsData>('/audit-logs', { params });
      return data;
    } catch (error) {
      throw new AuditLogsError(apiErrorMessage(error, 'Could not load audit logs.'));
    }
  },
};
