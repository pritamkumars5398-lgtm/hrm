import { io, type Socket } from 'socket.io-client'
import { env, hasBackend } from './env'
import type { NotificationItem } from '@/services/notificationsService'

let socket: Socket | null = null

/** One shared connection for the whole app — every subscriber attaches to
 *  the same socket rather than opening one each. */
function getSocket(): Socket | null {
  if (!hasBackend) return null
  if (socket) return socket

  socket = io(env.apiBaseUrl!, {
    // The httpOnly JWT cookie is what authenticates the handshake — same
    // credential as every REST call, just read from the socket.io handshake
    // instead of an Express request (see NotificationsGateway).
    withCredentials: true,
  })

  return socket
}

/**
 * The real-time channel for an already-open tab — a notification lands here
 * the instant it's created server-side, no polling delay. Returns an
 * unsubscribe function; silently no-ops with no backend configured.
 */
export function subscribeToNotifications(onNotification: (notification: NotificationItem) => void): () => void {
  const instance = getSocket()
  if (!instance) return () => {}

  instance.on('notification', onNotification)
  return () => {
    instance.off('notification', onNotification)
  }
}
