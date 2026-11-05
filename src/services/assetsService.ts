import { apiClient } from './apiClient'

export type Asset = {
  id: string
  assetTag: string
  name: string
  category: 'Laptop' | 'Desktop' | 'Mobile' | 'SIM' | 'Accessory' | 'License'
  assignedTo: string
  status: 'AVAILABLE' | 'ASSIGNED' | 'REPAIR' | 'RETIRED'
  serialNumber: string
  purchaseDate: string
  createdAt?: string
}

export type CreateAssetPayload = {
  name: string
  category: 'Laptop' | 'Desktop' | 'Mobile' | 'SIM' | 'Accessory' | 'License'
  assetTag?: string
  assignedTo?: string
  status?: 'AVAILABLE' | 'ASSIGNED' | 'REPAIR' | 'RETIRED'
  serialNumber?: string
  purchaseDate?: string
}

export const assetsService = {
  getAll: async (search?: string, status?: string): Promise<Asset[]> => {
    const res = await apiClient.get<Asset[]>('/assets', {
      params: { search, status },
    })
    return res.data
  },

  create: async (payload: CreateAssetPayload): Promise<Asset> => {
    const res = await apiClient.post<Asset>('/assets', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<Asset>): Promise<Asset> => {
    const res = await apiClient.patch<Asset>(`/assets/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`)
  },
}
