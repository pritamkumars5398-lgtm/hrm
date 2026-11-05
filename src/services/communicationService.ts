import { apiClient } from './apiClient'

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

export const communicationService = {
  // Chat
  getChat: async (channel = 'GENERAL'): Promise<ChatMessage[]> => {
    const res = await apiClient.get<ChatMessage[]>('/communication/chat', {
      params: { channel },
    })
    return res.data
  },

  sendChat: async (text: string, channel = 'GENERAL'): Promise<ChatMessage> => {
    const res = await apiClient.post<ChatMessage>('/communication/chat', {
      text,
      channel,
    })
    return res.data
  },

  deleteChat: async (id: string): Promise<void> => {
    await apiClient.delete(`/communication/chat/${id}`)
  },

  // WhatsApp Bot
  getWhatsApp: async (): Promise<WhatsAppMessage[]> => {
    const res = await apiClient.get<WhatsAppMessage[]>('/communication/whatsapp')
    return res.data
  },

  sendWhatsApp: async (
    text: string,
  ): Promise<{ userMessage: WhatsAppMessage; botReply: WhatsAppMessage }> => {
    const res = await apiClient.post<{
      userMessage: WhatsAppMessage
      botReply: WhatsAppMessage
    }>('/communication/whatsapp', { text })
    return res.data
  },

  clearWhatsApp: async (): Promise<void> => {
    await apiClient.delete('/communication/whatsapp/clear')
  },
}
