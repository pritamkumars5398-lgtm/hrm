import { useEffect, useState } from 'react'
import { AlertCircle, Wallet } from 'lucide-react'
import Card from '@/shared/components/Card'
import { formatCurrency, type CompanySalaryRow, type SalaryStructurePayload } from '@/services/salaryService'
import { useSalaryStore } from '../store/salaryStore'
import SalaryStructureModal from './SalaryStructureModal'

const initialsColor = (initials: string) => {
  const charCodeSum = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)
  const colors = [
    'bg-emerald-50 text-emerald-700 border-emerald-100/80',
    'bg-blue-50 text-blue-700 border-blue-100/80',
    'bg-indigo-50 text-indigo-700 border-indigo-100/80',
    'bg-purple-50 text-purple-700 border-purple-100/80',
    'bg-pink-50 text-pink-700 border-pink-100/80',
    'bg-rose-50 text-rose-700 border-rose-100/80',
    'bg-amber-50 text-amber-700 border-amber-100/80',
    'bg-orange-50 text-orange-700 border-orange-100/80',
  ]
  return colors[charCodeSum % colors.length]
}

function RowSkeleton() {
  return (
    <tr className="border-b border-hairline last:border-0">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-wash" />
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 sm:table-cell">
        <div className="h-3 w-20 animate-pulse rounded bg-wash" />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="ml-auto h-3.5 w-20 animate-pulse rounded bg-wash" />
      </td>
    </tr>
  )
}

type Props = { canManage: boolean }

export default function SalaryStructuresView({ canManage }: Props) {
  const { status, rows, error, load, revise } = useSalaryStore()
  const [selected, setSelected] = useState<CompanySalaryRow | null>(null)

  useEffect(() => {
    void load()
  }, [load])

  const isLoading = status === 'loading'

  const handleSave = (employeeId: string, payload: SalaryStructurePayload) => revise(employeeId, payload)

  if (status === 'error') {
    return (
      <Card className="flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
        <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
        <div>
          <p className="text-[14px] font-medium text-clay">{error}</p>
          <button
            type="button"
            onClick={() => void load({ force: true })}
            className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card flush>
        <div className="border-b border-hairline px-4 py-3">
          <h2 className="text-[13px] font-semibold text-ink">Salary structures</h2>
          <p className="mt-0.5 text-[12px] text-muted">
            {canManage
              ? 'Basic, HRA and other allowance per employee. Click a row to view history or add a revision.'
              : 'Basic, HRA and other allowance per employee.'}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-hairline text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-4 py-2.5">Employee</th>
                <th className="hidden px-4 py-2.5 sm:table-cell">Department</th>
                <th className="px-4 py-2.5 text-right">Gross / month</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-16 text-center">
                    <Wallet size={22} className="mx-auto text-muted/50" aria-hidden="true" />
                    <p className="mt-3 text-[14px] font-medium text-ink">No employees yet</p>
                    <p className="mx-auto mt-1 max-w-xs text-[13px] text-muted">
                      Add someone in Employee Management first, then set up their salary here.
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.employeeId}
                    onClick={() => setSelected(row)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelected(row)
                      }
                    }}
                    aria-label={`View salary for ${row.employeeName}`}
                    className="cursor-pointer border-b border-hairline last:border-0 transition-colors hover:bg-wash/40 focus-visible:bg-wash/40 focus-visible:outline-none"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-[10.5px] font-bold ${initialsColor(row.avatarInitials)}`}
                        >
                          {row.avatarInitials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-medium text-ink">{row.employeeName}</p>
                          <p className="truncate text-[12px] text-muted">{row.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3.5 text-[13px] text-muted sm:table-cell">{row.department}</td>
                    <td className="tnum px-4 py-3.5 text-right text-[13.5px] font-semibold text-ink">
                      {row.current ? (
                        formatCurrency(row.current.gross)
                      ) : (
                        <span className="text-[12px] font-medium text-muted">Not set</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <SalaryStructureModal
        open={selected !== null}
        onClose={() => setSelected(null)}
        row={selected}
        canManage={canManage}
        onSave={handleSave}
      />
    </>
  )
}
