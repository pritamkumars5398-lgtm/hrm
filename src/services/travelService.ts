import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type TravelRequest = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  purpose: string;
  estimatedCost?: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BOOKED' | 'CANCELLED';
  bookingDetails?: string | null;
  cancellationReason?: string | null;
  employeeName?: string;
};

export class TravelError extends Error {}

export const travelService = {
  async list(): Promise<TravelRequest[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<TravelRequest[]>('/travel');
        return data;
      } catch (error) {
        throw new TravelError(apiErrorMessage(error, 'Could not load travel requests.'));
      }
    }
    return [];
  },

  async create(payload: {
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    estimatedCost?: number;
  }): Promise<TravelRequest> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<TravelRequest>('/travel', payload);
        return data;
      } catch (error) {
        throw new TravelError(apiErrorMessage(error, 'Could not submit travel request.'));
      }
    }
    return {
      id: `trv-${Date.now()}`,
      ...payload,
      status: 'PENDING',
    };
  },

  async addBookingDetails(id: string, bookingDetails: string): Promise<TravelRequest> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<TravelRequest>(`/travel/${id}/booking`, { bookingDetails });
        return data;
      } catch (error) {
        throw new TravelError(apiErrorMessage(error, 'Could not save booking details.'));
      }
    }
    return { id, destination: '', startDate: '', endDate: '', purpose: '', status: 'BOOKED', bookingDetails };
  },

  async cancel(id: string, cancellationReason: string): Promise<TravelRequest> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<TravelRequest>(`/travel/${id}/cancel`, { cancellationReason });
        return data;
      } catch (error) {
        throw new TravelError(apiErrorMessage(error, 'Could not cancel travel request.'));
      }
    }
    return { id, destination: '', startDate: '', endDate: '', purpose: '', status: 'CANCELLED', cancellationReason };
  },
};
