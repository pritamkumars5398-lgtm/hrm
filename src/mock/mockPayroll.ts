import { mockEmployees } from './mockEmployees'
import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type PayslipComponent = {
  label: string
  amount: number
}

export type Payslip = {
  id: string
  organizationId: string
  employeeId: string
  employeeName: string
  avatarInitials: string
  department: string
  designation: string
  /** YYYY-MM */
  period: string
  earnings: PayslipComponent[]
  deductions: PayslipComponent[]
  gross: number
  totalDeductions: number
  net: number
}

export type PayrollRun = {
  id: string
  organizationId: string
  /** YYYY-MM */
  period: string
  status: 'PAID' | 'READY' | 'DRAFT'
  paidOn: string | null
  headcount: number
  gross: number
  deductions: number
  net: number
}

/**
 * Base salary by seniority, in pence to avoid floating-point drift.
 * Money is never stored as a float — 0.1 + 0.2 !== 0.3, and payroll is the one
 * place that error is unacceptable.
 */
const BAND: Array<[test: RegExp, annualPence: number]> = [
  [/Founder|CEO/, 14_000_000],
  [/Head of|Lead|Manager|Director|Controller/, 9_500_000],
  [/Staff|Principal|Senior/, 8_200_000],
  [/Junior|Associate|Coordinator/, 3_800_000],
]

const DEFAULT_ANNUAL_PENCE = 5_600_000

function annualPenceFor(designation: string): number {
  for (const [test, pence] of BAND) {
    if (test.test(designation)) return pence
  }
  return DEFAULT_ANNUAL_PENCE
}

/** Stable per-employee variation, so salaries aren't suspiciously identical. */
function jitter(employeeId: string, spreadPence: number): number {
  let hash = 2166136261
  for (let i = 0; i < employeeId.length; i++) {
    hash ^= employeeId.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % spreadPence) - Math.floor(spreadPence / 2)
}

const round = (pence: number) => Math.round(pence)

export function buildPayslip(employeeId: string, period: string): Payslip | null {
  const employee = mockEmployees.find((e) => e.id === employeeId)
  if (!employee || employee.status === 'INACTIVE') return null

  const annual = annualPenceFor(employee.designation) + jitter(employee.id, 600_000)
  const monthly = round(annual / 12)

  const basic = round(monthly * 0.8)
  const allowance = round(monthly * 0.15)
  const pensionEmployer = round(monthly * 0.05)

  const gross = basic + allowance + pensionEmployer

  // Deliberately simplified UK-shaped deductions — illustrative, not a tax engine.
  const tax = round(gross * 0.2)
  const nationalInsurance = round(gross * 0.08)
  const pension = round(gross * 0.05)

  const totalDeductions = tax + nationalInsurance + pension

  return {
    id: `slip-${employee.id}-${period}`,
    organizationId: MOCK_ORGANIZATION_ID,
    employeeId: employee.id,
    employeeName: employee.name,
    avatarInitials: employee.avatarInitials,
    department: employee.department,
    designation: employee.designation,
    period,
    earnings: [
      { label: 'Basic salary', amount: basic },
      { label: 'Allowances', amount: allowance },
      { label: 'Pension (employer)', amount: pensionEmployer },
    ],
    deductions: [
      { label: 'Income tax (PAYE)', amount: tax },
      { label: 'National Insurance', amount: nationalInsurance },
      { label: 'Pension (employee)', amount: pension },
    ],
    gross,
    totalDeductions,
    net: gross - totalDeductions,
  }
}

export function buildPayslipsFor(period: string): Payslip[] {
  return mockEmployees
    .map((e) => buildPayslip(e.id, period))
    .filter((slip): slip is Payslip => slip !== null)
}

const PERIODS: Array<[period: string, status: PayrollRun['status'], paidOn: string | null]> = [
  ['2026-07', 'READY', null],
  ['2026-06', 'PAID', '2026-06-28'],
  ['2026-05', 'PAID', '2026-05-28'],
  ['2026-04', 'PAID', '2026-04-28'],
  ['2026-03', 'PAID', '2026-03-28'],
  ['2026-02', 'PAID', '2026-02-28'],
]

export const mockPayrollRuns: PayrollRun[] = PERIODS.map(([period, status, paidOn]) => {
  const slips = buildPayslipsFor(period)

  return {
    id: `run-${period}`,
    organizationId: MOCK_ORGANIZATION_ID,
    period,
    status,
    paidOn,
    headcount: slips.length,
    gross: slips.reduce((sum, s) => sum + s.gross, 0),
    deductions: slips.reduce((sum, s) => sum + s.totalDeductions, 0),
    net: slips.reduce((sum, s) => sum + s.net, 0),
  }
})
