import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging'
import { env, hasPushNotifications } from './env'

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

function getMessagingInstance(): Messaging | null {
  if (!hasPushNotifications) return null
  if (messaging) return messaging

  app ??= initializeApp({
    apiKey: env.firebase.apiKey!,
    authDomain: env.firebase.authDomain ?? undefined,
    projectId: env.firebase.projectId!,
    storageBucket: env.firebase.storageBucket ?? undefined,
    messagingSenderId: env.firebase.messagingSenderId!,
    appId: env.firebase.appId!,
  })

  try {
    messaging = getMessaging(app)
  } catch {
    // Unsupported browser (e.g. Safari without the right APIs, or non-HTTPS
    // context outside localhost) — push just stays unavailable, silently.
    messaging = null
  }

  return messaging
}

/**
 * Registers this browser for push: service worker, permission prompt, FCM
 * token. Returns null (never throws) for any reason it can't — missing
 * config, denied permission, unsupported browser — since push is a bonus
 * delivery channel on top of the real in-app notifications, never required.
 */
export async function requestPushToken(): Promise<string | null> {
  const instance = getMessagingInstance()
  if (!instance || !('serviceWorker' in navigator)) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(instance, {
      vapidKey: env.firebase.vapidKey!,
      serviceWorkerRegistration: registration,
    })
    return token || null
  } catch (error) {
    console.warn('[push] Could not register for push notifications:', error)
    return null
  }
}

/** Fires for a push arriving while this tab is focused — background/closed-tab
 *  delivery is handled separately by public/firebase-messaging-sw.js. */
export function onForegroundPush(callback: (title: string, body: string, link?: string) => void): () => void {
  const instance = getMessagingInstance()
  if (!instance) return () => {}

  return onMessage(instance, (payload) => {
    callback(
      payload.notification?.title ?? 'Keystone',
      payload.notification?.body ?? '',
      payload.data?.link,
    )
  })
}
