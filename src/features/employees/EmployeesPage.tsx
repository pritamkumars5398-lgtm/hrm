import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-wash" />
          </div>
        </div>
      </td>
      <td className="hidden px-4 py-3.5 md:table-cell">
        <div className="h-3 w-20 animate-pulse rounded bg-wash" />
      </td>
      <td className="hidden px-4 py-3.5 lg:table-cell">
        <div className="h-3 w-24 animate-pulse rounded bg-wash" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5.5 w-16 animate-pulse rounded-full bg-wash" />
      </td>
    </tr>
  )
}

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
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Directory</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Employees
            </h1>
            {result && (
              <span className="tnum inline-flex items-center bg-pine-tint text-pine px-2.5 py-0.5 rounded-full text-[12px] font-semibold border border-pine/10">
                {result.total} {result.total === 1 ? 'person' : 'people'}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13.5px] text-muted">
            {hasFilters ? 'Showing filtered results from company directory.' : 'Manage and view your company directory.'}
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
            className="h-10 w-full rounded-ctl border border-hairline-strong bg-surface pr-3 pl-9 text-[13.5px] transition-colors placeholder:text-muted/70 hover:border-muted/50 focus:border-pine focus:outline-none"
          />
        </div>

        <div className="relative sm:w-44 w-full">
          <select
            value={query.department}
            onChange={(e) => setQuery({ department: e.target.value })}
            aria-label="Filter by department"
            className="h-10 w-full appearance-none rounded-ctl border border-hairline-strong bg-surface pr-8 pl-3 text-[13.5px] font-medium text-ink transition-colors hover:border-muted/50 focus:border-pine focus:outline-none cursor-pointer"
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        <div className="relative sm:w-36 w-full">
          <select
            value={query.status}
            onChange={(e) => setQuery({ status: e.target.value as typeof query.status })}
            aria-label="Filter by status"
            className="h-10 w-full appearance-none rounded-ctl border border-hairline-strong bg-surface pr-8 pl-3 text-[13.5px] font-medium text-ink transition-colors hover:border-muted/50 focus:border-pine focus:outline-none cursor-pointer"
          >
            <option value="">All statuses</option>
            {EMPLOYEE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>

        {hasFilters && (
          <Button variant="ghost" onClick={clearAll} className="h-10 text-clay hover:bg-clay/5 flex items-center gap-1.5">
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
        <Card flush className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-hairline bg-wash/50">
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
                        className={`px-4 py-3.5 text-left ${col.className ?? ''}`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleSort(col.field)}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-muted uppercase transition-colors ${
                            active ? 'text-ink' : 'hover:text-ink'
                          }`}
                        >
                          {col.label}
                          {active &&
                            (query.sortDir === 'asc' ? (
                              <ArrowUp size={12} className="text-pine" />
                            ) : (
                              <ArrowDown size={12} className="text-pine" />
                            ))}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-hairline">
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
                      className="cursor-pointer transition-colors hover:bg-wash/50 focus-visible:bg-wash/50 focus-visible:outline-none"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-bold ${initialsColor(employee.avatarInitials)}`}>
                            {employee.avatarInitials}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13.5px] font-semibold text-ink leading-tight">{employee.name}</p>
                            <p className="truncate text-[11.5px] text-muted mt-1 leading-none">
                              {employee.designation}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3.5 text-[13px] font-medium text-muted md:table-cell">
                        {employee.department}
                      </td>
                      <td className="tnum hidden px-4 py-3.5 text-[13px] font-medium text-muted lg:table-cell">
                        {formatDate(employee.joinedAt)}
                      </td>
                      <td className="px-4 py-3.5">
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
              <p className="tnum text-[12.5px] text-muted font-medium">
                Showing {(result.page - 1) * result.pageSize + 1}–
                {Math.min(result.page * result.pageSize, result.total)} of {result.total}
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuery({ page: result.page - 1 })}
                  disabled={result.page <= 1}
                  aria-label="Previous page"
                  className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={15} />
                </button>

                <span className="tnum px-1 text-[12.5px] text-muted font-medium">
                  Page {result.page} of {result.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setQuery({ page: result.page + 1 })}
                  disabled={result.page >= result.totalPages}
                  aria-label="Next page"
                  className="inline-flex size-8 items-center justify-center rounded-ctl border border-hairline-strong bg-surface text-muted transition-colors hover:border-pine hover:text-pine disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
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
