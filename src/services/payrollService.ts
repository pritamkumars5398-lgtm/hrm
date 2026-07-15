import {
  buildPayslipsFor,
  mockPayrollRuns,
  type PayrollRun,
  type Payslip,
} from '@/mock/mockPayroll'
import type { Role } from './authService'

export type { PayrollRun, Payslip }

export class PayrollError extends Error {}

const LATENCY_MS = 600
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Pence → "₹1,23,456.78". Formatting lives in one place so no screen invents its own. */
export function formatMoney(pence: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(pence / 100)
}

/** Compact form for big headline figures — "₹182.4k". */
export function formatMoneyCompact(pence: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(pence / 100)
}

export type PayrollData = {
  runs: PayrollRun[]
  selected: PayrollRun
  payslips: Payslip[]
}

export const payrollService = {
  /**
   * Mock-only (§11.4). Payroll is **Owner-only** (§10) — the role check is here
   * as well as on the route, because once this is a real API, salary data must
   * not leave the server for anyone else.
   */
  async get(role: Role, period?: string): Promise<PayrollData> {
    await delay()

    if (role !== 'OWNER') {
      throw new PayrollError('Payroll is restricted to owners.')
    }

    const runs = [...mockPayrollRuns].sort((a, b) => b.period.localeCompare(a.period))
    const selected = runs.find((r) => r.period === period) ?? runs[0]!

    return {
      runs,
      selected,
      payslips: buildPayslipsFor(selected.period).sort((a, b) =>
        a.employeeName.localeCompare(b.employeeName),
      ),
    }
  },
}
