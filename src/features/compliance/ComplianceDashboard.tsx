import { useEffect, useState } from 'react'
import { ShieldCheck, AlertTriangle, Clock, CheckCircle, ArrowRight, Activity, FileText } from 'lucide-react'
import { complianceService } from './complianceService'
import type { ComplianceDashboardData } from './complianceService'

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    complianceService.getDashboard()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted text-xs animate-pulse">Loading compliance overview...</div>
  }

  const score = metrics?.healthScore ?? 100

  return (
    <div className="space-y-6">
      {/* Visual Health Score Indicator */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-indigo-950 text-white p-6 rounded-2xl border border-cyan-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Activity size={14} className="animate-pulse" /> Live Compliance Audit
          </div>
          <h2 className="text-2xl font-bold font-display">Statutory Compliance Overview</h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Real-time evaluation of EPF filings, document verification status, mandatory training courses, and employee attendance rules.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-4 rounded-xl border border-white/10 self-start md:self-auto">
          <div className="text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Health Score</span>
            <p className={`text-3xl font-extrabold font-display ${score >= 90 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>
              {score}%
            </p>
          </div>
          <div className="w-1.5 h-10 bg-white/20 rounded-full overflow-hidden">
            <div className="bg-emerald-400 w-full rounded-full" style={{ height: `${score}%` }}></div>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600 font-bold text-xs">
            <span>Compliant Requirements</span>
            <CheckCircle size={16} />
          </div>
          <p className="text-2xl font-bold text-ink">{metrics?.compliantCount ?? 0}</p>
          <p className="text-[10px] text-muted">All active obligations fully verified.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-600 font-bold text-xs">
            <span>Pending & Review</span>
            <Clock size={16} />
          </div>
          <p className="text-2xl font-bold text-ink">{metrics?.pendingCount ?? 0}</p>
          <p className="text-[10px] text-muted">Awaiting document uploads or audits.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-rose-600 font-bold text-xs">
            <span>Overdue / Expired</span>
            <AlertTriangle size={16} />
          </div>
          <p className="text-2xl font-bold text-rose-600">{metrics?.overdueCount ?? 0}</p>
          <p className="text-[10px] text-muted">Exceeded due dates or active expiry.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-hairline shadow-sm space-y-2">
          <div className="flex items-center justify-between text-cyan-600 font-bold text-xs">
            <span>Active Infractions</span>
            <ShieldCheck size={16} />
          </div>
          <p className="text-2xl font-bold text-ink">{metrics?.activeViolations ?? 0}</p>
          <p className="text-[10px] text-muted">Open violations requiring correction.</p>
        </div>
      </div>

      {/* Obligations & Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-hairline shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-sm text-ink">Active Obligations Monitor</h3>
          {metrics?.obligations.length === 0 ? (
            <div className="p-6 text-center text-muted text-xs">No active compliance obligations registered.</div>
          ) : (
            <div className="divide-y divide-hairline">
              {metrics?.obligations.slice(0, 5).map(obl => (
                <div key={obl.id} className="py-3 flex items-center justify-between text-xs hover:bg-wash/20 px-2 rounded-xl transition">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-ink">Obligation {obl.id}</p>
                    <p className="text-muted text-[10px]">Due Date: {obl.dueDate || 'No Deadline'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      obl.status === 'COMPLIANT' || obl.status === 'WAIVED' ? 'bg-emerald-100 text-emerald-800' :
                      obl.status === 'PENDING' || obl.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {obl.status}
                    </span>
                    <span className="text-[10px] text-muted font-bold">{obl.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-hairline shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-sm text-ink">Compliance Quick Actions</h3>
          <div className="flex flex-col gap-2">
            <button className="flex items-center justify-between p-3 rounded-xl border border-hairline hover:border-cyan-500 hover:bg-cyan-50/20 transition cursor-pointer text-left text-xs text-ink font-semibold">
              <span className="flex items-center gap-2"><FileText size={14} className="text-cyan-600" /> View Frameworks</span>
              <ArrowRight size={14} className="text-muted" />
            </button>
            <button className="flex items-center justify-between p-3 rounded-xl border border-hairline hover:border-cyan-500 hover:bg-cyan-50/20 transition cursor-pointer text-left text-xs text-ink font-semibold">
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-cyan-600" /> Run Audit Scan</span>
              <ArrowRight size={14} className="text-muted" />
            </button>
            <button className="flex items-center justify-between p-3 rounded-xl border border-hairline hover:border-cyan-500 hover:bg-cyan-50/20 transition cursor-pointer text-left text-xs text-ink font-semibold">
              <span className="flex items-center gap-2"><AlertTriangle size={14} className="text-rose-600" /> Active Violations</span>
              <ArrowRight size={14} className="text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
