import { useState, useEffect, useCallback } from 'react'
import {
  ShieldCheck,
  Download,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileText,
  Building2,
  Plus,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import {
  complianceService,
  type ComplianceItem,
  type ComplianceMetrics,
  type CreateCompliancePayload,
} from '../../services/complianceService'

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>([])
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [downloadingEcr, setDownloadingEcr] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [authority, setAuthority] = useState('EPFO India')
  const [dueDate, setDueDate] = useState('')
  const [penaltyRisk, setPenaltyRisk] = useState('')
  const [period, setPeriod] = useState('')

  const fetchCompliance = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await complianceService.getAll()
      setItems(data.items)
      setMetrics(data.metrics)
    } catch (err: unknown) {
      console.error('Failed to load compliance data:', err)
      setError('Failed to fetch statutory compliance records. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompliance()
  }, [fetchCompliance])

  const handleMarkFiled = async (id: string) => {
    try {
      const updated = await complianceService.markFiled(id)
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
      await fetchCompliance()
    } catch (err: unknown) {
      console.error('Failed to mark compliance filed:', err)
      alert('Could not update filing status.')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !dueDate.trim() || !penaltyRisk.trim()) return
    try {
      setSubmitting(true)
      const payload: CreateCompliancePayload = {
        name: name.trim(),
        authority,
        dueDate: dueDate.trim(),
        penaltyRisk: penaltyRisk.trim(),
        period: period.trim() || undefined,
      }
      await complianceService.create(payload)
      setShowModal(false)
      setName('')
      setDueDate('')
      setPenaltyRisk('')
      setPeriod('')
      await fetchCompliance()
    } catch (err: unknown) {
      console.error('Failed to create statutory item:', err)
      alert('Could not add compliance record.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this compliance record?')) return
    try {
      await complianceService.delete(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete compliance record:', err)
      alert('Delete failed.')
    }
  }

  const handleExportEcr = async () => {
    try {
      setDownloadingEcr(true)
      const { fileName, content } = await complianceService.exportEcr()
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
      console.error('Failed to export ECR file:', err)
      alert('Failed to generate ECR file.')
    } finally {
      setDownloadingEcr(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 text-white p-6 rounded-2xl border border-cyan-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> Statutory & Labour Law Compliance Engine
          </div>
          <h1 className="text-2xl font-bold font-display">Statutory Returns, PF, ESIC & Form 16</h1>
          <p className="text-slate-300 text-sm mt-1">
            EPFO ECR generation, ESIC returns, TDS Section 192, and Form 16 Part A & B compliance calendar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCompliance}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-2.5 rounded-xl transition text-xs border border-white/10 cursor-pointer"
            title="Refresh records"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-2.5 rounded-xl transition text-xs border border-white/10 cursor-pointer"
          >
            <Plus size={14} /> Add Return
          </button>
          <button
            onClick={handleExportEcr}
            disabled={downloadingEcr}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md disabled:opacity-50"
          >
            <Download size={16} /> {downloadingEcr ? 'Exporting...' : 'Export ECR File (.txt)'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button onClick={fetchCompliance} className="font-bold underline cursor-pointer">
            Try Again
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Compliance Health Score</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {metrics ? `${metrics.scorePercent}% Compliant` : '100% Compliant'}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            {metrics?.pendingCount || 0} Pending Deadlines
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Form 16 Status</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {metrics?.form16Status || 'Generated (Part A & B)'}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">
            AY 2026-27 Ready
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Upcoming Deadline</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {metrics?.upcomingDeadline || '15th August'}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            PF & ESIC ECR Filing
          </span>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-2xl border border-hairline shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink">Statutory Filing Calendar & Returns</h3>
          <span className="text-xs text-muted font-medium">{items.length} Tracked Regulations</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-muted">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-cyan-600" />
            Loading compliance calendar...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash/80 border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Statutory Return</th>
                  <th className="p-3.5">Governing Authority</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Late Penalty Risk</th>
                  <th className="p-3.5">Filing Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-wash/30 transition">
                    <td className="p-3.5 font-semibold text-ink">
                      <div>{item.name}</div>
                      {item.acknowledgementNo && (
                        <span className="text-[10px] text-muted font-mono block mt-0.5">
                          Ack: {item.acknowledgementNo}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-muted font-medium">{item.authority}</td>
                    <td className="p-3.5 font-medium text-ink">{item.dueDate}</td>
                    <td className="p-3.5 text-rose-600 font-medium">{item.penaltyRisk}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'FILED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'UPCOMING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'FILED' ? (
                          <button
                            onClick={() => handleMarkFiled(item.id)}
                            className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer shadow-2xs transition"
                          >
                            Mark Filed
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Completed
                          </span>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded transition cursor-pointer"
                          title="Delete return"
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
                <ShieldCheck size={18} className="text-cyan-600" />
                Add Statutory Compliance Deadline
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Return / Obligation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GST GSTR-3B Monthly Return"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Governing Authority</label>
                <select
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="EPFO India">EPFO India</option>
                  <option value="ESIC Corporation">ESIC Corporation</option>
                  <option value="Income Tax Department">Income Tax Department</option>
                  <option value="State Tax Dept (Karnataka / MH)">State Tax Dept (Karnataka / MH)</option>
                  <option value="Labour Welfare Board">Labour Welfare Board</option>
                  <option value="Ministry of Corporate Affairs (MCA)">Ministry of Corporate Affairs (MCA)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Due Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20th August 2026"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Filing Period</label>
                  <input
                    type="text"
                    placeholder="e.g. July 2026"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Late Penalty / Interest Risk</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ₹50 / day late fine"
                  value={penaltyRisk}
                  onChange={(e) => setPenaltyRisk(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
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
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
