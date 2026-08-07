
import { hasBackend } from '@/config/env'

export type InviteEmailPayload = {
  to: string
  name: string
  link: string
  tempPassword: string
}

export async function sendInviteEmail(payload: InviteEmailPayload): Promise<{ ok: boolean; error?: string }> {
  if (hasBackend) {
    // When the backend is active, email dispatch is handled server-side directly
    // when creating/resending the invite. We bypass client-side dispatch to avoid duplicates.
    console.info('[sendInviteEmail] Backend active — email dispatch handled by server.')
    return { ok: true }
  }

  // In mock / Vercel preview mode without env vars, just skip silently.
  console.info('[sendInviteEmail] No backend configured — email skipped (mock mode).')
  return { ok: true }
}


export type LeaveNotificationPayload = {
  to: string
  employeeName: string
  type: string
  startDate: string
  endDate: string
  days: number
  reason: string
}

/**
 * Calls the Vercel serverless function at /api/send-leave-notification to alert
 * whoever the Owner has configured to hear about new leave requests. Falls back
 * silently in mock mode, same as invite email.
 */
export async function sendLeaveNotification(
  payload: LeaveNotificationPayload,
): Promise<{ ok: boolean; error?: string }> {
  if (!hasBackend) {
    console.info('[sendLeaveNotification] No backend configured — email skipped (mock mode).')
    return { ok: true }
  }

  try {
    const response = await fetch('/api/send-leave-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return { ok: false, error: (data as any).error ?? 'Failed to send email.' }
    }

    return { ok: true }
  } catch (err) {
    console.error('[sendLeaveNotification] fetch failed:', err)
    return { ok: false, error: 'Could not reach the email service.' }
  }
}
