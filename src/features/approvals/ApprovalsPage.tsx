import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, ChevronRight } from 'lucide-react'
import { approvalsService, type ApprovalRequest } from '@/services/approvalsService'

const moduleColor: Record<string, string> = {
  Leave:     'bg-blue-100 text-blue-800',
  Expense:   'bg-purple-100 text-purple-800',
  Travel:    'bg-indigo-100 text-indigo-800',
  Forms:     'bg-cyan-100 text-cyan-800',
  Documents: 'bg-emerald-100 text-emerald-800',
}

const moduleIcon: Record<string, string> = {
  Leave:     '🏖️',
  Expense:   '💳',
  Travel:    '✈️',
  Forms:     '📋',
  Documents: '📁',
  Default:   '📌',
}

export default function ApprovalsPage() {
  const [approvals, setApprovals]     = useState<ApprovalRequest[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState<string | null>(null)
  const [deciding, setDeciding]       = useState<string | null>(null)  // id being decided

  // reject modal
  const [rejectId, setRejectId]       = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      setApprovals(await approvalsService.listPending())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load pending approvals.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleApprove = async (id: string) => {
    setDeciding(id)
    try {
      const updated = await approvalsService.decide(id, { status: 'APPROVED' })
      setApprovals(prev => prev.filter(a => a.id !== updated.id))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to approve.')
    } finally {
      setDeciding(null)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectId || !rejectReason.trim()) return
    setDeciding(rejectId)
    try {
      const updated = await approvalsService.decide(rejectId, { status: 'REJECTED', rejectionReason: rejectReason })
      setApprovals(prev => prev.filter(a => a.id !== updated.id))
      setRejectId(null); setRejectReason('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to reject.')
    } finally {
      setDeciding(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-teal-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> Centralized Approval Hub
          </div>
          <h1 className="text-2xl font-bold font-display">Pending Approvals</h1>
          <p className="text-slate-300 text-sm mt-1">
            One place for all pending requests — Leave, Expenses, Travel, Forms, and more.
            Decisions here instantly update the originating module.
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Pending</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{approvals.length}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Across all modules</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Modules with Pending</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {new Set(approvals.map(a => a.sourceModule)).size}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">Different request types</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Status</span>
          <p className="text-2xl font-bold text-teal-600 mt-1">
            {loading ? '…' : approvals.length === 0 ? '✓' : '⏳'}
          </p>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 inline-block">
            {approvals.length === 0 ? 'All caught up!' : 'Action required'}
          </span>
        </div>
      </div>

      {/* Approvals List */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading pending approvals…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : approvals.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
            <p className="text-ink font-bold text-base">All caught up!</p>
            <p className="text-muted text-sm mt-1">No pending approvals at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approvals.map(a => (
              <div key={a.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-xl border border-hairline hover:border-teal-200 hover:bg-teal-50/30 transition group"
              >
                {/* Module badge */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${moduleColor[a.sourceModule] ?? 'bg-slate-100 text-slate-700'}`}>
                    {moduleIcon[a.sourceModule] ?? moduleIcon.Default}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${moduleColor[a.sourceModule] ?? 'bg-slate-100 text-slate-700'}`}>
                      {a.sourceModule}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <Clock size={10} /> PENDING
                    </span>
                  </div>
                  <p className="font-semibold text-sm text-ink mt-1 truncate">{a.title}</p>
                  {a.summary && (
                    <p className="text-xs text-muted mt-0.5 truncate">{a.summary}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted">
                    {a.requestedBy && <span>Requested by <strong className="text-ink">{a.requestedBy}</strong></span>}
                    <ChevronRight size={11} />
                    <span>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <button
                    disabled={deciding === a.id}
                    onClick={() => handleApprove(a.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    <CheckCircle size={12} />
                    {deciding === a.id ? 'Processing…' : 'Approve'}
                  </button>
                  <button
                    disabled={deciding === a.id}
                    onClick={() => { setRejectId(a.id); setRejectReason('') }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[11px] font-bold hover:bg-rose-200 transition disabled:opacity-50"
                  >
                    <XCircle size={12} />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-1">Reject Request</h3>
            <p className="text-xs text-muted mb-4">Provide a clear reason — it will be sent as a notification to the requestor.</p>
            <form onSubmit={handleReject} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Rejection Reason</label>
                <textarea required rows={3} placeholder="e.g. Insufficient budget this quarter."
                  value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRejectId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold">Cancel</button>
                <button type="submit" disabled={deciding === rejectId}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm disabled:opacity-60">
                  {deciding === rejectId ? 'Processing…' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
