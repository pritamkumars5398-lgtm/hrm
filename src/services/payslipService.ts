import { apiClient, apiErrorMessage } from './apiClient'

export class PayslipError extends Error {}

export type PayslipStatus = 'DRAFT' | 'FINALIZED'

export type Payslip = {
  id: string | null
  organizationId: string
  employeeId: string
  /** The human-readable Employee ID business field (e.g. "EMP-045") — not always set. */
  employeeCode: string | null
  employeeName: string
  avatarInitials: string
  department: string
  designation: string
  month: string
  status: PayslipStatus
  hasSalaryStructure: boolean
  basic: number
  hra: number
  otherAllowance: number
  daysInMonth: number
  unpaidDays: number
  bonus: number
  incentive: number
  reimbursement: number
  otherEarnings: number
  incomeTax: number
  otherDeduction: number
  lopDeduction: number
  grossEarnings: number
  totalDeductions: number
  netSalary: number
  notes: string | null
  finalizedAt: string | null
  finalizedBy: string | null
}

export type PayslipDraftPayload = {
  bonus?: number
  incentive?: number
  reimbursement?: number
  otherEarnings?: number
  incomeTax?: number
  otherDeduction?: number
  notes?: string
}

/** Real backend only — no offline mock path, same as Salary Structure. */
export const payslipService = {
  async list(month: string, options?: { mine?: boolean }): Promise<Payslip[]> {
    try {
      const { data } = await apiClient.get<Payslip[]>('/payroll/payslips', {
        params: { month, ...(options?.mine ? { scope: 'me' } : {}) },
      })
      return data
    } catch (error) {
      throw new PayslipError(apiErrorMessage(error, 'We could not load payroll for that month.'))
    }
  },

  async saveDraft(employeeId: string, month: string, payload: PayslipDraftPayload): Promise<Payslip> {
    try {
      const { data } = await apiClient.post<Payslip>(`/payroll/payslips/${employeeId}`, payload, { params: { month } })
      return data
    } catch (error) {
      throw new PayslipError(apiErrorMessage(error, 'We could not save that payslip.'))
    }
  },

  async finalize(employeeId: string, month: string): Promise<Payslip> {
    try {
      // No body: NestJS's body-parser runs in strict mode and rejects any
      // top-level JSON value that isn't an object/array — including a literal
      // `null` — before the request even reaches the controller.
      const { data } = await apiClient.post<Payslip>(`/payroll/payslips/${employeeId}/finalize`, undefined, { params: { month } })
      return data
    } catch (error) {
      throw new PayslipError(apiErrorMessage(error, 'We could not finalize that payslip.'))
    }
  },
}
