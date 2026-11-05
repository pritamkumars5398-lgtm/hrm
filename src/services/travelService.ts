import { apiClient } from './apiClient'

export type TravelRequest = {
  id: string
  employee: string
  destination: string
  startDate: string
  endDate: string
  purpose: string
  estimatedCost: number
  status: 'PENDING' | 'APPROVED' | 'BOOKED' | 'REJECTED'
  hotelDetails?: string | null
  createdAt?: string
  updatedAt?: string
}

export type CreateTravelPayload = {
  destination: string
  startDate: string
  endDate: string
  purpose: string
  estimatedCost: number
  hotelDetails?: string
}

export const travelService = {
  getAll: async (status?: string): Promise<TravelRequest[]> => {
    const res = await apiClient.get<TravelRequest[]>('/travel', {
      params: { status: status && status !== 'ALL' ? status : undefined },
    })
    return res.data
  },

  create: async (payload: CreateTravelPayload): Promise<TravelRequest> => {
    const res = await apiClient.post<TravelRequest>('/travel', payload)
    return res.data
  },

  updateStatus: async (
    id: string,
    status: 'PENDING' | 'APPROVED' | 'BOOKED' | 'REJECTED',
  ): Promise<TravelRequest> => {
    const res = await apiClient.patch<TravelRequest>(`/travel/${id}/status`, { status })
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/travel/${id}`)
  },
}
