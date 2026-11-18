import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

export type ChatMessage = {
  id: string
  channel: string
  sender: string
  senderRole?: string
  text: string
  createdAt: string
}

export type WhatsAppMessage = {
  id: string
  sender: string
  text: string
  isBot: boolean
  intent?: string
  status: string
  createdAt: string
}

const SEED_CHAT: ChatMessage[] = [
  {
    id: 'msg-1',
    channel: 'GENERAL',
    sender: 'Priya Nair',
    senderRole: 'Founder & CEO',
    text: 'Good morning everyone! Reminder that our Q1 company all-hands is at 3:00 PM today. Looking forward to celebrating our launch milestone.',
    createdAt: '2026-03-14 09:30:00',
  },
  {
    id: 'msg-2',
    channel: 'GENERAL',
    sender: 'Samuel Green',
    senderRole: 'Engineering Manager',
    text: 'Engineering demo is ready. We will show the live OpenStreetMap integration for office geofencing and mobile check-ins.',
    createdAt: '2026-03-14 10:15:00',
  },
  {
    id: 'msg-3',
    channel: 'GENERAL',
    sender: 'Marta Lindqvist',
    senderRole: 'HR Manager',
    text: 'Welcome new team members joining this week! Feel free to reach out to HR desk if you have any questions.',
    createdAt: '2026-03-14 10:45:00',
  },
]

const SEED_WHATSAPP: WhatsAppMessage[] = [
  {
    id: 'wa-1',
    sender: 'Employee (+44 7700 900123)',
    text: 'Hi Keystone, what is my annual leave balance remaining?',
    isBot: false,
    status: 'DELIVERED',
    createdAt: '2026-03-14 11:00:00',
  },
  {
    id: 'wa-2',
    sender: 'Keystone Bot',
    text: 'Hello Samuel! You currently have 18 days of Annual Leave and 8 days of Sick Leave remaining for 2026. Reply "APPLY" to book leave.',
    isBot: true,
    intent: 'leave_balance_inquiry',
    status: 'SENT',
    createdAt: '2026-03-14 11:00:05',
  },
]

let mockChat: ChatMessage[] = [...SEED_CHAT]
let mockWhatsApp: WhatsAppMessage[] = [...SEED_WHATSAPP]

export const communicationService = {
  // Chat
  getChat: async (channel = 'GENERAL'): Promise<ChatMessage[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<ChatMessage[]>('/communication/chat', {
          params: { channel },
        })
        return res.data
      } catch {}
    }
    return mockChat.filter((m) => m.channel.toUpperCase() === channel.toUpperCase())
  },

  sendChat: async (text: string, channel = 'GENERAL'): Promise<ChatMessage> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<ChatMessage>('/communication/chat', {
          text,
          channel,
        })
        return res.data
      } catch {}
    }
    const newMsg: ChatMessage = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      channel: channel.toUpperCase(),
      sender: 'Priya Nair',
      senderRole: 'Founder & CEO',
      text,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }
    mockChat = [...mockChat, newMsg]
    return newMsg
  },

  deleteChat: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/communication/chat/${id}`)
        return
      } catch {}
    }
    mockChat = mockChat.filter((m) => m.id !== id)
  },

  // WhatsApp Bot
  getWhatsApp: async (): Promise<WhatsAppMessage[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<WhatsAppMessage[]>('/communication/whatsapp')
        return res.data
      } catch {}
    }
    return mockWhatsApp
  },

  sendWhatsApp: async (
    text: string,
  ): Promise<{ userMessage: WhatsAppMessage; botReply: WhatsAppMessage }> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<{
          userMessage: WhatsAppMessage
          botReply: WhatsAppMessage
        }>('/communication/whatsapp', { text })
        return res.data
      } catch {}
    }
    const userMessage: WhatsAppMessage = {
      id: `wa-${crypto.randomUUID().slice(0, 8)}`,
      sender: 'Employee (+44 7700 900123)',
      text,
      isBot: false,
      status: 'DELIVERED',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }

    const botReply: WhatsAppMessage = {
      id: `wa-${crypto.randomUUID().slice(0, 8)}`,
      sender: 'Keystone Bot',
      text: `Thanks for your message: "${text}". Your request has been logged with HR. Our automated assistant will sync this with your Keystone profile.`,
      isBot: true,
      intent: 'general_query',
      status: 'SENT',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }

    mockWhatsApp = [...mockWhatsApp, userMessage, botReply]
    return { userMessage, botReply }
  },

  clearWhatsApp: async (): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete('/communication/whatsapp/clear')
        return
      } catch {}
    }
    mockWhatsApp = []
  },
}
