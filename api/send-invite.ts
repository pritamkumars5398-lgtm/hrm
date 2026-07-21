import type { VercelRequest, VercelResponse } from '@vercel/node'
import nodemailer from 'nodemailer'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { to, name, link, tempPassword } = req.body as {
    to: string
    name: string
    link: string
    tempPassword: string
  }

  if (!to || !tempPassword) {
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

  const displayName = name || to.split('@')[0]

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to Keystone</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1e3a2f;padding:32px 40px;">
              <p style="margin:0;color:#d4e8d8;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">Keystone HRM</p>
              <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.01em;">
                You've been invited
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0 0 16px;font-size:15px;color:#3d3d3d;line-height:1.6;">
                Hi <strong>${displayName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#3d3d3d;line-height:1.6;">
                You've been added to a workspace on <strong>Keystone</strong>. Use the temporary credentials below to sign in and set a new password.
              </p>

              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7f2;border:1px solid #c8dece;border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;letter-spacing:0.08em;">Your login email</p>
                    <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e3a2f;">${to}</p>
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#5a8a6a;text-transform:uppercase;letter-spacing:0.08em;">Temporary password</p>
                    <p style="margin:0;font-size:22px;font-weight:700;color:#1e3a2f;letter-spacing:0.12em;font-family:monospace;">${tempPassword}</p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#1e3a2f;border-radius:8px;">
                    <a href="${link}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Sign in to Keystone →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;font-size:13px;color:#888;line-height:1.6;">
                You will be prompted to set a new password immediately after signing in. This temporary password expires once it's used.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid #efefef;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.7;">
                If you weren't expecting this invite, you can safely ignore this email. If you have any questions, reply to this email and we'll help you out.
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
      subject: `You've been invited to Keystone HRM`,
      html,
      text: `Hi ${displayName},\n\nYou've been invited to Keystone HRM.\n\nEmail: ${to}\nTemporary Password: ${tempPassword}\n\nSign in here: ${link}\n\nYou'll be asked to set a new password immediately after signing in.`,
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[send-invite] nodemailer error:', err)
    return res.status(500).json({ error: 'Failed to send email.' })
  }
}
