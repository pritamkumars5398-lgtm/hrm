import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, employeeName, type, startDate, endDate, days, reason } = req.body as {
    to: string
    employeeName: string
    type: string
    startDate: string
    endDate: string
    days: number
    reason: string
  }

  if (!to || !employeeName) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS
  const smtpFrom = process.env.SMTP_FROM ?? `Keystone HRM <${smtpUser}>`

  if (!smtpUser || !smtpPass) {
    console.error('SMTP_USER or SMTP_PASS not configured')
    return res.status(500).json({ error: 'Email service is not configured.' })
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  })

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New leave request — Keystone</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#1e3a2f;padding:32px 40px;">
              <p style="margin:0;color:#d4e8d8;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Keystone HRM</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.01em;">
                New leave request
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0 0 24px;font-size:15px;color:#3d3d3d;line-height:1.6;">
                <strong>${employeeName}</strong> has applied for leave and it's waiting on a decision.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;border:1px solid #c8dece;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;letter-spacing:0.08em;">Type</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a2f;">${type}</p>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;letter-spacing:0.08em;">Dates</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a2f;">${startDate} – ${endDate} (${days} ${days === 1 ? 'day' : 'days'})</p>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;letter-spacing:0.08em;">Reason</p>
                    <p style="margin:0;font-size:14px;color:#1e3a2f;">${reason}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:13px;color:#888;line-height:1.6;">
                Sign in to Keystone to approve or reject this request.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #efefef;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.7;">
                You're receiving this because your address is set as the leave notification email for this company.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `New leave request from ${employeeName}`,
      html,
      text: `${employeeName} has applied for leave.\n\nType: ${type}\nDates: ${startDate} – ${endDate} (${days} ${days === 1 ? 'day' : 'days'})\nReason: ${reason}\n\nSign in to Keystone to approve or reject this request.`,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[send-leave-notification] nodemailer error:', err)
    return res.status(500).json({ error: 'Failed to send email.' })
  }
}
