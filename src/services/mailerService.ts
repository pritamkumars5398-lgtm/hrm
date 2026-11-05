import { apiClient } from './apiClient'

export type MailerStatus = {
  configured: boolean
  mode: 'LIVE_SMTP' | 'SIMULATED_LOGGING'
  host: string
  port: number
  fromAddress: string
}

export type EmailLog = {
  id: string
  to: string
  subject: string
  template: string
  status: 'SENT' | 'FAILED' | 'SIMULATED'
  error?: string | null
  createdAt: string
}

export const mailerService = {
  getStatus: async (): Promise<MailerStatus> => {
    const res = await apiClient.get<MailerStatus>('/mailer/status')
    return res.data
  },

  getLogs: async (limit = 20): Promise<EmailLog[]> => {
    const res = await apiClient.get<EmailLog[]>('/mailer/logs', {
      params: { limit },
    })
    return res.data
  },

  sendTest: async (to: string): Promise<{ success: boolean; message: string; mode: string }> => {
    const res = await apiClient.post<{ success: boolean; message: string; mode: string }>(
      '/mailer/send-test',
      { to },
    )
    return res.data
  },
}
