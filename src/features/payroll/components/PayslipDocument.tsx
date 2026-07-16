import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { Payslip } from '@/services/payslipService'

/**
 * NOT the app's shared formatMoney() — that renders ₹ (U+20B9), which does not
 * exist in Helvetica's glyph set (a base-14 PDF font predating the Rupee sign's
 * 2010 standardization). Rendered ₹ shows as a missing-glyph box in every PDF
 * viewer. "Rs." is plain ASCII and renders correctly everywhere without needing
 * to bundle/register a custom Unicode font just for one symbol.
 */
function formatMoney(amount: number): string {
  return `Rs. ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2 solid #1a1a1a',
    paddingBottom: 12,
    marginBottom: 16,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  docTitle: {
    fontSize: 10,
    color: '#555555',
    marginTop: 2,
  },
  period: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  statusBadge: {
    marginTop: 4,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#7a5712',
    textAlign: 'right',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    border: '1 solid #dddddd',
    padding: 10,
  },
  infoCell: {
    width: '50%',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: '#777777',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 10,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#555555',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottom: '0.5 solid #eeeeee',
  },
  rowLabel: {
    color: '#333333',
  },
  rowValue: {
    fontFamily: 'Helvetica',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    marginTop: 2,
    borderTop: '1 solid #1a1a1a',
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    marginBottom: 16,
  },
  netBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef4f0',
    padding: 12,
    marginBottom: 16,
  },
  netLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1f4d3f',
  },
  netValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1f4d3f',
  },
  notes: {
    fontSize: 9,
    color: '#555555',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
    borderTop: '0.5 solid #eeeeee',
    paddingTop: 8,
  },
})

const formatMonthLabel = (month: string) => {
  const [year, mon] = month.split('-').map(Number) as [number, number]
  return new Date(year, mon - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

type Props = {
  payslip: Payslip
  companyName: string
}

/**
 * Pure presentational document — every figure comes straight from the Payslip
 * the caller already fetched from the backend. This file never computes or
 * guesses a number; it only lays out what it's given.
 */
export default function PayslipDocument({ payslip, companyName }: Props) {
  const structureGross = payslip.basic + payslip.hra + payslip.otherAllowance

  return (
    <Document title={`Payslip - ${payslip.employeeName} - ${payslip.month}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.docTitle}>Payslip</Text>
          </View>
          <View>
            <Text style={styles.period}>{formatMonthLabel(payslip.month)}</Text>
            {payslip.status === 'DRAFT' && <Text style={styles.statusBadge}>DRAFT — NOT FINAL</Text>}
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Employee name</Text>
            <Text style={styles.infoValue}>{payslip.employeeName}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Employee ID</Text>
            <Text style={styles.infoValue}>{payslip.employeeCode ?? '—'}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{payslip.department}</Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoLabel}>Designation</Text>
            <Text style={styles.infoValue}>{payslip.designation}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Basic</Text>
            <Text style={styles.rowValue}>{formatMoney(payslip.basic)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>HRA</Text>
            <Text style={styles.rowValue}>{formatMoney(payslip.hra)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Other allowance</Text>
            <Text style={styles.rowValue}>{formatMoney(payslip.otherAllowance)}</Text>
          </View>
          {payslip.bonus > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Bonus</Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.bonus)}</Text>
            </View>
          )}
          {payslip.incentive > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Incentive</Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.incentive)}</Text>
            </View>
          )}
          {payslip.reimbursement > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Reimbursement</Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.reimbursement)}</Text>
            </View>
          )}
          {payslip.otherEarnings > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Other earnings</Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.otherEarnings)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gross earnings</Text>
            <Text style={styles.totalValue}>{formatMoney(payslip.grossEarnings)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deductions</Text>
          {payslip.incomeTax > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Income tax</Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.incomeTax)}</Text>
            </View>
          )}
          {payslip.otherDeduction > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Other deduction</Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.otherDeduction)}</Text>
            </View>
          )}
          {payslip.lopDeduction > 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                Loss of pay ({payslip.unpaidDays} of {payslip.daysInMonth} days)
              </Text>
              <Text style={styles.rowValue}>{formatMoney(payslip.lopDeduction)}</Text>
            </View>
          )}
          {payslip.totalDeductions === 0 && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>No deductions this period</Text>
              <Text style={styles.rowValue}>{formatMoney(0)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total deductions</Text>
            <Text style={styles.totalValue}>{formatMoney(payslip.totalDeductions)}</Text>
          </View>
        </View>

        <View style={styles.netBox}>
          <Text style={styles.netLabel}>Net salary</Text>
          <Text style={styles.netValue}>{formatMoney(payslip.netSalary)}</Text>
        </View>

        {payslip.notes && (
          <View>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{payslip.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {payslip.status === 'FINALIZED' && payslip.finalizedAt
            ? `Finalized on ${payslip.finalizedAt}${payslip.finalizedBy ? ` by ${payslip.finalizedBy}` : ''} — structure gross ${formatMoney(structureGross)}, ${payslip.daysInMonth} days in period.`
            : `This is a draft preview — figures may still change before payroll is finalized.`}
        </Text>
      </Page>
    </Document>
  )
}
