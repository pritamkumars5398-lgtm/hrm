import { apiClient } from './apiClient'
import { hasBackend } from '@/config/env'

export type ComplianceItem = {
  id: string
  name: string
  authority: string
  dueDate: string
  status: 'FILED' | 'PENDING' | 'UPCOMING'
  penaltyRisk: string
  filedDate?: string | null
  acknowledgementNo?: string | null
  period?: string | null
  createdAt?: string
}

export type ComplianceMetrics = {
  scorePercent: number
  filedCount: number
  pendingCount: number
  upcomingCount: number
  form16Status: string
  upcomingDeadline: string
}

export type ComplianceResponse = {
  items: ComplianceItem[]
  metrics: ComplianceMetrics
}

export type CreateCompliancePayload = {
  name: string
  authority: string
  dueDate: string
  penaltyRisk: string
  period?: string
}

const SEED_COMPLIANCE: ComplianceItem[] = [
  {
    id: 'cmp-1',
    name: 'Employees Provident Fund (EPF Monthly ECR Return)',
    authority: 'EPFO (Ministry of Labour & Employment)',
    dueDate: '2026-04-15',
    status: 'FILED',
    penaltyRisk: '12% interest p.a. + damages up to 25%',
    filedDate: '2026-03-12',
    acknowledgementNo: 'EPF-2026-03-884920',
    period: 'February 2026',
  },
  {
    id: 'cmp-2',
    name: 'Employees State Insurance (ESIC Monthly Contribution)',
    authority: 'ESIC (Ministry of Labour & Employment)',
    dueDate: '2026-04-15',
    status: 'FILED',
    penaltyRisk: '12% simple interest p.a.',
    filedDate: '2026-03-12',
    acknowledgementNo: 'ESIC-2026-03-194022',
    period: 'February 2026',
  },
  {
    id: 'cmp-3',
    name: 'Tax Deducted at Source (TDS Form 24Q - Q4 Return)',
    authority: 'Income Tax Department (CBDT)',
    dueDate: '2026-05-31',
    status: 'UPCOMING',
    penaltyRisk: '₹200 per day under Section 234E',
    period: 'Q4 FY 2025-26',
  },
  {
    id: 'cmp-4',
    name: 'Professional Tax (PT Monthly Remittance)',
    authority: 'State Commercial Tax Department',
    dueDate: '2026-04-10',
    status: 'PENDING',
    penaltyRisk: '1.25% penalty per month',
    period: 'March 2026',
  },
]

let mockItems: ComplianceItem[] = [...SEED_COMPLIANCE]

export const complianceService = {
  getAll: async (): Promise<ComplianceResponse> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<ComplianceResponse>('/compliance')
        return res.data
      } catch {}
    }
    const filedCount = mockItems.filter((i) => i.status === 'FILED').length
    const pendingCount = mockItems.filter((i) => i.status === 'PENDING').length
    const upcomingCount = mockItems.filter((i) => i.status === 'UPCOMING').length
    const scorePercent = Math.round((filedCount / (mockItems.length || 1)) * 100)

    const nextFilingDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const upcomingDeadline = nextFilingDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

    return {
      items: mockItems,
      metrics: {
        scorePercent,
        filedCount,
        pendingCount,
        upcomingCount,
        form16Status: 'Ready for Generation',
        upcomingDeadline,
      },
    }
  },

  create: async (payload: CreateCompliancePayload): Promise<ComplianceItem> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post<ComplianceItem>('/compliance', payload)
        return res.data
      } catch {}
    }
    const newItem: ComplianceItem = {
      id: `cmp-${crypto.randomUUID().slice(0, 8)}`,
      name: payload.name,
      authority: payload.authority,
      dueDate: payload.dueDate,
      status: 'PENDING',
      penaltyRisk: payload.penaltyRisk,
      period: payload.period || null,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mockItems = [newItem, ...mockItems]
    return newItem
  },

  markFiled: async (id: string, acknowledgementNo?: string): Promise<ComplianceItem> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch<ComplianceItem>(`/compliance/${id}/filed`, { acknowledgementNo })
        return res.data
      } catch {}
    }
    const idx = mockItems.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error('Compliance item not found')
    mockItems[idx] = {
      ...mockItems[idx]!,
      status: 'FILED',
      filedDate: new Date().toISOString().slice(0, 10),
      acknowledgementNo: acknowledgementNo || `ACK-${Math.floor(100000 + Math.random() * 900000)}`,
    }
    return mockItems[idx]!
  },

  exportEcr: async (): Promise<{ fileName: string; content: string }> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get<{ fileName: string; content: string }>('/compliance/export/ecr')
        return res.data
      } catch {}
    }
    return {
      fileName: 'EPF_ECR_March_2026.txt',
      content: 'UAN#MEMBER_NAME#GROSS#EPF_WAGES#EPS_WAGES#EDLI_WAGES#EE_SHARE#ER_SHARE#EPS_SHARE\n100982341234#Samuel Okafor#182400#15000#15000#15000#1800#550#1250',
    }
  },

  delete: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/compliance/${id}`)
        return
      } catch {}
    }
    mockItems = mockItems.filter((i) => i.id !== id)
  },
}
