import { hasBackend } from '@/config/env'
import { useAuthStore } from '@/features/auth/store/authStore'
import { apiClient } from './apiClient'
import { computeCopilotMetrics, routeCopilotQuery } from './copilotEngine'

export type AiMetrics = {
  payrollAudit: {
    status: string
    scannedCount: number
    details: string
  }
  attritionRisk: {
    flaggedCount: number
    flaggedEmployees: string[]
    riskDepartment: string
    driver: string
  }
  resumeMatch: {
    ratePercent: number
    activeJobsCount: number
    details: string
  }
  activeWorkforceCount: number
}

export type AiMessage = {
  id: string
  sender: 'user' | 'ai'
  text: string
  createdAt?: string
}

const HISTORY_PREFIX = 'keystone.ai.history.'
const memoryHistory = new Map<string, AiMessage[]>()

function historyKey(): string {
  const userId = useAuthStore.getState().user?.id ?? 'guest'
  return `${HISTORY_PREFIX}${userId}`
}

function readLocalHistory(): AiMessage[] {
  const key = historyKey()
  try {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as AiMessage[]
    }
  } catch {
    // Fall back to in-memory map if sessionStorage is unavailable
  }
  return memoryHistory.get(key) ?? []
}

function writeLocalHistory(messages: AiMessage[]): void {
  const key = historyKey()
  memoryHistory.set(key, messages)
  try {
    sessionStorage.setItem(key, JSON.stringify(messages))
  } catch {
    // In-memory store remains active if storage quota is exceeded
  }
}

export const aiService = {
  getMetrics: async (): Promise<AiMetrics> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<AiMetrics>('/ai-copilot/metrics')
        return res.data
      } catch {
        // Fall back to live client-side aggregation when /ai-copilot is absent
      }
    }
    return computeCopilotMetrics()
  },

  getHistory: async (): Promise<AiMessage[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<AiMessage[]>('/ai-copilot/history')
        return res.data
      } catch {
        // Fall back to per-session local history
      }
    }
    return readLocalHistory()
  },

  ask: async (query: string): Promise<{ id: string; response: string; category: string }> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<{ id: string; response: string; category: string }>(
          '/ai-copilot/ask',
          { query },
        )
        return res.data
      } catch {
        // Fall back to site-grounded local Copilot engine
      }
    }

    const result = await routeCopilotQuery(query)
    const nowIso = new Date().toISOString()
    const aiId = `ai-${Date.now()}`
    const history = readLocalHistory()

    writeLocalHistory([
      ...history,
      { id: `u-${Date.now()}`, sender: 'user', text: query, createdAt: nowIso },
      { id: aiId, sender: 'ai', text: result.response, createdAt: nowIso },
    ])

    return {
      id: aiId,
      response: result.response,
      category: result.category,
    }
  },

  clearHistory: async (): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete('/ai-copilot/history')
        return
      } catch {
        // Fall back to clearing local history
      }
    }
    writeLocalHistory([])
  },
}
