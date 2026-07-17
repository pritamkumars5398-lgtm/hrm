import { apiClient, apiErrorMessage } from './apiClient'
import { formatMoney } from './payrollService'

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

/**
 * Real backend only (§ payroll) — salary data is money, there is no offline
 * mock path. Every screen using this must handle the "backend not configured"
 * error state rather than silently falling back to invented numbers.
 */
export const salaryService = {
  async listCompany(): Promise<CompanySalaryRow[]> {
    try {
      const { data } = await apiClient.get<CompanySalaryRow[]>('/payroll/salary')
      return data
    } catch (error) {
      throw new SalaryError(apiErrorMessage(error, 'We could not load salary structures.'))
    }
  },

  async history(employeeId: string): Promise<SalaryStructure[]> {
    try {
      const { data } = await apiClient.get<SalaryStructure[]>(`/payroll/salary/${employeeId}/history`)
      return data
    } catch (error) {
      throw new SalaryError(apiErrorMessage(error, 'We could not load that salary history.'))
    }
  },

  async upsert(employeeId: string, payload: SalaryStructurePayload): Promise<SalaryStructure> {
    try {
      const { data } = await apiClient.post<SalaryStructure>(`/payroll/salary/${employeeId}`, payload)
      return data
    } catch (error) {
      throw new SalaryError(apiErrorMessage(error, 'We could not save that salary structure.'))
    }
  },
}
