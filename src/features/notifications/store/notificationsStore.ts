import { create } from 'zustand'
import { notificationsService, type NotificationItem } from '@/services/notificationsService'

type Status = 'idle' | 'loading' | 'ready' | 'error'

type NotificationsState = {
  status: Status
  notifications: NotificationItem[]
  unreadCount: number
  load: (options?: { force?: boolean }) => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  /** Called by the WebSocket subscription the instant a new one arrives —
   *  this is the actual real-time path, not a refetch. */
  receiveRealtime: (notification: NotificationItem) => void
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  status: 'idle',
  notifications: [],
  unreadCount: 0,

  load: async (options) => {
    const { status } = get()
    if (!options?.force && (status === 'ready' || status === 'loading')) return

    set({ status: get().notifications.length ? 'ready' : 'loading' })

    try {
      const { notifications, unreadCount } = await notificationsService.get()
      set({ status: 'ready', notifications, unreadCount })
    } catch {
      set({ status: 'error' })
    }
  },

  markRead: async (id) => {
    const target = get().notifications.find((n) => n.id === id)
    if (!target || target.read) return

    // Optimistic — the bell shouldn't wait on a round trip to feel responsive.
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }))

    try {
      await notificationsService.markRead(id)
    } catch {
      // Leave the optimistic update in place — a stray failure here isn't
      // worth reverting the UI over; the next full load will reconcile it.
    }
  },

  markAllRead: async () => {
    const hadUnread = get().unreadCount > 0
    if (!hadUnread) return

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }))

    try {
      await notificationsService.markAllRead()
    } catch {
      // Same reasoning as markRead — reconciled by the next load.
    }
  },

  receiveRealtime: (notification) =>
    set((state) => {
      // Dedupe — a poll and a socket event could theoretically race and
      // deliver the same row twice.
      if (state.notifications.some((n) => n.id === notification.id)) return state
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }
    }),
}))
