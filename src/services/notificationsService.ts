import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'

export type NotificationItem = {
  id: string
  title: string
  body: string
  kind: string
  link: string | null
  read: boolean
  createdAt: string
}

export type NotificationsData = {
  notifications: NotificationItem[]
  unreadCount: number
}

export class NotificationsError extends Error {}

/**
 * Real backend only — there is no mock/offline notification history to fall
 * back to (nothing generates one), so the no-backend demo just sees an empty
 * bell rather than fabricated activity.
 */
export const notificationsService = {
  async get(): Promise<NotificationsData> {
    if (!hasBackend) return { notifications: [], unreadCount: 0 }

    try {
      const { data } = await apiClient.get<NotificationsData>('/notifications')
      return data
    } catch (error) {
      throw new NotificationsError(apiErrorMessage(error, 'We could not load your notifications.'))
    }
  },

  async markRead(id: string): Promise<void> {
    if (!hasBackend) return
    try {
      await apiClient.post(`/notifications/${id}/read`)
    } catch (error) {
      throw new NotificationsError(apiErrorMessage(error, 'We could not update that notification.'))
    }
  },

  async markAllRead(): Promise<void> {
    if (!hasBackend) return
    try {
      await apiClient.post('/notifications/read-all')
    } catch (error) {
      throw new NotificationsError(apiErrorMessage(error, 'We could not update your notifications.'))
    }
  },

  /**
   * Registers this browser's FCM device token for push delivery. Silently
   * no-ops without a backend, and swallows failure — a device that can't
   * register for push still gets the real in-app bell, so this must never
   * block or surface an error to the user.
   */
  async registerToken(token: string): Promise<void> {
    if (!hasBackend) return
    try {
      await apiClient.post('/notifications/register-token', { token })
    } catch {
      // Best-effort — push is a bonus delivery channel, not the source of truth.
    }
  },
}
