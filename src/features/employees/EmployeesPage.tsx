import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  X,
} from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import {
  EMPLOYEE_STATUSES,
  employeeService,
  type SortField,
} from '@/services/employeeService'
import { useEmployeeStore } from './store/employeeStore'
import EmployeeStatusBadge from './components/EmployeeStatusBadge'
import EmployeeDrawer from './components/EmployeeDrawer'
import { STATUS_LABEL } from './labels'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

const COLUMNS: Array<{ field: SortField; label: string; className?: string }> = [
  { field: 'name', label: 'Name' },
  { field: 'department', label: 'Department', className: 'hidden md:table-cell' },
  { field: 'joinedAt', label: 'Joined', className: 'hidden lg:table-cell' },
  { field: 'status', label: 'Status' },
]

function RowSkeleton() {
  return (
    <tr className="border-b border-hairline last:border-0">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-wash" />
          <div>
            <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-wash" />
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <div className="h-3.5 w-24 animate-pulse rounded bg-wash" />
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <div className="h-3.5 w-20 animate-pulse rounded bg-wash" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-16 animate-pulse rounded-full bg-wash" />
      </td>
    </tr>
  )
}

export default function EmployeesPage() {
  const { status, result, query, error, fetch, setQuery, toggleSort, reset } = useEmployeeStore()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(query.search)

  const departments = employeeService.getDepartmentOptions()

  useEffect(() => {
    void fetch()
  }, [fetch])

  // Debounced: refetching on every keystroke would hammer a real API.
  useEffect(() => {
    if (searchInput === query.search) return

    const timer = setTimeout(() => setQuery({ search: searchInput }), 300)
    return () => clearTimeout(timer)
  }, [searchInput, query.search, setQuery])

  const hasFilters = Boolean(query.search || query.department || query.status)
  const isBusy = status === 'loading'
  const rows = result?.rows ?? []

  const clearAll = () => {
    setSearchInput('')
    reset()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Employees
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            {result ? (
              <>
                <span className="tnum font-medium text-ink">{result.total}</span>{' '}
                {result.total === 1 ? 'person' : 'people'}
                {hasFilters && ' matching your filters'}
              </>
            ) : (
              'Your company directory.'
            )}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={15}
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email or job title…"
            aria-label="Search employees"
            className="h-10 w-full rounded-ctl border border-hairline-strong bg-surface pr-3 pl-9 text-[14px] transition-colors placeholder:text-muted/70 hover:border-muted/50 focus:border-pine"
          />
        </div>

        <select
          value={query.department}
          onChange={(e) => setQuery({ department: e.target.value })}
          aria-label="Filter by department"
          className="h-10 rounded-ctl border border-hairline-strong bg-surface px-3 text-[14px] transition-colors hover:border-muted/50 focus:border-pine sm:w-44"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={query.status}
          onChange={(e) => setQuery({ status: e.target.value as typeof query.status })}
          aria-label="Filter by status"
          className="h-10 rounded-ctl border border-hairline-strong bg-surface px-3 text-[14px] transition-colors hover:border-muted/50 focus:border-pine sm:w-36"
        >
          <option value="">All statuses</option>
          {EMPLOYEE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearAll}>
            <X size={15} />
            Clear
          </Button>
        )}
      </div>

      {/* Error */}
      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <div>
            <p className="text-[14px] font-medium text-clay">{error}</p>
            <button
              type="button"
              onClick={() => void fetch()}
              className="mt-2 text-[13px] font-medium text-clay underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </Card>
      )}

      {status !== 'error' && (
        <Card flush className="mt-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-hairline bg-wash">
                  {COLUMNS.map((col) => {
                    const active = query.sortBy === col.field
                    return (
                      <th
                        key={col.field}
                        scope="col"
                        aria-sort={
                          active
                            ? query.sortDir === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                        className={`px-4 py-2.5 text-left ${col.className ?? ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.field)}
                          className={`inline-flex items-center gap-1 text-[12px] font-semibold transition-colors ${
                            active ? 'text-ink' : 'text-muted hover:text-ink'
                          }`}
                        >
                          {col.label}
                          {active &&
                            (query.sortDir === 'asc' ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            ))}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody>
                {isBusy &&
                  [0, 1, 2, 3, 4].map((i) => <RowSkeleton key={i} />)}

                {!isBusy &&
                  rows.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => setSelectedId(employee.id)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedId(employee.id)
                        }
                      }}
                      aria-label={`View ${employee.name}`}
                      className="cursor-pointer border-b border-hairline transition-colors last:border-0 hover:bg-wash focus-visible:bg-wash"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-wash text-[11px] font-semibold text-muted">
                            {employee.avatarInitials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-medium">{employee.name}</p>
                            <p className="truncate text-[12px] text-muted">
                              {employee.designation}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-[13px] text-muted md:table-cell">
                        {employee.department}
                      </td>
                      <td className="tnum hidden px-4 py-3 text-[13px] text-muted lg:table-cell">
                        {formatDate(employee.joinedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <EmployeeStatusBadge status={employee.status} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Empty */}
          {!isBusy && rows.length === 0 && (
            <div className="px-4 py-16 text-center">
              <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-wash">
                <Users size={18} className="text-muted" aria-hidden="true" />
              </span>
              <p className="mt-4 text-[14px] font-medium">
                {hasFilters ? 'No one matches those filters' : 'No employees yet'}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                {hasFilters
                  ? 'Try a different search term, or clear the filters to see everyone.'
                  : 'People you add will appear in this directory.'}
              </p>
              {hasFilters && (
                <Button variant="secondary" size="sm" onClick={clearAll} className="mt-4">
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isBusy && result && result.total > 0 && (
            <div className="flex items-center justify-between gap-4 border-t border-hairline px-4 py-3">
              <p className="tnum text-[12.5px] text-muted">
                Showing {(result.page - 1) * result.pageSize + 1}–
                {Math.min(result.page * result.pageSize, result.total)} of {result.total}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuery({ page: result.page - 1 })}
                  disabled={result.page <= 1}
                  aria-label="Previous page"
                  className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>

                <span className="tnum px-1 text-[12.5px] text-muted">
                  Page {result.page} of {result.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setQuery({ page: result.page + 1 })}
                  disabled={result.page >= result.totalPages}
                  aria-label="Next page"
                  className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine disabled:pointer-events-none disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      <EmployeeDrawer employeeId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  )
}
