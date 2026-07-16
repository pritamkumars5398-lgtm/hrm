import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import type { Plugin } from 'vite'

/** Shared SMTP send used by every local /api/* email shim below. */
async function sendViaSmtp(env: Record<string, string>, mail: { to: string; subject: string; text: string; html: string }) {
  const smtpUser = env.SMTP_USER
  const smtpPass = env.SMTP_PASS
  const smtpFrom = env.SMTP_FROM ?? `Keystone HRM <${smtpUser}>`

  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP not configured.')
  }

  // Dynamic import so nodemailer stays out of the browser bundle.
  const { default: nodemailer } = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  })

  await transporter.sendMail({ from: smtpFrom, ...mail })
}

/**
 * Local dev only: handles POST /api/send-invite and /api/send-leave-notification
 * with nodemailer so the email flow works in `npm run dev` the same way it does
 * on Vercel serverless (see vercel.json's catch-all /api/(.*) rewrite — this
 * plugin is just standing in for that during local dev, where Vite doesn't run
 * the real serverless functions). Receives the full env map so non-VITE_ vars
 * are accessible (Vite only puts VITE_-prefixed vars into process.env by default).
 */
function localApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'local-api-email',
    configureServer(server) {
      server.middlewares.use('/api/send-invite', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            const { to, name, link, tempPassword } = body
            const displayName = name || to.split('@')[0]
            const loginUrl = link || 'http://localhost:5173/login'

            await sendViaSmtp(env, {
              to,
              subject: `You've been invited to Keystone HRM`,
              text: `Hi ${displayName},\n\nYou've been added to a workspace on Keystone HRM.\n\nEmail: ${to}\nTemporary Password: ${tempPassword}\n\nSign in here: ${loginUrl}\n\nYou'll be prompted to set a new password immediately after signing in.`,
              html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>You're invited to Keystone</title></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:#1e3a2f;padding:32px 40px;">
          <p style="margin:0;color:#d4e8d8;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Keystone HRM</p>
          <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.01em;">You've been invited</h1>
        </td></tr>
        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0 0 16px;font-size:15px;color:#3d3d3d;line-height:1.6;">Hi <strong>${displayName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#3d3d3d;line-height:1.6;">Use the temporary credentials below to sign in and set a new password.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;border:1px solid #c8dece;border-radius:10px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;">Your login email</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a2f;">${to}</p>
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;">Temporary password</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:#1e3a2f;letter-spacing:0.12em;font-family:monospace;">${tempPassword}</p>
            </td></tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="background:#1e3a2f;border-radius:8px;">
              <a href="${loginUrl}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#fff;text-decoration:none;">Sign in to Keystone →</a>
            </td></tr>
          </table>
          <p style="margin:0 0 28px;font-size:13px;color:#888;line-height:1.6;">You will be prompted to set a new password immediately after signing in.</p>
        </td></tr>
        <tr><td style="padding:24px 40px 32px;border-top:1px solid #efefef;">
          <p style="margin:0;font-size:12px;color:#aaa;">If you weren't expecting this invite, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
            })

            console.log(`[local-api] ✉ Invite email sent to ${to}`)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err: any) {
            console.error('[local-api] Email error:', err?.message)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message ?? 'Failed to send email.' }))
          }
        })
      })

      server.middlewares.use('/api/send-leave-notification', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunks: Buffer[] = []
        req.on('data', (chunk: Buffer) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString())
            const { to, employeeName, type, startDate, endDate, days, reason } = body

            await sendViaSmtp(env, {
              to,
              subject: `New leave request from ${employeeName}`,
              text: `${employeeName} has applied for leave.\n\nType: ${type}\nDates: ${startDate} – ${endDate} (${days} ${days === 1 ? 'day' : 'days'})\nReason: ${reason}\n\nSign in to Keystone to approve or reject this request.`,
              html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>New leave request — Keystone</title></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <tr><td style="background:#1e3a2f;padding:32px 40px;">
          <p style="margin:0;color:#d4e8d8;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Keystone HRM</p>
          <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.01em;">New leave request</h1>
        </td></tr>
        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0 0 24px;font-size:15px;color:#3d3d3d;line-height:1.6;"><strong>${employeeName}</strong> has applied for leave and it's waiting on a decision.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;border:1px solid #c8dece;border-radius:10px;margin-bottom:28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;">Type</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a2f;">${type}</p>
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;">Dates</p>
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a2f;">${startDate} – ${endDate} (${days} ${days === 1 ? 'day' : 'days'})</p>
              <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;">Reason</p>
              <p style="margin:0;font-size:14px;color:#1e3a2f;">${reason}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 28px;font-size:13px;color:#888;line-height:1.6;">Sign in to Keystone to approve or reject this request.</p>
        </td></tr>
        <tr><td style="padding:24px 40px 32px;border-top:1px solid #efefef;">
          <p style="margin:0;font-size:12px;color:#aaa;">You're receiving this because your address is set as the leave notification email for this company.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
            })

            console.log(`[local-api] ✉ Leave notification sent to ${to}`)
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err: any) {
            console.error('[local-api] Email error:', err?.message)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message ?? 'Failed to send email.' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
// Function form is required so we can call loadEnv to read ALL .env vars
// (including non-VITE_ ones like SMTP_USER) before the dev server starts.
export default defineConfig(({ mode }) => {
  // '' prefix = load every var, not just VITE_-prefixed ones
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), localApiPlugin(env)],
    server: {
      // Pinned: the backend allows this origin by name (credentialed cookie requests
      // cannot use a wildcard). If Vite silently fell back to 5174, every auth call
      // would fail CORS and look like "the server is down".
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})

