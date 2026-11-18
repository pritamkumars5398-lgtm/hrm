import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

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

const SEED_FEED: EngagementPost[] = [
  {
    id: 'post-1',
    author: 'Priya Nair',
    role: 'Founder & CEO',
    type: 'KUDOS',
    content: 'Huge shoutout to the Engineering team for shipping the biometric mobile attendance & open-source mapping sync ahead of schedule! Exceptional dedication.',
    targetUser: 'Samuel Okafor',
    badge: 'Visionary Delivery',
    likes: 18,
    commentsCount: 4,
    createdAt: '2026-03-14',
  },
  {
    id: 'post-2',
    author: 'Marta Lindqvist',
    role: 'HR Manager',
    type: 'ANNOUNCEMENT',
    content: 'Annual health checkup camp and wellness vouchers will be distributed starting next Monday. Book your 30-min slot on the health portal.',
    likes: 24,
    commentsCount: 7,
    createdAt: '2026-03-12',
  },
  {
    id: 'post-3',
    author: 'Samuel Green',
    role: 'Engineering Manager',
    type: 'KUDOS',
    content: 'Thank you Aisha for resolving the high-priority client payment webhook incident in record time over the weekend!',
    targetUser: 'Aisha Rahman',
    badge: 'Impact Player',
    likes: 12,
    commentsCount: 2,
    createdAt: '2026-03-10',
  },
]

const SEED_CELEBRATIONS: Celebration[] = [
  {
    id: 'cel-1',
    name: 'Chloe Dubois',
    type: 'BIRTHDAY',
    subtitle: 'Turns 28 today! 🎂',
    date: 'Today',
  },
  {
    id: 'cel-2',
    name: 'Tom Okada',
    type: 'ANNIVERSARY',
    subtitle: '3 years at Keystone 🏅',
    date: 'Tomorrow',
  },
]

let mockFeed: EngagementPost[] = [...SEED_FEED]

export const engagementService = {
  getAll: async (): Promise<EngagementResponse> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<EngagementResponse>('/engagement')
        return res.data
      } catch {}
    }
    return {
      feed: mockFeed,
      celebrations: SEED_CELEBRATIONS,
    }
  },

  create: async (payload: CreatePostPayload): Promise<EngagementPost> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<EngagementPost>('/engagement', payload)
        return res.data
      } catch {}
    }
    const newPost: EngagementPost = {
      id: `post-${crypto.randomUUID().slice(0, 8)}`,
      author: 'Priya Nair',
      role: 'Founder & CEO',
      type: payload.type || 'KUDOS',
      content: payload.content,
      targetUser: payload.targetUser || null,
      badge: payload.badge || null,
      likes: 1,
      commentsCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mockFeed = [newPost, ...mockFeed]
    return newPost
  },

  like: async (id: string): Promise<EngagementPost> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<EngagementPost>(`/engagement/${id}/like`)
        return res.data
      } catch {}
    }
    const idx = mockFeed.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error('Post not found')
    mockFeed[idx] = { ...mockFeed[idx]!, likes: mockFeed[idx]!.likes + 1 }
    return mockFeed[idx]!
  },

  delete: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/engagement/${id}`)
        return
      } catch {}
    }
    mockFeed = mockFeed.filter((p) => p.id !== id)
  },
}
