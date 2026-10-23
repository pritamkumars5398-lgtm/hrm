import { useState } from 'react'
import { Timer, Calendar, CheckCircle, Clock, Plus, Filter, Save, Send, ShieldAlert } from 'lucide-react'

type TimeRow = {
  id: string
  client: string
  project: string
  task: string
  hours: number[] // 7 days Mon-Sun
  isBillable: boolean
}

const INITIAL_ROWS: TimeRow[] = [
  { id: 'row-1', client: 'Acme Corp', project: 'Enterprise Portal', task: 'Frontend Dashboard Development', hours: [8, 8, 8, 7.5, 8, 0, 0], isBillable: true },
  { id: 'row-2', client: 'Internal', project: 'HRMS SaaS Integration', task: 'Prisma Schema & API Wiring', hours: [0, 0, 0, 1, 0, 0, 0], isBillable: false },
]

export default function TimesheetsPage() {
  const [rows, setRows] = useState<TimeRow[]>(INITIAL_ROWS)
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'APPROVED'>('DRAFT')

  const days = ['Mon (Aug 3)', 'Tue (Aug 4)', 'Wed (Aug 5)', 'Thu (Aug 6)', 'Fri (Aug 7)', 'Sat (Aug 8)', 'Sun (Aug 9)']

  const handleHourChange = (rowId: string, dayIdx: number, val: number) => {
    setRows(prev => prev.map(r => {
      if (r.id === rowId) {
        const newH = [...r.hours]
        newH[dayIdx] = Math.max(0, Math.min(24, val))
        return { ...r, hours: newH }
      }
      return r
    }))
  }

  const handleAddRow = () => {
    const newRow: TimeRow = {
      id: `row-${Date.now()}`,
      client: 'Client Demo',
      project: 'New Project',
      task: 'Task Description',
      hours: [0, 0, 0, 0, 0, 0, 0],
      isBillable: true
    }
    setRows([...rows, newRow])
  }

  const calculateTotal = (row: TimeRow) => row.hours.reduce((a, b) => a + b, 0)
  const grandTotal = rows.reduce((acc, r) => acc + calculateTotal(r), 0)
  const billableTotal = rows.filter(r => r.isBillable).reduce((acc, r) => acc + calculateTotal(r), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Timer size={14} /> Time & Productivity Suite
          </div>
          <h1 className="text-2xl font-bold font-display">Weekly Timesheet & Project Hours</h1>
          <p className="text-slate-300 text-sm mt-1">Log billable client hours, project tasks, and manager approval cycles.</p>
        </div>
        <div className="flex items-center gap-2">
          {status === 'DRAFT' && (
            <button
              onClick={() => setStatus('SUBMITTED')}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
            >
              <Send size={15} /> Submit for Approval
            </button>
          )}
          {status === 'SUBMITTED' && (
            <button
              onClick={() => setStatus('APPROVED')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
            >
              <CheckCircle size={15} /> Manager Approve
            </button>
          )}
          {status === 'APPROVED' && (
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl font-bold text-xs border border-emerald-500/30">
              <CheckCircle size={14} /> Approved & Locked
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Weekly Hours</span>
          <p className="text-2xl font-bold text-ink mt-1">{grandTotal} hrs</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Target: 40 hrs</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Billable Hours</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{billableTotal} hrs</p>
          <span className="text-[11px] text-muted mt-1 inline-block">
            {grandTotal > 0 ? Math.round((billableTotal / grandTotal) * 100) : 0}% Billable Utilization
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Timesheet Status</span>
          <p className={`text-2xl font-bold mt-1 ${
            status === 'APPROVED' ? 'text-emerald-600' : status === 'SUBMITTED' ? 'text-amber-600' : 'text-slate-700'
          }`}>
            {status}
          </p>
          <span className="text-[11px] text-muted mt-1 inline-block">Week of Aug 3 - Aug 9</span>
        </div>
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
            <tr>
              <th className="p-3">Client / Project</th>
              <th className="p-3">Task Description</th>
              <th className="p-3">Billable</th>
              {days.map((d, i) => (
                <th key={i} className="p-3 text-center min-w-[60px]">{d}</th>
              ))}
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-wash/30 transition">
                <td className="p-3 font-semibold text-ink">
                  <div>{row.client}</div>
                  <div className="text-[10px] text-muted font-normal">{row.project}</div>
                </td>
                <td className="p-3 text-muted">{row.task}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    row.isBillable ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {row.isBillable ? 'Billable' : 'Non-Billable'}
                  </span>
                </td>
                {row.hours.map((h, dayIdx) => (
                  <td key={dayIdx} className="p-2 text-center">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      disabled={status === 'APPROVED'}
                      value={h}
                      onChange={(e) => handleHourChange(row.id, dayIdx, parseFloat(e.target.value) || 0)}
                      className="w-12 text-center py-1 rounded border border-hairline text-xs font-semibold focus:border-indigo-500 focus:outline-none bg-wash/40 disabled:bg-slate-100"
                    />
                  </td>
                ))}
                <td className="p-3 text-right font-bold text-ink">{calculateTotal(row)} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-wash/50 border-t border-hairline flex items-center justify-between">
          <button
            onClick={handleAddRow}
            disabled={status === 'APPROVED'}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer disabled:opacity-50"
          >
            <Plus size={14} /> Add Time Row
          </button>

          <div className="text-xs font-bold text-ink">
            Grand Total: <span className="text-indigo-600 text-sm ml-1">{grandTotal} Hours</span>
          </div>
        </div>
      </div>
    </div>
  )
}
