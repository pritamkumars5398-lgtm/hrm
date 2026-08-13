import { useState, useEffect, useCallback } from 'react'
import {
  Timer, ChevronLeft, ChevronRight, CheckCircle, Save, Send,
  Plus, Trash2, Loader2, AlertCircle, ShieldAlert, XCircle,
  Users, Clock, TrendingUp, BarChart2
} from 'lucide-react'
import { timesheetService, type Timesheet, type TimeRow } from '@/services/timesheetService'
import { useAuthStore } from '@/features/auth/store/authStore'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Returns the Monday of the week containing `date`. */
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day  // Sun → go back 6, else go to Mon
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function weekLabel(monday: Date): string {
  const sunday = addDays(monday, 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

function newRow(): TimeRow {
  return {
    id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    client: '',
    project: '',
    task: '',
    hours: [0, 0, 0, 0, 0, 0, 0],
    isBillable: true,
  }
}

function canManage(permissions: string[]): boolean {
  return (
    permissions.includes('*') ||
    permissions.includes('timesheets.manage') ||
    permissions.includes('reports.view')
  )
}

// ─── status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Timesheet['status'] }) {
  const map: Record<Timesheet['status'], { label: string; cls: string }> = {
    DRAFT:     { label: 'Draft',     cls: 'bg-slate-100 text-slate-700' },
    SUBMITTED: { label: 'Submitted', cls: 'bg-amber-100  text-amber-800' },
    APPROVED:  { label: 'Approved',  cls: 'bg-emerald-100 text-emerald-800' },
    REJECTED:  { label: 'Rejected',  cls: 'bg-rose-100   text-rose-800' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${cls}`}>
      {label.toUpperCase()}
    </span>
  )
}

// ─── manager panel ───────────────────────────────────────────────────────────

function ManagerPanel() {
  const [sheets, setSheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deciding, setDeciding] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await timesheetService.listAllTimesheets()
      setSheets(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load timesheets.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const decide = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setDeciding(id)
    try {
      await timesheetService.updateStatus(id, status)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Action failed.')
    } finally {
      setDeciding(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={28} className="animate-spin text-indigo-500" />
    </div>
  )

  if (error) return (
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-2">
      <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
    </div>
  )

  const pending = sheets.filter(s => s.status === 'SUBMITTED')
  const rest    = sheets.filter(s => s.status !== 'SUBMITTED')

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Submitted', value: sheets.filter(s => s.status === 'SUBMITTED').length, color: 'text-amber-600' },
          { label: 'Total Approved',  value: sheets.filter(s => s.status === 'APPROVED').length,  color: 'text-emerald-600' },
          { label: 'Total Rejected',  value: sheets.filter(s => s.status === 'REJECTED').length,  color: 'text-rose-600' },
          { label: 'Total Hours (Approved)', value: sheets.filter(s => s.status === 'APPROVED').reduce((a, s) => a + s.totalHours, 0), color: 'text-indigo-600' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
            <span className="text-muted text-xs font-medium block">{m.label}</span>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Pending approval */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} className="text-amber-500" /> Awaiting Approval ({pending.length})
          </h3>
          {pending.map((ts) => (
            <div key={ts.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-ink">{ts.employeeName}</p>
                <p className="text-xs text-muted">Week of {ts.weekStartDate} · <span className="font-semibold text-ink">{ts.totalHours} hrs</span></p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decide(ts.id, 'REJECTED')}
                  disabled={deciding === ts.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold cursor-pointer disabled:opacity-50 transition"
                >
                  {deciding === ts.id ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={13} />}
                  Reject
                </button>
                <button
                  onClick={() => decide(ts.id, 'APPROVED')}
                  disabled={deciding === ts.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition"
                >
                  {deciding === ts.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={13} />}
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historical */}
      {rest.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 size={13} className="text-slate-400" /> All Timesheets
          </h3>
          <div className="bg-white rounded-xl border border-hairline overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-wash text-muted font-bold uppercase text-[10px] border-b border-hairline">
                <tr>
                  <th className="p-3 text-left">Employee</th>
                  <th className="p-3 text-left">Week Of</th>
                  <th className="p-3 text-right">Hours</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {rest.map((ts) => (
                  <tr key={ts.id} className="hover:bg-wash/40 transition">
                    <td className="p-3 font-semibold text-ink">{ts.employeeName}</td>
                    <td className="p-3 text-muted font-mono">{ts.weekStartDate}</td>
                    <td className="p-3 text-right font-bold text-ink">{ts.totalHours}</td>
                    <td className="p-3 text-center"><StatusBadge status={ts.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sheets.length === 0 && (
        <div className="text-center py-16 text-muted text-xs space-y-1">
          <Users size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-ink">No timesheets found</p>
          <p>Once employees submit timesheets they will appear here.</p>
        </div>
      )}
    </div>
  )
}

// ─── employee sheet editor ────────────────────────────────────────────────────

export default function TimesheetsPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user ? canManage(user.permissions) : false

  // Week navigation
  const [monday, setMonday] = useState<Date>(() => getMondayOf(new Date()))

  // Timesheet state
  const [rows, setRows]             = useState<TimeRow[]>([])
  const [status, setStatus]         = useState<Timesheet['status']>('DRAFT')
  const [timesheetId, setTimesheetId] = useState('')
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [saving, setSaving]         = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Manager tab
  const [tab, setTab] = useState<'mine' | 'team'>('mine')

  const weekStartDate = toISO(monday)

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i)
    return `${DAY_SHORT[i]} ${d.getDate()}`
  })

  // ── load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await timesheetService.getTimesheet(weekStartDate)
      setTimesheetId(data.id)
      setStatus(data.status)
      setRows(data.rows.length > 0 ? data.rows : [])
      setTotalHours(data.totalHours)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load timesheet.')
    } finally {
      setLoading(false)
    }
  }, [weekStartDate])

  useEffect(() => { load() }, [load])

  // ── derived metrics ───────────────────────────────────────────────────────
  const calcRowTotal = (r: TimeRow) => r.hours.reduce((a, b) => a + b, 0)
  const grandTotal   = rows.reduce((acc, r) => acc + calcRowTotal(r), 0)
  const billableTotal = rows.filter(r => r.isBillable).reduce((acc, r) => acc + calcRowTotal(r), 0)
  const nonBillable   = grandTotal - billableTotal
  const locked        = status === 'APPROVED'
  const editable      = status === 'DRAFT' || status === 'REJECTED'

  // ── row mutations ─────────────────────────────────────────────────────────
  const setHour = (rowId: string, dayIdx: number, val: number) => {
    setRows(prev => prev.map(r =>
      r.id === rowId
        ? { ...r, hours: r.hours.map((h, i) => i === dayIdx ? Math.max(0, Math.min(24, val)) : h) }
        : r
    ))
  }

  const setField = (rowId: string, field: keyof TimeRow, val: string | boolean) => {
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: val } : r))
  }

  const addRow = () => setRows(prev => [...prev, newRow()])

  const removeRow = (rowId: string) => setRows(prev => prev.filter(r => r.id !== rowId))

  // ── save draft ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      const saved = await timesheetService.saveTimesheet({ weekStartDate, rows })
      setTimesheetId(saved.id)
      setStatus(saved.status)
      setTotalHours(saved.totalHours)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── submit for approval ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!confirm('Submit this timesheet for manager approval?')) return
    setSubmitting(true)
    try {
      const saved = await timesheetService.saveTimesheet({ weekStartDate, rows })
      const updated = await timesheetService.updateStatus(saved.id, 'SUBMITTED')
      setTimesheetId(updated.id)
      setStatus(updated.status)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── week navigation ───────────────────────────────────────────────────────
  const prevWeek = () => setMonday(d => addDays(d, -7))
  const nextWeek = () => setMonday(d => addDays(d, 7))

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Timer size={14} /> Time &amp; Productivity Suite
          </div>
          <h1 className="text-2xl font-bold font-display">Weekly Timesheets</h1>
          <p className="text-slate-300 text-sm mt-1">
            Log billable project hours, track daily allocations, and submit for manager approval.
          </p>
        </div>

        {/* Tab switch for managers */}
        {isManager && (
          <div className="flex bg-slate-800/60 p-1 rounded-xl border border-indigo-500/20 shrink-0">
            <button
              onClick={() => setTab('mine')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                tab === 'mine' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Sheet
            </button>
            <button
              onClick={() => setTab('team')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                tab === 'team' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Team Review
            </button>
          </div>
        )}
      </div>

      {/* ── TEAM TAB (manager) ── */}
      {tab === 'team' && isManager && <ManagerPanel />}

      {/* ── MY SHEET TAB ── */}
      {tab === 'mine' && (
        <>
          {/* Week nav + status row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-hairline shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                onClick={prevWeek}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-wash border border-hairline cursor-pointer disabled:opacity-40 transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-bold text-ink px-2">{weekLabel(monday)}</span>
              <button
                onClick={nextWeek}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-wash border border-hairline cursor-pointer disabled:opacity-40 transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={status} />

              {editable && rows.length > 0 && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold cursor-pointer disabled:opacity-50 transition"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={13} />}
                    Save Draft
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || rows.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50 transition shadow-sm"
                  >
                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Send size={13} />}
                    Submit
                  </button>
                </>
              )}

              {locked && (
                <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <CheckCircle size={14} /> Approved &amp; Locked
                </span>
              )}

              {status === 'SUBMITTED' && (
                <span className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
                  <Clock size={14} /> Awaiting approval
                </span>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Hours',   value: `${grandTotal} hrs`,   sub: 'Target 40 hrs/week',       color: 'text-ink',         sub_color: grandTotal >= 40 ? 'text-emerald-600' : 'text-amber-600' },
              { label: 'Billable',      value: `${billableTotal} hrs`, sub: `${grandTotal > 0 ? Math.round(billableTotal / grandTotal * 100) : 0}% utilization`, color: 'text-indigo-600', sub_color: 'text-muted' },
              { label: 'Non-Billable',  value: `${nonBillable} hrs`,   sub: 'Internal / admin time',    color: 'text-slate-600',   sub_color: 'text-muted' },
              { label: 'Status',        value: status,                 sub: `Week of ${weekStartDate}`, color: status === 'APPROVED' ? 'text-emerald-600' : status === 'SUBMITTED' ? 'text-amber-600' : status === 'REJECTED' ? 'text-rose-600' : 'text-slate-700', sub_color: 'text-muted' },
            ].map((m) => (
              <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
                <span className="text-muted text-xs font-medium block">{m.label}</span>
                <p className={`text-xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                <span className={`text-[11px] font-semibold mt-0.5 inline-block ${m.sub_color}`}>{m.sub}</span>
              </div>
            ))}
          </div>

          {/* Rejection notice */}
          {status === 'REJECTED' && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Timesheet Rejected</p>
                <p className="mt-0.5">Your manager has rejected this timesheet. Please correct your entries and resubmit.</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-xl border border-hairline p-12 flex items-center justify-center">
              <Loader2 size={28} className="animate-spin text-indigo-500" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}

          {/* Grid */}
          {!loading && !error && (
            <div className="bg-white rounded-2xl border border-hairline shadow-2xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-wash border-b border-hairline text-muted font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 min-w-[120px]">Client</th>
                    <th className="p-3 min-w-[130px]">Project</th>
                    <th className="p-3 min-w-[160px]">Task</th>
                    <th className="p-3 text-center min-w-[68px]">Billable</th>
                    {dayLabels.map((d) => (
                      <th key={d} className="p-3 text-center min-w-[58px]">{d}</th>
                    ))}
                    <th className="p-3 text-right min-w-[58px]">Total</th>
                    {editable && <th className="p-3 w-8" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={editable ? 13 : 12} className="py-14 text-center">
                        <TrendingUp size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-ink text-sm">No time entries this week</p>
                        <p className="text-muted text-xs mt-1">Click "Add Row" below to start logging your hours.</p>
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => {
                    const rowTotal = calcRowTotal(row)
                    return (
                      <tr key={row.id} className="hover:bg-wash/30 transition group">
                        {/* Client */}
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Client name"
                            disabled={!editable}
                            value={row.client}
                            onChange={(e) => setField(row.id, 'client', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-hairline text-xs focus:border-indigo-400 focus:outline-none disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        {/* Project */}
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Project"
                            disabled={!editable}
                            value={row.project}
                            onChange={(e) => setField(row.id, 'project', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-hairline text-xs focus:border-indigo-400 focus:outline-none disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        {/* Task */}
                        <td className="p-2">
                          <input
                            type="text"
                            placeholder="Task description"
                            disabled={!editable}
                            value={row.task}
                            onChange={(e) => setField(row.id, 'task', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-hairline text-xs focus:border-indigo-400 focus:outline-none disabled:bg-transparent disabled:border-transparent"
                          />
                        </td>
                        {/* Billable toggle */}
                        <td className="p-2 text-center">
                          <button
                            disabled={!editable}
                            onClick={() => setField(row.id, 'isBillable', !row.isBillable)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer disabled:cursor-default transition ${
                              row.isBillable
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {row.isBillable ? 'Bill.' : 'Non-B.'}
                          </button>
                        </td>
                        {/* Hour cells */}
                        {row.hours.map((h, dayIdx) => (
                          <td key={dayIdx} className="p-1.5 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              disabled={!editable}
                              value={h === 0 ? '' : h}
                              placeholder="0"
                              onChange={(e) => setHour(row.id, dayIdx, parseFloat(e.target.value) || 0)}
                              className="w-11 text-center py-1 rounded-lg border border-hairline text-xs font-semibold focus:border-indigo-400 focus:outline-none disabled:bg-transparent disabled:border-transparent placeholder:text-slate-300"
                            />
                          </td>
                        ))}
                        {/* Row total */}
                        <td className="p-3 text-right font-bold text-ink whitespace-nowrap">
                          {rowTotal > 0 ? `${rowTotal}h` : <span className="text-slate-300">—</span>}
                        </td>
                        {/* Delete */}
                        {editable && (
                          <td className="p-2">
                            <button
                              onClick={() => removeRow(row.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-rose-400 hover:text-rose-600 cursor-pointer transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Footer */}
              <div className="p-3 bg-wash/50 border-t border-hairline flex items-center justify-between gap-4">
                {editable ? (
                  <button
                    onClick={addRow}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer transition"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                ) : (
                  <span />
                )}
                <div className="text-xs font-bold text-ink">
                  Grand Total:{' '}
                  <span className={`text-sm ml-1 ${grandTotal >= 40 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                    {grandTotal} hrs
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
