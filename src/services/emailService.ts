
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
