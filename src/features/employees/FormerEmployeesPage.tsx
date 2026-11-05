import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Search,
  Download,
  FileText,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react'
import {
  formerEmployeesService,
  type FormerEmployee,
  type RecordExitPayload,
} from '../../services/formerEmployeesService'

export default function FormerEmployeesPage() {
  const [former, setFormer] = useState<FormerEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [exitDate, setExitDate] = useState('')
  const [exitReason, setExitReason] = useState('')
  const [fnfStatus, setFnfStatus] = useState<FormerEmployee['fnfStatus']>('IN_PROCESS')
  const [settledAmount, setSettledAmount] = useState('')

  const fetchFormer = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await formerEmployeesService.getAll(search)
      setFormer(data)
    } catch (err: unknown) {
      console.error('Failed to load former employees:', err)
      setError('Failed to fetch exit records. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchFormer()
  }, [fetchFormer])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !jobTitle.trim() || !exitDate.trim()) return
    try {
      setSubmitting(true)
      const payload: RecordExitPayload = {
        name: name.trim(),
        jobTitle: jobTitle.trim(),
        department,
        exitDate,
        fnfStatus,
        exitReason: exitReason.trim() || undefined,
        settledAmount: settledAmount ? Number(settledAmount) : undefined,
      }
      await formerEmployeesService.recordExit(payload)
      setShowModal(false)
      setName('')
      setJobTitle('')
      setExitDate('')
      setExitReason('')
      setSettledAmount('')
      await fetchFormer()
    } catch (err: unknown) {
      console.error('Failed to record exit:', err)
      alert('Could not record employee exit.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFnfChange = async (
    id: string,
    newStatus: FormerEmployee['fnfStatus'],
  ) => {
    try {
      const updated = await formerEmployeesService.updateFnf(id, newStatus)
      setFormer((prev) => prev.map((f) => (f.id === id ? updated : f)))
    } catch (err: unknown) {
      console.error('Failed to update F&F status:', err)
      alert('Failed to update status.')
    }
  }

  const handleDownloadRelieving = async (id: string) => {
    try {
      setDownloadingId(id)
      const { fileName, content } = await formerEmployeesService.getRelievingLetter(id)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err: unknown) {
      console.error('Failed to generate relieving letter:', err)
      alert('Failed to generate relieving certificate.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this exit archive?')) return
    try {
      await formerEmployeesService.delete(id)
      setFormer((prev) => prev.filter((f) => f.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete exit record:', err)
      alert('Delete failed.')
    }
  }

  const settledCount = former.filter((f) => f.fnfStatus === 'SETTLED').length
  const inProcessCount = former.filter((f) => f.fnfStatus === 'IN_PROCESS').length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white p-6 rounded-2xl border border-hairline shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users size={14} /> Separation, Exit Management & Archival
          </div>
          <h1 className="text-2xl font-bold font-display">Former Employees & Exit Archives</h1>
          <p className="text-slate-300 text-sm mt-1">
            Full & Final (F&F) settlement records, asset recovery, and official relieving certificate downloads.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFormer}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2.5 rounded-xl transition text-xs border border-white/10 cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
          >
            <Plus size={16} /> Record Employee Exit
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={fetchFormer} className="font-bold underline cursor-pointer">
            Try Again
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Total Exit Archives</span>
          <p className="text-2xl font-bold text-ink mt-1">{former.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Offboarded employees</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">F&F Settled</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{settledCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Accounts Disbursed & Closed
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">In Process Settlement</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProcessCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            Awaiting Clearance / Audit
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-hairline shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search former employees by name, role, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none bg-wash/30"
          />
        </div>
        <span className="text-xs text-muted font-medium">
          Showing {former.length} archived record{former.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-hairline shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-600" />
            Loading exit archives...
          </div>
        ) : former.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted space-y-2">
            <Users size={32} className="mx-auto text-slate-300" />
            <p className="font-semibold text-ink">No former employee records found</p>
            <p className="text-[11px]">Click 'Record Employee Exit' to archive offboarded staff.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash/80 border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Employee Name</th>
                  <th className="p-3.5">Designation</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Exit Date</th>
                  <th className="p-3.5">Exit Reason</th>
                  <th className="p-3.5">F&F Settlement</th>
                  <th className="p-3.5">Relieving Certificate</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {former.map((emp) => (
                  <tr key={emp.id} className="hover:bg-wash/30 transition">
                    <td className="p-3.5 font-semibold text-ink">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span>{emp.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-muted font-medium">{emp.jobTitle}</td>
                    <td className="p-3.5 text-muted font-medium">{emp.department}</td>
                    <td className="p-3.5 text-muted font-mono">{emp.exitDate}</td>
                    <td className="p-3.5 text-muted max-w-[140px] truncate">
                      {emp.exitReason || 'Resignation'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.fnfStatus === 'SETTLED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {emp.fnfStatus === 'SETTLED' ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <Clock size={10} />
                        )}
                        {emp.fnfStatus}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => handleDownloadRelieving(emp.id)}
                        disabled={downloadingId === emp.id}
                        className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Download size={13} />
                        {downloadingId === emp.id ? 'Generating...' : 'Relieving Certificate'}
                      </button>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={emp.fnfStatus}
                          onChange={(e) =>
                            handleFnfChange(
                              emp.id,
                              e.target.value as FormerEmployee['fnfStatus'],
                            )
                          }
                          className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="IN_PROCESS">In Process</option>
                          <option value="SETTLED">Settled</option>
                        </select>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Delete archive"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Users size={18} className="text-indigo-600" />
                Record Employee Exit & Archival
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Employee Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Dev"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Official Exit Date</label>
                  <input
                    type="date"
                    required
                    value={exitDate}
                    onChange={(e) => setExitDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">F&F Settlement Status</label>
                  <select
                    value={fnfStatus}
                    onChange={(e) =>
                      setFnfStatus(e.target.value as FormerEmployee['fnfStatus'])
                    }
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="IN_PROCESS">In Process</option>
                    <option value="SETTLED">Settled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Exit Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Higher Education / Relocation"
                  value={exitReason}
                  onChange={(e) => setExitReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Archiving...' : 'Record Exit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
