import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { mockEmployees } from '@/mock/mockEmployees'
import { MOCK_ORGANIZATION_ID } from '@/mock/mockUsers'
import { salaryService } from './salaryService'

export class PayslipError extends Error {}

export type PayslipStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'FINALIZED'

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

// In-memory cache for mock payslips keyed by `${month}-${employeeId}`
const mockPayslipsCache = new Map<string, Payslip>()

function generateMockPayslip(emp: typeof mockEmployees[0], month: string): Payslip {
  const key = `${month}-${emp.id}`
  if (mockPayslipsCache.has(key)) {
    return mockPayslipsCache.get(key)!
  }

  const structure = salaryService.getMockStructure(emp.id)
  const basic = structure ? structure.basic : 45000
  const hra = structure ? structure.hra : 18000
  const otherAllowance = structure ? structure.otherAllowance : 7000
  const grossEarnings = basic + hra + otherAllowance

  // Standard deductions
  const incomeTax = Math.round(grossEarnings * 0.1)
  const otherDeduction = Math.round(grossEarnings * 0.05)
  const totalDeductions = incomeTax + otherDeduction
  const netSalary = grossEarnings - totalDeductions

  const now = new Date()
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const status: PayslipStatus = month < currentMonthStr ? 'FINALIZED' : 'DRAFT'

  const payslip: Payslip = {
    id: `slip-${emp.id}-${month}`,
    organizationId: emp.organizationId || MOCK_ORGANIZATION_ID,
    employeeId: emp.id,
    employeeCode: emp.employeeId || `EMP-${emp.id.replace(/\D/g, '').padStart(3, '0') || '001'}`,
    employeeName: emp.name,
    avatarInitials: emp.avatarInitials,
    department: emp.department,
    designation: emp.designation,
    month,
    status,
    hasSalaryStructure: true,
    basic,
    hra,
    otherAllowance,
    daysInMonth: 30,
    unpaidDays: 0,
    bonus: 0,
    incentive: 0,
    reimbursement: 0,
    otherEarnings: 0,
    incomeTax,
    otherDeduction,
    lopDeduction: 0,
    grossEarnings,
    totalDeductions,
    netSalary,
    notes: null,
    finalizedAt: status === 'FINALIZED' ? `${month}-28T10:00:00.000Z` : null,
    finalizedBy: status === 'FINALIZED' ? 'HR Operations' : null,
  }

  mockPayslipsCache.set(key, payslip)
  return payslip
}

export const payslipService = {
  async list(month: string, options?: { mine?: boolean }): Promise<Payslip[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Payslip[]>('/payroll/payslips', {
          params: { month, ...(options?.mine ? { scope: 'me' } : {}) },
        })
        return data
      } catch (error) {
        throw new PayslipError(apiErrorMessage(error, 'We could not load payroll for that month.'))
      }
    }

    const activeEmployees = mockEmployees.filter((e) => e.status !== 'INACTIVE')
    const list = activeEmployees.map((emp) => generateMockPayslip(emp, month))

    if (options?.mine) {
      return list.slice(0, 1)
    }

    return list
  },

  async saveDraft(employeeId: string, month: string, payload: PayslipDraftPayload): Promise<Payslip> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Payslip>(`/payroll/payslips/${employeeId}`, payload, { params: { month } })
        return data
      } catch (error) {
        throw new PayslipError(apiErrorMessage(error, 'We could not save that payslip.'))
      }
    }

    const key = `${month}-${employeeId}`
    const emp = mockEmployees.find((e) => e.id === employeeId) || mockEmployees[0]
    const existing = generateMockPayslip(emp, month)

    const bonus = payload.bonus ?? existing.bonus
    const incentive = payload.incentive ?? existing.incentive
    const reimbursement = payload.reimbursement ?? existing.reimbursement
    const otherEarnings = payload.otherEarnings ?? existing.otherEarnings
    const incomeTax = payload.incomeTax ?? existing.incomeTax
    const otherDeduction = payload.otherDeduction ?? existing.otherDeduction
    const notes = payload.notes ?? existing.notes

    const grossEarnings = existing.basic + existing.hra + existing.otherAllowance + bonus + incentive + reimbursement + otherEarnings
    const totalDeductions = incomeTax + otherDeduction + existing.lopDeduction
    const netSalary = grossEarnings - totalDeductions

    const updated: Payslip = {
      ...existing,
      bonus,
      incentive,
      reimbursement,
      otherEarnings,
      incomeTax,
      otherDeduction,
      notes,
      grossEarnings,
      totalDeductions,
      netSalary,
    }

    mockPayslipsCache.set(key, updated)
    return updated
  },

  async submitApproval(employeeId: string, month: string): Promise<Payslip> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Payslip>(`/payroll/payslips/${employeeId}/submit-approval`, undefined, { params: { month } })
        return data
      } catch (error) {
        throw new PayslipError(apiErrorMessage(error, 'We could not submit that payslip for approval.'))
      }
    }

    const key = `${month}-${employeeId}`
    const emp = mockEmployees.find((e) => e.id === employeeId) || mockEmployees[0]
    const existing = generateMockPayslip(emp, month)
    const updated: Payslip = {
      ...existing,
      status: 'PENDING_APPROVAL',
    }
    mockPayslipsCache.set(key, updated)
    return updated
  },
}
