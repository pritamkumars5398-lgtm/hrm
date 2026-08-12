import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Plus, FileText, Upload, AlertCircle, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react'
import { expenseService, type ExpenseClaim } from '@/services/expenseService'

const CATEGORIES = ['Travel', 'Food', 'Fuel', 'Hotel', 'Client Dinner', 'Conference', 'Misc'] as const

const statusStyles: Record<string, string> = {
  PENDING:    'bg-amber-100 text-amber-800',
  APPROVED:   'bg-purple-100 text-purple-800',
  REJECTED:   'bg-rose-100 text-rose-800',
  REIMBURSED: 'bg-emerald-100 text-emerald-800',
}

const statusIcon: Record<string, React.ReactNode> = {
  PENDING:    <Clock size={11} className="inline mr-0.5" />,
  APPROVED:   <CheckCircle size={11} className="inline mr-0.5" />,
  REJECTED:   <XCircle size={11} className="inline mr-0.5" />,
  REIMBURSED: <CheckCircle size={11} className="inline mr-0.5" />,
}

export default function ExpensesPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // form state
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>('Travel')
  const [amount, setAmount] = useState('')
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await expenseService.list()
      setClaims(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load expense claims.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) return
    setSubmitting(true)
    setFormError(null)
    try {
      const newClaim = await expenseService.create({
        title,
        category,
        amount: parseFloat(amount),
        claimDate,
      })
      setClaims(prev => [newClaim, ...prev])
      setTitle('')
      setAmount('')
      setClaimDate(new Date().toISOString().split('T')[0])
      setCategory('Travel')
      setShowModal(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to submit claim.')
    } finally {
      setSubmitting(false)
    }
  }

  const totalPending    = claims.filter(c => c.status === 'PENDING').reduce((a, b) => a + b.amount, 0)
  const totalReimbursed = claims.filter(c => c.status === 'REIMBURSED').reduce((a, b) => a + b.amount, 0)
  const totalApproved   = claims.filter(c => c.status === 'APPROVED').reduce((a, b) => a + b.amount, 0)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white p-6 rounded-2xl border border-purple-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard size={14} /> Finance &amp; Expense Claims Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Expense Reimbursements</h1>
          <p className="text-slate-300 text-sm mt-1">Submit receipts, manage approvals, and track disbursal status.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> File New Claim
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Pending Approvals</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalPending.toLocaleString()}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            {claims.filter(c => c.status === 'PENDING').length} Claims Pending
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Reimbursed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalReimbursed.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Disbursed to Bank</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Approved Unpaid</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">₹{totalApproved.toLocaleString()}</p>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 inline-block">Queued for Next Payroll</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading expense claims…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No expense claims found. Click <strong>File New Claim</strong> to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Claim Description</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {claims.map(c => (
                  <tr key={c.id} className="hover:bg-wash/30 transition">
                    <td className="p-3 font-semibold text-ink">{c.title}</td>
                    <td className="p-3 text-muted">{c.category}</td>
                    <td className="p-3 font-medium text-ink">{c.employeeName ?? '—'}</td>
                    <td className="p-3 text-muted">{c.claimDate}</td>
                    <td className="p-3 font-bold text-ink">₹{c.amount.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[c.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {statusIcon[c.status]}{c.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted text-[11px]">
                      {c.status === 'REJECTED' && c.rejectionReason ? (
                        <span className="text-rose-600 font-medium">⚠ {c.rejectionReason}</span>
                      ) : c.receiptUrl ? (
                        <a href={c.receiptUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                          <FileText size={12} /> View Receipt
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">File Expense Reimbursement</h3>
            {formError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taxi Fare to Client Site"
                  value={title}
                  onChange={ev => setTitle(ev.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={ev => setCategory(ev.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={ev => setAmount(ev.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Claim Date</label>
                <input
                  type="date"
                  required
                  value={claimDate}
                  onChange={ev => setClaimDate(ev.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Upload Receipt (PDF/Image)</label>
                <div className="border-2 border-dashed border-hairline p-4 rounded-xl text-center text-muted hover:border-purple-500 transition cursor-pointer">
                  <Upload size={20} className="mx-auto mb-1 text-purple-500" />
                  <span className="font-semibold">Drag receipt here or click to browse</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-sm disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
