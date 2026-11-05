import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { formatMoney } from './payrollService'
import { mockEmployees } from '@/mock/mockEmployees'
import { MOCK_ORGANIZATION_ID } from '@/mock/mockUsers'

export class SalaryError extends Error {}

/**
 * Salary structure amounts are whole rupees, same unit as payrollService's
 * formatMoney now uses — re-exported under this name so call sites here read
 * naturally, but there is only one currency formatter in the app.
 */
export const formatCurrency = formatMoney

export type SalaryStructure = {
  id: string
  organizationId: string
  employeeId: string
  basic: number
  hra: number
  otherAllowance: number
  /** Computed server-side — Basic + HRA + Other Allowance. */
  gross: number
  effectiveFrom: string
  createdAt: string
  createdByUserId: string
}

export type CompanySalaryRow = {
  employeeId: string
  employeeName: string
  avatarInitials: string
  department: string
  designation: string
  /** Null if nobody has ever entered a structure for them yet. */
  current: SalaryStructure | null
}

export type SalaryStructurePayload = {
  basic: number
  hra?: number
  otherAllowance?: number
  /** YYYY-MM-01 — always the 1st of a month. */
  effectiveFrom: string
}

// In-memory mock store for offline/demo operation
const mockStructures: Map<string, SalaryStructure> = new Map()
const mockHistories: Map<string, SalaryStructure[]> = new Map()

function getInitialMockStructure(empId: string, designation: string): SalaryStructure {
  let basic = 42000
  let hra = 16800
  let otherAllowance = 8200

  if (/Founder|CEO/i.test(designation)) {
    basic = 120000
    hra = 48000
    otherAllowance = 24000
  } else if (/Head of|Lead|Manager|Director|Controller/i.test(designation)) {
    basic = 75000
    hra = 30000
    otherAllowance = 15000
  } else if (/Senior|Staff|Principal/i.test(designation)) {
    basic = 55000
    hra = 22000
    otherAllowance = 11000
  }

  const gross = basic + hra + otherAllowance
  return {
    id: `sal-${empId}`,
    organizationId: MOCK_ORGANIZATION_ID,
    employeeId: empId,
    basic,
    hra,
    otherAllowance,
    gross,
    effectiveFrom: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    createdByUserId: 'mock-owner',
  }
}

// Pre-populate mock structures for active employees
mockEmployees.forEach((emp) => {
  if (emp.status !== 'INACTIVE') {
    const s = getInitialMockStructure(emp.id, emp.designation)
    mockStructures.set(emp.id, s)
    mockHistories.set(emp.id, [s])
  }
})

export const salaryService = {
  async listCompany(): Promise<CompanySalaryRow[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<CompanySalaryRow[]>('/payroll/salary')
        return data
      } catch (error) {
        throw new SalaryError(apiErrorMessage(error, 'We could not load salary structures.'))
      }
    }

    return mockEmployees
      .filter((e) => e.status !== 'INACTIVE')
      .map((e) => ({
        employeeId: e.id,
        employeeName: e.name,
        avatarInitials: e.avatarInitials,
        department: e.department,
        designation: e.designation,
        current: mockStructures.get(e.id) ?? getInitialMockStructure(e.id, e.designation),
      }))
  },

  async history(employeeId: string): Promise<SalaryStructure[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<SalaryStructure[]>(`/payroll/salary/${employeeId}/history`)
        return data
      } catch (error) {
        throw new SalaryError(apiErrorMessage(error, 'We could not load that salary history.'))
      }
    }

    return mockHistories.get(employeeId) || (mockStructures.has(employeeId) ? [mockStructures.get(employeeId)!] : [])
  },

  async upsert(employeeId: string, payload: SalaryStructurePayload): Promise<SalaryStructure> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<SalaryStructure>(`/payroll/salary/${employeeId}`, payload)
        return data
      } catch (error) {
        throw new SalaryError(apiErrorMessage(error, 'We could not save that salary structure.'))
      }
    }

    const basic = payload.basic
    const hra = payload.hra ?? 0
    const otherAllowance = payload.otherAllowance ?? 0
    const gross = basic + hra + otherAllowance
    const newStructure: SalaryStructure = {
      id: `sal-${employeeId}-${Date.now()}`,
      organizationId: MOCK_ORGANIZATION_ID,
      employeeId,
      basic,
      hra,
      otherAllowance,
      gross,
      effectiveFrom: payload.effectiveFrom || '2026-01-01',
      createdAt: new Date().toISOString(),
      createdByUserId: 'mock-owner',
    }

    mockStructures.set(employeeId, newStructure)
    const existing = mockHistories.get(employeeId) || []
    mockHistories.set(employeeId, [newStructure, ...existing])
    return newStructure
  },

  /** Helper for other services in mock mode (e.g. payslipService) */
  getMockStructure(employeeId: string): SalaryStructure | undefined {
    return mockStructures.get(employeeId)
  },
}
