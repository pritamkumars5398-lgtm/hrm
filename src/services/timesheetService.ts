import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type TimeRow = {
  id: string;
  client: string;
  project: string;
  task: string;
  hours: number[]; // 7 days Mon-Sun
  isBillable: boolean;
};

export type Timesheet = {
  id: string;
  weekStartDate: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  totalHours: number;
  rows: TimeRow[];
  employeeId?: string;
  employeeName?: string;
};

export class TimesheetError extends Error {}

export const timesheetService = {
  async getTimesheet(weekStartDate: string): Promise<Timesheet> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Timesheet>(`/timesheets?weekStartDate=${weekStartDate}`);
        return data;
      } catch (error) {
        throw new TimesheetError(apiErrorMessage(error, 'Could not load timesheet.'));
      }
    }
    return {
      id: '',
      weekStartDate,
      status: 'DRAFT',
      totalHours: 0,
      rows: [],
    };
  },

  async saveTimesheet(payload: { weekStartDate: string; rows: TimeRow[] }): Promise<Timesheet> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Timesheet>('/timesheets', payload);
        return data;
      } catch (error) {
        throw new TimesheetError(apiErrorMessage(error, 'Could not save timesheet.'));
      }
    }
    const totalHours = payload.rows.reduce((acc, r) => acc + r.hours.reduce((a, b) => a + b, 0), 0);
    return {
      id: `tsh-${Date.now()}`,
      weekStartDate: payload.weekStartDate,
      status: 'DRAFT',
      totalHours,
      rows: payload.rows,
    };
  },

  async updateStatus(id: string, status: Timesheet['status']): Promise<Timesheet> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<Timesheet>(`/timesheets/${id}/status`, { status });
        return data;
      } catch (error) {
        throw new TimesheetError(apiErrorMessage(error, 'Could not update timesheet status.'));
      }
    }
    return {
      id,
      weekStartDate: '',
      status,
      totalHours: 0,
      rows: [],
    };
  },

  async listAllTimesheets(): Promise<Timesheet[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Timesheet[]>('/timesheets/all');
        return data;
      } catch (error) {
        throw new TimesheetError(apiErrorMessage(error, 'Could not load timesheets.'));
      }
    }
    return [];
  },
};
