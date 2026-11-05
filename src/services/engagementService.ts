import { apiClient } from './apiClient'

export type EngagementPost = {
  id: string
  author: string
  role: string
  type: 'KUDOS' | 'ANNOUNCEMENT' | 'BIRTHDAY' | 'ANNIVERSARY'
  content: string
  targetUser?: string | null
  badge?: string | null
  likes: number
  likedBy?: string[]
  commentsCount?: number
  createdAt: string
}

export type Celebration = {
  id: string
  name: string
  type: 'BIRTHDAY' | 'ANNIVERSARY'
  subtitle: string
  date: string
}

export type EngagementResponse = {
  feed: EngagementPost[]
  celebrations: Celebration[]
}

export type CreatePostPayload = {
  content: string
  type?: 'KUDOS' | 'ANNOUNCEMENT' | 'BIRTHDAY' | 'ANNIVERSARY'
  targetUser?: string
  badge?: string
}

export const engagementService = {
  getAll: async (): Promise<EngagementResponse> => {
    const res = await apiClient.get<EngagementResponse>('/engagement')
    return res.data
  },

  create: async (payload: CreatePostPayload): Promise<EngagementPost> => {
    const res = await apiClient.post<EngagementPost>('/engagement', payload)
    return res.data
  },

  like: async (id: string): Promise<EngagementPost> => {
    const res = await apiClient.post<EngagementPost>(`/engagement/${id}/like`)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/engagement/${id}`)
  },
}
