
import { hasBackend } from '@/config/env'

export type InviteEmailPayload = {
  to: string
  name: string
  link: string
  tempPassword: string
}

/**
 * Calls the Vercel serverless function at /api/send-invite to deliver
 * the invite email via Gmail SMTP. Falls back silently in mock mode.
 */
export async function sendInviteEmail(payload: InviteEmailPayload): Promise<{ ok: boolean; error?: string }> {
  if (!hasBackend) {
    // In mock / Vercel preview mode without env vars, just skip silently.
    console.info('[sendInviteEmail] No backend configured — email skipped (mock mode).')
    return { ok: true }
  }

  try {
    const response = await fetch('/api/send-invite', {
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
    console.error('[sendInviteEmail] fetch failed:', err)
    return { ok: false, error: 'Could not reach the email service.' }
  }
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
