import { useState } from 'react'
import { GitBranch, Plus, Play, ShieldAlert, CheckCircle, ArrowRight, Clock, Zap } from 'lucide-react'

type Rule = {
  id: string
  name: string
  trigger: string
  condition: string
  action: string
  status: 'ACTIVE' | 'PAUSED'
  executedCount: number
}

const INITIAL_RULES: Rule[] = [
  { id: 'w-1', name: 'Auto-Approve Sick Leave <= 2 Days', trigger: 'Leave Request Created', condition: 'Type == SICK && Days <= 2', action: 'Auto-Approve & Notify Manager', status: 'ACTIVE', executedCount: 142 },
  { id: 'w-2', name: 'Escalate Unapproved Expenses > ₹10,000', trigger: 'Expense Claim Pending > 48 Hrs', condition: 'Amount > 10000', action: 'Escalate to VP Finance', status: 'ACTIVE', executedCount: 19 },
  { id: 'w-3', name: 'Auto IT Account Provisioning on Hiring', trigger: 'Candidate Stage == HIRED', condition: 'Department != NULL', action: 'Provision Google Workspace & Slack Account', status: 'ACTIVE', executedCount: 38 },
]

export default function WorkflowsPage() {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState('Leave Request Created')
  const [action, setAction] = useState('Notify Manager')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const newR: Rule = {
      id: `w-${Date.now()}`,
      name,
      trigger,
      condition: 'True',
      action,
      status: 'ACTIVE',
      executedCount: 0
    }
    setRules([newR, ...rules])
    setName('')
    setShowModal(false)
  }

  const toggleStatus = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : r))
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-amber-950 text-white p-6 rounded-2xl border border-amber-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitBranch size={14} /> No-Code Workflow & Rules Builder
          </div>
          <h1 className="text-2xl font-bold font-display">Workflow Automation & Multi-Stage Approvals</h1>
          <p className="text-slate-300 text-sm mt-1">Configure automated triggers, multi-level escalation matrix, and scheduled tasks.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> Create Workflow Rule
        </button>
      </div>

      {/* Grid */}
      <div className="space-y-4">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">{rule.name}</h3>
                  <p className="text-[11px] text-muted">{rule.executedCount} Executions Triggered</p>
                </div>
              </div>

              <button
                onClick={() => toggleStatus(rule.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  rule.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {rule.status}
              </button>
            </div>

            {/* Visual Workflow Steps */}
            <div className="bg-wash/50 p-4 rounded-xl border border-hairline flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs">
              <div className="bg-white px-3 py-2 rounded-lg border border-hairline font-semibold text-ink">
                <span className="text-[9px] uppercase font-bold text-muted block">Trigger</span>
                {rule.trigger}
              </div>

              <ArrowRight size={14} className="text-muted shrink-0 hidden sm:block" />

              <div className="bg-white px-3 py-2 rounded-lg border border-hairline font-semibold text-amber-700">
                <span className="text-[9px] uppercase font-bold text-muted block">If Condition</span>
                {rule.condition}
              </div>

              <ArrowRight size={14} className="text-muted shrink-0 hidden sm:block" />

              <div className="bg-white px-3 py-2 rounded-lg border border-hairline font-semibold text-emerald-700">
                <span className="text-[9px] uppercase font-bold text-muted block">Execute Action</span>
                {rule.action}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Create Workflow Automation</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Escalate Late Punch After 3 Days"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Event Trigger</label>
                <select
                  value={trigger}
                  onChange={e => setTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-amber-500 focus:outline-none"
                >
                  <option value="Leave Request Created">Leave Request Created</option>
                  <option value="Expense Claim Pending > 48 Hrs">Expense Claim Pending &gt; 48 Hrs</option>
                  <option value="Candidate Stage == HIRED">Candidate Stage == HIRED</option>
                  <option value="Attendance Late Mark > 3 Times">Attendance Late Mark &gt; 3 Times</option>
                </select>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Action to Execute</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Send Email Warning & Notify Manager"
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
