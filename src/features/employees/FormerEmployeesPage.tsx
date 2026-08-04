import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UserX,
  Search,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ExternalLink,
  Users,
} from 'lucide-react'
import { employeeService } from '@/services/employeeService'
import type { Employee } from '@/services/employeeService'

const formatDate = (iso: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  INACTIVE:  { label: 'Left Company',    className: 'bg-red-50 text-red-700 border-red-200' },
  NOTICE:    { label: 'Notice Period',   className: 'bg-orange-50 text-orange-700 border-orange-200' },
  DELETED:   { label: 'Record Deleted',  className: 'bg-gray-100 text-gray-600 border-gray-300' },
  PROBATION: { label: 'Probation',       className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  ON_LEAVE:  { label: 'On Leave',        className: 'bg-blue-50 text-blue-700 border-blue-200' },
}

function StatusBadge({ status, isDeleted }: { status: string; isDeleted?: boolean }) {
  const key = isDeleted ? 'DELETED' : status
  const s = STATUS_STYLES[key] ?? { label: status, className: 'bg-gray-50 text-gray-700 border-gray-200' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${s.className}`}>
      {s.label}
    </span>
  )
}

type SortField = 'name' | 'department' | 'designation' | 'joinedAt' | 'status'
const PAGE_SIZE = 15

function SkeletonRow() {
  return (
    <tr className="border-b border-hairline">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 w-24 animate-pulse rounded bg-wash" />
        </td>
      ))}
    </tr>
  )
}

export default function FormerEmployeesPage() {
  const navigate = useNavigate()
  const [all, setAll] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const data = await employeeService.getFormer()
        setAll(data)
      } catch {
        setError('Could not load former employee records.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = all
    .filter(e => {
      if (statusFilter === 'DELETED') return e.isDeleted
      if (statusFilter !== 'ALL' && e.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          e.name.toLowerCase().includes(q) ||
          (e.designation ?? '').toLowerCase().includes(q) ||
          (e.department ?? '').toLowerCase().includes(q) ||
          (e.email ?? '').toLowerCase().includes(q) ||
          (e.phone ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const factor = sortDir === 'asc' ? 1 : -1
      if (sortField === 'name')        return a.name.localeCompare(b.name) * factor
      if (sortField === 'department')  return (a.department ?? '').localeCompare(b.department ?? '') * factor
      if (sortField === 'designation') return (a.designation ?? '').localeCompare(b.designation ?? '') * factor
      if (sortField === 'joinedAt')    return (a.joinedAt ?? '').localeCompare(b.joinedAt ?? '') * factor
      if (sortField === 'status')      return (a.status ?? '').localeCompare(b.status ?? '') * factor
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const inactiveCount = all.filter(e => e.status === 'INACTIVE' && !e.isDeleted).length
  const noticeCount   = all.filter(e => e.status === 'NOTICE').length
  const deletedCount  = all.filter(e => e.isDeleted).length

  const handleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(f); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="text-muted/40" />
    return sortDir === 'asc'
      ? <ArrowUp size={13} className="text-pine" />
      : <ArrowDown size={13} className="text-pine" />
  }

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold text-muted/70 uppercase tracking-wider mb-0.5">Directory</p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Former Employees
            </h1>
            {!loading && (
              <span className="inline-flex items-center bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[12px] font-semibold">
                {all.length} {all.length === 1 ? 'record' : 'records'}
              </span>
            )}
          </div>
          <p className="mt-1 text-[13.5px] text-muted">
            Employees who have left, on notice period, or whose records were deleted.
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/employees')}
          className="inline-flex items-center gap-2 rounded-ctl border border-hairline-strong bg-surface px-4 py-2 text-[13px] font-medium text-muted hover:bg-wash hover:text-ink transition-colors"
        >
          <Users size={14} />
          Active Employees
        </button>
      </div>

      {/* ── Summary Cards ──────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">Left Company</p>
          <p className="text-3xl font-bold text-red-700">{inactiveCount}</p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-400 mb-1">Notice Period</p>
          <p className="text-3xl font-bold text-orange-700">{noticeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Deleted Records</p>
          <p className="text-3xl font-bold text-gray-700">{deletedCount}</p>
        </div>
        <div className="rounded-xl border border-hairline bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted/60 mb-1">Total</p>
          <p className="text-3xl font-bold text-ink">{all.length}</p>
        </div>
      </div>

      {/* ── Toolbar ────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, email, department or job title…"
            className="h-10 w-full rounded-ctl border border-hairline-strong bg-surface pr-3 pl-9 text-[13.5px] placeholder:text-muted/60 hover:border-muted/50 focus:border-pine focus:outline-none transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-10 rounded-ctl border border-hairline-strong bg-surface px-3 text-[13px] text-ink focus:border-pine focus:outline-none sm:w-48"
        >
          <option value="ALL">All Records</option>
          <option value="INACTIVE">Left Company</option>
          <option value="NOTICE">Notice Period</option>
          <option value="DELETED">Deleted Records</option>
        </select>
      </div>

      {/* ── Error ──────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-clay/30 bg-clay/5 p-4 text-[13px] text-clay">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Table ──────────────────────────── */}
      <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-[13px]">
            <thead>
              <tr className="border-b border-hairline bg-wash/60">
                <th className="px-4 py-3 text-left font-semibold text-muted">
                  <button onClick={() => handleSort('name')} className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                    Employee <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted hidden md:table-cell">
                  <button onClick={() => handleSort('designation')} className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                    Job Title <SortIcon field="designation" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted hidden lg:table-cell">
                  <button onClick={() => handleSort('department')} className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                    Department <SortIcon field="department" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted hidden sm:table-cell">
                  Phone / Email
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted hidden lg:table-cell">
                  <button onClick={() => handleSort('joinedAt')} className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                    Joined <SortIcon field="joinedAt" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted">
                  <button onClick={() => handleSort('status')} className="inline-flex items-center gap-1.5 hover:text-ink transition-colors">
                    Status <SortIcon field="status" />
                  </button>
                </th>
                <th className="px-4 py-3 text-right font-semibold text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : rows.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex size-14 items-center justify-center rounded-2xl bg-wash">
                          <UserX size={24} className="text-muted" />
                        </div>
                        <p className="text-[14px] font-semibold text-ink">
                          {search || statusFilter !== 'ALL' ? 'No matching records' : 'No former employees yet'}
                        </p>
                        <p className="text-[12.5px] text-muted max-w-xs">
                          {search || statusFilter !== 'ALL'
                            ? 'Try adjusting your search or filter.'
                            : 'Mark an employee as Inactive or delete their record to see them here.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )
                : rows.map(emp => {
                    const initials = getInitials(emp.name)
                    return (
                      <tr
                        key={emp.id}
                        className="border-b border-hairline last:border-0 hover:bg-wash/50 transition-colors group"
                      >
                        {/* Employee Name + Avatar */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            {emp.photoUrl ? (
                              <img
                                src={emp.photoUrl}
                                alt={emp.name}
                                className="size-9 rounded-full object-cover ring-1 ring-hairline shrink-0 grayscale group-hover:grayscale-0 transition-all"
                              />
                            ) : (
                              <span className="size-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[12px] font-bold border border-red-200 shrink-0">
                                {initials}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-ink truncate">{emp.name}</p>
                              {emp.employeeId && (
                                <p className="text-[11.5px] text-muted truncate">ID: {emp.employeeId}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Job Title */}
                        <td className="px-4 py-3.5 hidden md:table-cell text-muted">
                          {emp.designation || '—'}
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 hidden lg:table-cell text-muted">
                          {emp.department || '—'}
                        </td>

                        {/* Phone / Email */}
                        <td className="px-4 py-3.5 hidden sm:table-cell">
                          <div className="space-y-0.5">
                            {emp.phone && <p className="text-ink">{emp.phone}</p>}
                            {emp.email && <p className="text-[12px] text-muted truncate max-w-[180px]">{emp.email}</p>}
                            {!emp.phone && !emp.email && <span className="text-muted">—</span>}
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-3.5 hidden lg:table-cell text-muted">
                          {emp.joinedAt ? formatDate(emp.joinedAt) : '—'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={emp.status ?? 'INACTIVE'} isDeleted={emp.isDeleted} />
                        </td>

                        {/* Action */}
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => navigate(`/dashboard/employees/${emp.id}`)}
                            className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-pine hover:underline"
                          >
                            View <ExternalLink size={12} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-hairline px-4 py-3 bg-wash/30">
            <p className="text-[12.5px] text-muted">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of <span className="font-semibold text-ink">{filtered.length}</span> records
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-hairline text-muted hover:bg-wash disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = i + 1
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`inline-flex size-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                      page === p
                        ? 'bg-gradient-to-r from-[#10b981] to-[#15803d] text-white shadow-sm'
                        : 'border border-hairline text-muted hover:bg-wash'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-hairline text-muted hover:bg-wash disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
