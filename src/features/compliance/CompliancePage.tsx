import { useState } from 'react'
import { ShieldCheck, Download, Calendar, CheckCircle, AlertTriangle, FileText, Building2 } from 'lucide-react'

type ComplianceItem = {
  id: string
  name: string
  dueDate: string
  authority: string
  status: 'FILED' | 'PENDING' | 'UPCOMING'
  penaltyRisk: string
}

const INITIAL_ITEMS: ComplianceItem[] = [
  { id: 'c-1', name: 'EPF Monthly Contribution Deposit & ECR Return', dueDate: '15th August 2026', authority: 'EPFO India', status: 'UPCOMING', penaltyRisk: '12% p.a. interest' },
  { id: 'c-2', name: 'ESIC Monthly Return & Payment', dueDate: '15th August 2026', authority: 'ESIC Corporation', status: 'UPCOMING', penaltyRisk: '₹500 / day penalty' },
  { id: 'c-3', name: 'TDS Payment Deposit (Section 192)', dueDate: '7th August 2026', authority: 'Income Tax Department', status: 'FILED', penaltyRisk: '1.5% per month' },
  { id: 'c-4', name: 'Professional Tax (PT) Monthly Filing', dueDate: '10th August 2026', authority: 'State Tax Dept (Karnataka / MH)', status: 'PENDING', penaltyRisk: '₹1,000 flat fine' },
  { id: 'c-5', name: 'Labour Welfare Fund (LWF) Half-Yearly Contribution', dueDate: '30th June 2026', authority: 'Labour Welfare Board', status: 'FILED', penaltyRisk: 'Nil' },
]

export default function CompliancePage() {
  const [items, setItems] = useState<ComplianceItem[]>(INITIAL_ITEMS)

  const handleMarkFiled = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: 'FILED' } : i))
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-cyan-950 text-white p-6 rounded-2xl border border-cyan-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck size={14} /> Statutory & Labour Law Compliance Engine
          </div>
          <h1 className="text-2xl font-bold font-display">Statutory Returns, PF, ESIC & Form 16</h1>
          <p className="text-slate-300 text-sm mt-1">EPFO ECR generation, ESIC returns, TDS Section 192, and Form 16 PDF downloads.</p>
        </div>
        <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md">
          <Download size={16} /> Export ECR File (Text/Zip)
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Compliance Health Score</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">100% Compliant</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Zero Pending Penalties</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Form 16 Status</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">Generated (Part A & B)</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">AY 2026-27 Ready</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Upcoming Deadline</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">15th August</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">PF & ESIC ECR Filing</span>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-2xl border border-hairline shadow-sm p-4 space-y-4">
        <h3 className="font-bold text-sm text-ink">Statutory Filing Calendar & Returns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Statutory Return</th>
                <th className="p-3">Governing Authority</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Late Penalty Risk</th>
                <th className="p-3">Filing Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {items.map(item => (
                <tr key={item.id} className="hover:bg-wash/30 transition">
                  <td className="p-3 font-semibold text-ink">{item.name}</td>
                  <td className="p-3 text-muted">{item.authority}</td>
                  <td className="p-3 font-medium text-ink">{item.dueDate}</td>
                  <td className="p-3 text-rose-600 font-medium">{item.penaltyRisk}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'FILED' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'UPCOMING' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {item.status !== 'FILED' && (
                      <button
                        onClick={() => handleMarkFiled(item.id)}
                        className="px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer shadow-xs"
                      >
                        Mark Filed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
