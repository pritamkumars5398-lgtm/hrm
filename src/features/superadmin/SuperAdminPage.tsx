import { useState } from 'react'
import { ShieldAlert, Building, CreditCard, ToggleLeft, Activity, Users, Database, Plus, Search } from 'lucide-react'

type Tenant = {
  id: string
  name: string
  domain: string
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
  employeesCount: number
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED'
  mrr: number
}

const INITIAL_TENANTS: Tenant[] = [
  { id: 'ten-1', name: 'Acme Technologies Ltd', domain: 'acme.emgage.work', plan: 'ENTERPRISE', employeesCount: 420, status: 'ACTIVE', mrr: 125000 },
  { id: 'ten-2', name: 'Keka Demo Workspace', domain: 'keka-demo.emgage.work', plan: 'PROFESSIONAL', employeesCount: 85, status: 'ACTIVE', mrr: 35000 },
  { id: 'ten-3', name: 'Starlight Solutions', domain: 'starlight.emgage.work', plan: 'STARTER', employeesCount: 18, status: 'TRIAL', mrr: 0 },
]

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS)
  const [search, setSearch] = useState('')

  const totalMRR = tenants.reduce((a, b) => a + b.mrr, 0)
  const totalEmployees = tenants.reduce((a, b) => a + b.employeesCount, 0)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white p-6 rounded-2xl border border-rose-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldAlert size={14} /> Multi-Tenant SaaS Master Control Room
          </div>
          <h1 className="text-2xl font-bold font-display">Super Admin & Subscription Operations</h1>
          <p className="text-slate-300 text-sm mt-1">Tenant provisioning, billing subscriptions, feature toggles, and system audit logs.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Active Tenants</span>
          <p className="text-2xl font-bold text-ink mt-1">{tenants.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">99.99% Uptime</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Monthly Recurring (MRR)</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">₹{totalMRR.toLocaleString()}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">ARR: ₹{(totalMRR * 12).toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Platform Employees</span>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{totalEmployees}</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block">Active ESS Users</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Database Health</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">Healthy</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">MongoDB / Redis Synced</span>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-hairline shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-ink">Provisioned Organizations</h3>
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search domain or org name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Organization Name</th>
                <th className="p-3">Domain Workspace</th>
                <th className="p-3">Subscription Plan</th>
                <th className="p-3">Employees</th>
                <th className="p-3">MRR (₹)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-wash/30 transition">
                  <td className="p-3 font-semibold text-ink">{t.name}</td>
                  <td className="p-3 font-mono text-rose-600">{t.domain}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {t.plan}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-ink">{t.employeesCount} users</td>
                  <td className="p-3 font-bold text-emerald-600">₹{t.mrr.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
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
