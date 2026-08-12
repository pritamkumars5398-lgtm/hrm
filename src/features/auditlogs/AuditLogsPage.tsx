import { useState, useEffect, useCallback } from 'react'
import { ShieldAlert, Search, RefreshCw, AlertCircle, Filter, CheckCircle, XCircle, Download } from 'lucide-react'
import { auditLogsService, type AuditLogEntry } from '@/services/auditLogsService'

const RESOURCES = ['', 'employees', 'leave', 'expenses', 'travel', 'helpdesk', 'approvals', 'forms', 'payroll', 'documents', 'attendance']

function ResultBadge({ result }: { result: 'ALLOW' | 'DENY' }) {
  return result === 'ALLOW' ? (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
      <CheckCircle size={9} /> ALLOW
    </span>
  ) : (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
      <XCircle size={9} /> DENY
    </span>
  )
}

function exportCsv(logs: AuditLogEntry[]) {
  const header = 'ID,User Email,Action,Resource,Resource ID,Result,Timestamp'
  const rows = logs.map(l =>
    [l.id, l.userEmail, l.action, l.resource, l.resourceId ?? '', l.result, l.timestamp].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [resource, setResource] = useState('')
  const [result, setResult] = useState<'ALLOW' | 'DENY' | ''>('')
  const [userEmail, setUserEmail] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditLogsService.list({
        resource: resource || undefined,
        result: result || undefined,
        userEmail: userEmail || undefined,
        from: from || undefined,
        to: to || undefined,
        limit: 200,
      })
      setLogs(data.logs)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }, [resource, result, userEmail, from, to])

  useEffect(() => { load() }, [load])

  const filtered = logs.filter(l =>
    !search ||
    l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.resource.toLowerCase().includes(search.toLowerCase()) ||
    (l.resourceId ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const allows = filtered.filter(l => l.result === 'ALLOW').length
  const denies = filtered.filter(l => l.result === 'DENY').length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl border border-slate-600/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert size={14} /> System Integrity &amp; Compliance
          </div>
          <h1 className="text-2xl font-bold font-display">Audit Logs</h1>
          <p className="text-slate-300 text-sm mt-1">
            Immutable record of every action — who did what, when, and the outcome. 
            Read-only. Cannot be deleted or modified via any interface.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportCsv(filtered)}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer text-xs border border-slate-500"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-3 py-2 rounded-xl transition cursor-pointer text-xs border border-slate-500"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Entries</span>
          <p className="text-2xl font-bold text-ink mt-1">{filtered.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">In current view</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Allowed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{allows}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Successful actions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Denied</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{denies}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">Permission failures</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Unique Actors</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">
            {new Set(filtered.map(l => l.userEmail)).size}
          </p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">Distinct users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-muted uppercase">
          <Filter size={13} /> Filters
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="relative col-span-2 sm:col-span-1">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search actions, emails…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-hairline focus:border-slate-500 focus:outline-none bg-wash/30"
            />
          </div>
          <select value={resource} onChange={e => setResource(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-hairline focus:border-slate-500 focus:outline-none bg-wash/30 capitalize">
            <option value="">All Resources</option>
            {RESOURCES.filter(Boolean).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
          </select>
          <select value={result} onChange={e => setResult(e.target.value as 'ALLOW' | 'DENY' | '')}
            className="px-3 py-1.5 rounded-lg border border-hairline focus:border-slate-500 focus:outline-none bg-wash/30">
            <option value="">All Results</option>
            <option value="ALLOW">ALLOW</option>
            <option value="DENY">DENY</option>
          </select>
          <input
            type="text"
            placeholder="Filter by email"
            value={userEmail}
            onChange={e => setUserEmail(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-hairline focus:border-slate-500 focus:outline-none bg-wash/30"
          />
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-hairline focus:border-slate-500 focus:outline-none bg-wash/30"
            title="From date"
          />
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-hairline focus:border-slate-500 focus:outline-none bg-wash/30"
            title="To date"
          />
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading audit logs…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            {logs.length === 0
              ? 'No audit logs found. Actions across all modules are recorded automatically.'
              : 'No logs match the current filters.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor (Email)</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Resource</th>
                  <th className="p-3">Resource ID</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline font-mono">
                {filtered.map(log => (
                  <tr key={log.id} className={`hover:bg-wash/30 transition ${log.result === 'DENY' ? 'bg-rose-50/40' : ''}`}>
                    <td className="p-3 text-muted text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-semibold text-ink text-[11px]">{log.userEmail}</td>
                    <td className="p-3 text-indigo-700 font-bold text-[11px] uppercase">{log.action}</td>
                    <td className="p-3 text-slate-600 capitalize text-[11px]">{log.resource}</td>
                    <td className="p-3 text-muted text-[10px]">{log.resourceId ?? '—'}</td>
                    <td className="p-3">
                      <ResultBadge result={log.result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
