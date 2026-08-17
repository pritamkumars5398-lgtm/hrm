import { useEffect, useState } from 'react'
import { ShieldAlert, CheckCircle, Search, Edit2, AlertOctagon } from 'lucide-react'
import { complianceService } from './complianceService'
import type { ComplianceViolation } from './complianceService'

export default function ViolationsTracker() {
  const [violations, setViolations] = useState<ComplianceViolation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingViolation, setEditingViolation] = useState<ComplianceViolation | null>(null)
  const [correctiveAction, setCorrectiveAction] = useState('')
  const [status, setStatus] = useState<'OPEN' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'>('OPEN')

  const fetchViolations = () => {
    setLoading(true)
    complianceService.getViolations()
      .then(setViolations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchViolations()
  }, [])

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingViolation) return

    complianceService.updateViolation(editingViolation.id, {
      correctiveAction,
      status,
    })
      .then(() => {
        setEditingViolation(null)
        setCorrectiveAction('')
        fetchViolations()
      })
      .catch(console.error)
  }

  if (loading && violations.length === 0) {
    return <div className="p-8 text-center text-muted text-xs animate-pulse">Loading compliance violations...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-ink">Active Infractions & Violations Logs</h3>
      </div>

      <div className="bg-white rounded-2xl border border-hairline shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Detected Date</th>
                <th className="p-3">Violation Code/Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {violations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted text-xs">
                    No compliance violations detected. Your organization is 100% compliant!
                  </td>
                </tr>
              ) : (
                violations.map(vio => (
                  <tr key={vio.id} className="hover:bg-wash/30 transition">
                    <td className="p-3 font-medium text-ink whitespace-nowrap">{vio.detectedDate}</td>
                    <td className="p-3 font-bold text-ink whitespace-nowrap">{vio.type}</td>
                    <td className="p-3 text-muted max-w-xs truncate">{vio.description}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        vio.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        vio.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {vio.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        vio.status === 'RESOLVED' || vio.status === 'CLOSED' ? 'bg-emerald-100 text-emerald-800' :
                        vio.status === 'INVESTIGATING' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {vio.status}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {vio.status !== 'RESOLVED' && vio.status !== 'CLOSED' && (
                        <button
                          onClick={() => {
                            setEditingViolation(vio)
                            setCorrectiveAction(vio.correctiveAction || '')
                            setStatus(vio.status)
                          }}
                          className="flex items-center gap-1.5 ml-auto px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer shadow-xs transition"
                        >
                          <Edit2 size={10} /> Update Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingViolation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold font-display text-ink border-b border-hairline pb-3 flex items-center gap-2">
              <AlertOctagon className="text-rose-600 animate-pulse" size={18} /> Update Violation Case
            </h3>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink">Violation Type</label>
              <p className="text-xs text-ink font-semibold bg-wash p-2 rounded-lg border border-hairline">{editingViolation.type}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none bg-white"
              >
                <option value="OPEN">Open</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="ACTION_REQUIRED">Action Required</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed / Archived</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink">Corrective Action Taken</label>
              <textarea
                placeholder="Describe action plan or resolution..."
                value={correctiveAction}
                onChange={e => setCorrectiveAction(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none resize-none"
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setEditingViolation(null)}
                className="px-4 py-2 border border-hairline rounded-xl text-xs font-bold text-muted hover:bg-wash transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
