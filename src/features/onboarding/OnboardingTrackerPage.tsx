import { useState } from 'react'
import { UserCheck, CheckCircle, Clock, FileCheck, Laptop, ShieldCheck, Plus } from 'lucide-react'

type OnboardingItem = {
  id: string
  name: string
  jobTitle: string
  department: string
  joiningDate: string
  checklistProgress: number // percentage
  status: 'IN_PROGRESS' | 'COMPLETED'
  buddy: string
}

const INITIAL_ITEMS: OnboardingItem[] = [
  { id: 'ob-1', name: 'Siddharth Varma', jobTitle: 'Frontend Engineer', department: 'Engineering', joiningDate: '2026-08-01', checklistProgress: 85, status: 'IN_PROGRESS', buddy: 'Rahul Mehta' },
  { id: 'ob-2', name: 'Meera Deshmukh', jobTitle: 'Talent Specialist', department: 'Human Resources', joiningDate: '2026-08-04', checklistProgress: 40, status: 'IN_PROGRESS', buddy: 'Priya Sharma' },
  { id: 'ob-3', name: 'Karan Kapoor', jobTitle: 'Product Manager', department: 'Product', joiningDate: '2026-07-15', checklistProgress: 100, status: 'COMPLETED', buddy: 'Ananya Verma' },
]

export default function OnboardingTrackerPage() {
  const [items, setItems] = useState<OnboardingItem[]>(INITIAL_ITEMS)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-teal-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck size={14} /> Digital Employee Onboarding Engine
          </div>
          <h1 className="text-2xl font-bold font-display">New Joiner Tracker & Induction Checklists</h1>
          <p className="text-slate-300 text-sm mt-1">E-signatures, document verification, IT account setup, and buddy assignments.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Active Onboardings</span>
          <p className="text-2xl font-bold text-teal-600 mt-1">{items.filter(i => i.status === 'IN_PROGRESS').length}</p>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 inline-block">Joined this month</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Doc Verification Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">98% Verified</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Aadhaar, PAN & Education</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Avg Onboarding Time</span>
          <p className="text-2xl font-bold text-ink mt-1">3.2 Days</p>
          <span className="text-[11px] text-muted mt-1 inline-block">100% Digital Flow</span>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                {item.name.slice(0, 2).toUpperCase()}
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {item.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-ink">{item.name}</h3>
              <p className="text-xs text-muted">{item.jobTitle} • {item.department}</p>
              <p className="text-[11px] text-muted mt-1">Joined: {item.joiningDate} | Buddy: {item.buddy}</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-muted">Checklist Progress</span>
                <span className="text-teal-600">{item.checklistProgress}%</span>
              </div>
              <div className="w-full bg-wash h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.checklistProgress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
