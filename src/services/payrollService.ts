/**
 * Pure money formatting only — the mock payroll-run/payslip generator that used
 * to live here has been removed (§ payroll: no mock data). Kept because Reports
 * still uses these two formatters for its own (still-mock, out of scope) payroll
 * cost figure.
 */

/** Rupees → "₹1,23,456". No decimals — payroll amounts are whole rupees. */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Compact form for big headline figures — "₹18.2L". */
export function formatMoneyCompact(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}
