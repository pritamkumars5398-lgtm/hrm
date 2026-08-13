import { useState, useEffect, useCallback } from 'react'
import {
  CreditCard, Plus, FileText, Upload, AlertCircle, Loader2,
  CheckCircle, Clock, XCircle, Banknote, X
} from 'lucide-react'
import { expenseService, type ExpenseClaim } from '@/services/expenseService'
import { useAuthStore } from '@/features/auth/store/authStore'

const CATEGORIES = [
  'Travel', 'Food', 'Fuel', 'Hotel', 'Client Dinner', 'Conference',
  'Office Supplies', 'Internet', 'Communication', 'Medical', 'Training', 'Equipment', 'Miscellaneous'
] as const

const STATUS_META: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
  PENDING:    { label: 'Pending Review',  cls: 'bg-amber-100 text-amber-800',     Icon: Clock },
  APPROVED:   { label: 'Approved (Unpaid)', cls: 'bg-purple-100 text-purple-800',  Icon: CheckCircle },
  REJECTED:   { label: 'Rejected',          cls: 'bg-rose-100 text-rose-800',       Icon: XCircle },
  REIMBURSED: { label: 'Reimbursed (Paid)', cls: 'bg-emerald-100 text-emerald-800', Icon: Banknote },
}

function canManage(permissions: string[]) {
  return permissions.includes('*') || permissions.includes('expenses.manage') || permissions.includes('reports.view')
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, cls: 'bg-slate-100 text-slate-700', Icon: Clock }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${m.cls}`}>
      <m.Icon size={10} /> {m.label}
    </span>
  )
}

function ClaimsTable({
  claims,
  onReimburse,
  isManager,
}: {
  claims: ExpenseClaim[]
  onReimburse?: (id: string) => void
  isManager: boolean
}) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-14 text-muted text-sm">
        <CreditCard size={32} className="mx-auto text-slate-300 mb-2" />
        <p className="font-bold text-ink">No expense claims found</p>
        <p className="text-xs mt-1">Click <strong>File New Claim</strong> to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-wash border-b border-hairline text-muted font-bold uppercase text-[10px]">
          <tr>
            <th className="p-3">Claim</th>
            <th className="p-3">Category</th>
            {isManager && <th className="p-3">Employee</th>}
            <th className="p-3">Date</th>
            <th className="p-3">Claimed</th>
            <th className="p-3">Approved</th>
            <th className="p-3">Reimbursed</th>
            <th className="p-3">Status</th>
            <th className="p-3">Notes</th>
            {isManager && <th className="p-3 text-right">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {claims.map(c => (
            <tr key={c.id} className="hover:bg-wash/30 transition">
              <td className="p-3 font-semibold text-ink">{c.title}</td>
              <td className="p-3 text-muted">{c.category}</td>
              {isManager && <td className="p-3 font-medium text-ink">{c.employeeName ?? '—'}</td>}
              <td className="p-3 text-muted font-mono">{c.claimDate}</td>
              <td className="p-3 font-bold text-ink">₹{c.amount.toLocaleString()}</td>
              <td className="p-3 font-semibold text-purple-700">
                {c.approvedAmount != null ? `₹${c.approvedAmount.toLocaleString()}` : '—'}
              </td>
              <td className="p-3 font-bold text-emerald-700">
                {c.reimbursedAmount != null ? `₹${c.reimbursedAmount.toLocaleString()}` : '—'}
              </td>
              <td className="p-3"><StatusBadge status={c.status} /></td>
              <td className="p-3 text-muted text-[11px]">
                {c.status === 'REJECTED' && c.rejectionReason ? (
                  <span className="text-rose-600 font-medium">⚠ {c.rejectionReason}</span>
                ) : c.receiptUrl ? (
                  <a href={c.receiptUrl} target="_blank" rel="noreferrer"
                    className="text-indigo-600 hover:underline flex items-center gap-1">
                    <FileText size={12} /> Receipt
                  </a>
                ) : '—'}
              </td>
              {isManager && (
                <td className="p-3 text-right">
                  {c.status === 'APPROVED' && onReimburse && (
                    <button
                      onClick={() => onReimburse(c.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold cursor-pointer transition ml-auto"
                    >
                      <Banknote size={11} /> Reimburse Payout
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ExpensesPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user ? canManage(user.permissions) : false

  const [tab, setTab] = useState<'mine' | 'all'>('mine')
  const [claims, setClaims]       = useState<ExpenseClaim[]>([])
  const [allClaims, setAllClaims] = useState<ExpenseClaim[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [reimbursing, setReimbursing] = useState<string | null>(null)

  // form
  const [title, setTitle]         = useState('')
  const [category, setCategory]   = useState<string>('Travel')
  const [amount, setAmount]       = useState('')
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0])

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const [mine, all] = await Promise.all([
        expenseService.list(),
        isManager ? expenseService.listAll() : Promise.resolve([]),
      ])
      setClaims(mine)
      setAllClaims(all)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load expense claims.')
    } finally {
      setLoading(false)
    }
  }, [isManager])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) return
    setSubmitting(true); setFormError(null)
    try {
      const newClaim = await expenseService.create({ title, category, amount: parseFloat(amount), claimDate })
      setClaims(prev => [newClaim, ...prev])
      setTitle(''); setAmount(''); setClaimDate(new Date().toISOString().split('T')[0]); setCategory('Travel')
      setShowModal(false)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to submit claim.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReimburse = async (id: string) => {
    if (!confirm('Process reimbursement payment for this approved claim? This action will mark it as PAID/REIMBURSED.')) return
    setReimbursing(id)
    try {
      const updated = await expenseService.reimburse(id)
      setAllClaims(prev => prev.map(c => c.id === id ? updated : c))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Reimbursement failed.')
    } finally {
      setReimbursing(null)
    }
  }

  // metrics from own claims
  const totalPending    = claims.filter(c => c.status === 'PENDING').reduce((a, b) => a + b.amount, 0)
  const totalReimbursed = claims.filter(c => c.status === 'REIMBURSED').reduce((a, b) => a + (b.reimbursedAmount ?? b.amount), 0)
  const totalApproved   = claims.filter(c => c.status === 'APPROVED').reduce((a, b) => a + (b.approvedAmount ?? b.amount), 0)

  const pendingReimburse = allClaims.filter(c => c.status === 'APPROVED').reduce((a, b) => a + (b.approvedAmount ?? b.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white p-6 rounded-2xl border border-purple-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard size={14} /> Finance &amp; Expense Claims Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Expense Reimbursements</h1>
          <p className="text-slate-300 text-sm mt-1">Submit receipts, manage manager approvals, and execute separate finance payouts.</p>
        </div>
        <div className="flex items-center gap-3">
          {isManager && (
            <div className="flex bg-slate-800/60 p-1 rounded-xl border border-purple-500/20">
              <button onClick={() => setTab('mine')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${tab === 'mine' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                My Claims
              </button>
              <button onClick={() => setTab('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${tab === 'all' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                All Claims
              </button>
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
          >
            <Plus size={16} /> File New Claim
          </button>
        </div>
      </div>

      {/* Metrics */}
      {tab === 'mine' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Pending Approvals', value: `₹${totalPending.toLocaleString()}`, sub: `${claims.filter(c => c.status === 'PENDING').length} claims pending`, color: 'text-amber-600' },
            { label: 'Approved Unpaid',   value: `₹${totalApproved.toLocaleString()}`, sub: 'Approved, awaiting reimbursement', color: 'text-purple-600' },
            { label: 'Total Reimbursed',  value: `₹${totalReimbursed.toLocaleString()}`, sub: 'Disbursed payout', color: 'text-emerald-600' },
          ].map(m => (
            <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
              <span className="text-muted text-xs font-medium">{m.label}</span>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              <span className={`text-[11px] font-semibold mt-1 inline-block ${m.color}`}>{m.sub}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'all' && isManager && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Claims',    value: allClaims.length,                                              color: 'text-ink' },
            { label: 'Pending Review',  value: allClaims.filter(c => c.status === 'PENDING').length,          color: 'text-amber-600' },
            { label: 'Awaiting Payout', value: allClaims.filter(c => c.status === 'APPROVED').length,         color: 'text-purple-600' },
            { label: 'Payout Due (₹)',  value: `₹${pendingReimburse.toLocaleString()}`,                       color: 'text-emerald-600' },
          ].map(m => (
            <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
              <span className="text-muted text-xs font-medium">{m.label}</span>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Claims table */}
      <div className="bg-white rounded-2xl border border-hairline shadow-2xs p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted text-sm">
            <Loader2 size={18} className="animate-spin text-purple-500" /> Loading expense claims…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : tab === 'mine' ? (
          <ClaimsTable claims={claims} isManager={false} />
        ) : (
          <ClaimsTable
            claims={allClaims}
            isManager={true}
            onReimburse={reimbursing ? undefined : handleReimburse}
          />
        )}
      </div>

      {/* File Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">File Expense Reimbursement</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-wash cursor-pointer"><X size={16} /></button>
            </div>
            {formError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Expense Title *</label>
                <input required placeholder="e.g. Taxi Fare to Client Site" value={title}
                  onChange={ev => setTitle(ev.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <select value={category} onChange={ev => setCategory(ev.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-400 focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Amount (₹) *</label>
                  <input required type="number" min="0.01" step="0.01" placeholder="e.g. 1500" value={amount}
                    onChange={ev => setAmount(ev.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Claim Date *</label>
                <input required type="date" value={claimDate}
                  onChange={ev => setClaimDate(ev.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Upload Receipt <span className="font-normal">(coming soon)</span></label>
                <div className="border-2 border-dashed border-hairline p-4 rounded-xl text-center text-muted opacity-50">
                  <Upload size={20} className="mx-auto mb-1 text-purple-400" />
                  <span className="font-semibold text-xs">Drag receipt here or click to browse</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-sm disabled:opacity-60 cursor-pointer">
                  {submitting ? <><Loader2 size={13} className="animate-spin inline mr-1" />Submitting…</> : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
