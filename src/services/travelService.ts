import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

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

const SEED_TRAVEL: TravelRequest[] = [
  {
    id: 'trv-1',
    employee: 'Priya Nair',
    destination: 'San Francisco, USA',
    startDate: '2026-04-10',
    endDate: '2026-04-16',
    purpose: 'Global Enterprise Partner Conference & Product Keynote',
    estimatedCost: 3200,
    status: 'BOOKED',
    hotelDetails: 'Hyatt Regency Embarcadero, Room 1402',
    createdAt: '2026-03-01',
  },
  {
    id: 'trv-2',
    employee: 'Samuel Green',
    destination: 'Berlin, Germany',
    startDate: '2026-04-22',
    endDate: '2026-04-26',
    purpose: 'EU Tech Architecture Summit & Client Workshops',
    estimatedCost: 1450,
    status: 'APPROVED',
    hotelDetails: 'Radisson Collection Hotel Berlin',
    createdAt: '2026-03-04',
  },
  {
    id: 'trv-3',
    employee: 'Marta Lindqvist',
    destination: 'Amsterdam, Netherlands',
    startDate: '2026-05-02',
    endDate: '2026-05-05',
    purpose: 'European People & Culture Leadership Forum',
    estimatedCost: 890,
    status: 'PENDING',
    hotelDetails: 'CitizenM Amsterdam South',
    createdAt: '2026-03-08',
  },
]

let mockTravel: TravelRequest[] = [...SEED_TRAVEL]

export const travelService = {
  getAll: async (status?: string): Promise<TravelRequest[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<TravelRequest[]>('/travel', {
          params: { status: status && status !== 'ALL' ? status : undefined },
        })
        return res.data
      } catch {}
    }
    return mockTravel.filter((t) => !status || status === 'ALL' || t.status === status)
  },

  create: async (payload: CreateTravelPayload): Promise<TravelRequest> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<TravelRequest>('/travel', payload)
        return res.data
      } catch {}
    }
    const newReq: TravelRequest = {
      id: `trv-${crypto.randomUUID().slice(0, 8)}`,
      employee: 'Priya Nair',
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      purpose: payload.purpose,
      estimatedCost: payload.estimatedCost,
      status: 'PENDING',
      hotelDetails: payload.hotelDetails ?? null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mockTravel = [newReq, ...mockTravel]
    return newReq
  },

  updateStatus: async (
    id: string,
    status: 'PENDING' | 'APPROVED' | 'BOOKED' | 'REJECTED',
  ): Promise<TravelRequest> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch<TravelRequest>(`/travel/${id}/status`, { status })
        return res.data
      } catch {}
    }
    const idx = mockTravel.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Travel request not found')
    mockTravel[idx] = { ...mockTravel[idx]!, status }
    return mockTravel[idx]!
  },

  delete: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/travel/${id}`)
        return
      } catch {}
    }
    mockTravel = mockTravel.filter((t) => t.id !== id)
  },
}
