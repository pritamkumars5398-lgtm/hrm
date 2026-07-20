/* eslint-disable no-undef */
// Firebase requires this service worker at a fixed path (/firebase-messaging-sw.js)
// to handle push messages while the app isn't the focused tab. It runs outside
// Vite's module graph, so it can't read `import.meta.env` — these are the same
// public web-app values as hrm/.env's VITE_FIREBASE_* vars (none of them are
// secrets; the Admin SDK credentials that actually send pushes never leave the
// backend). If you ever rotate the Firebase project, update both places.
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCLKdH6smRzP9PXCNZVtQXTeqXv66ssBOg',
  authDomain: 'hrmss-b8f8e.firebaseapp.com',
  projectId: 'hrmss-b8f8e',
  storageBucket: 'hrmss-b8f8e.firebasestorage.app',
  messagingSenderId: '890055156351',
  appId: '1:890055156351:web:3ed6c2418194a4c669154a',
})

const messaging = firebase.messaging()

// Background messages (tab not focused / browser closed) — foreground
// messages are handled separately in-app via onMessage, not here.
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'Keystone'
  const body = payload.notification?.body ?? ''
  const link = payload.data?.link

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.png',
    data: { link },
  })
})

// Clicking the OS notification focuses/opens the app at the notification's link.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = event.notification.data?.link || '/dashboard'
  event.waitUntil(clients.openWindow(link))
})
