import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  GitBranch,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  PauseCircle,
  ChevronRight,
  ArrowRight,
  Sliders,
  Sparkles,
  Zap,
  Calendar,
  DollarSign,
  UserPlus,
  ShieldCheck,
  Building,
} from 'lucide-react'
import {
  workflowsService,
  type WorkflowRule,
  type CreateWorkflowPayload,
} from '../../services/workflowsService'

// Enterprise HR Presets
const TRIGGER_DEFINITIONS = [
  {
    id: 'leave_created',
    name: 'Leave Request Created',
    category: 'Attendance & Leave',
    icon: Calendar,
    defaultCondition: 'type in ["SICK", "CASUAL"] && days <= 2',
    defaultAction: 'Auto-Approve & Notify Manager',
  },
  {
    id: 'candidate_hired',
    name: 'Candidate Marked Hired',
    category: 'Recruitment',
    icon: UserPlus,
    defaultCondition: 'department == "Engineering"',
    defaultAction: 'Trigger Onboarding & Create Portal Account',
  },
  {
    id: 'expense_pending',
    name: 'Expense Pending > 48 Hours',
    category: 'Finance',
    icon: DollarSign,
    defaultCondition: 'amount > 5000',
    defaultAction: 'Escalate to Finance Admin via Email',
  },
  {
    id: 'late_attendance',
    name: 'Late Attendance (3+ occurrences)',
    category: 'Attendance & Leave',
    icon: Clock,
    defaultCondition: 'monthlyLateMarks >= 3',
    defaultAction: 'Send Reminder & Alert Reporting Manager',
  },
  {
    id: 'payroll_ready',
    name: 'Payroll Cycle Approved',
    category: 'Payroll',
    icon: ShieldCheck,
    defaultCondition: 'status == "VERIFIED"',
    defaultAction: 'Generate Digital Payslips & Notify Employees',
  },
]

const ACTION_SUGGESTIONS = [
  'Auto-Approve & Notify Manager',
  'Escalate to HR Head via Email',
  'Send WhatsApp / SMS Notification',
  'Trigger Onboarding Checklist',
  'Generate Warning Notice',
]

export default function WorkflowsPage() {
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [runningTestId, setRunningTestId] = useState<string | null>(null)

  // Form
  const [name, setName] = useState('')
  const [trigger, setTrigger] = useState(TRIGGER_DEFINITIONS[0].name)
  const [condition, setCondition] = useState(TRIGGER_DEFINITIONS[0].defaultCondition)
  const [action, setAction] = useState(TRIGGER_DEFINITIONS[0].defaultAction)

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await workflowsService.getAll()
      setRules(data)
      if (data.length > 0 && !selectedRuleId) {
        setSelectedRuleId(data[0].id)
      }
    } catch (err: unknown) {
      console.error('Failed to load rules:', err)
      setError('Unable to fetch workflow rules. Please verify backend.')
    } finally {
      setLoading(false)
    }
  }, [selectedRuleId])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const selectedRule = useMemo(() => {
    return rules.find((r) => r.id === selectedRuleId) || rules[0] || null
  }, [rules, selectedRuleId])

  const handleSelectTrigger = (val: string) => {
    setTrigger(val)
    const match = TRIGGER_DEFINITIONS.find((t) => t.name === val)
    if (match) {
      setCondition(match.defaultCondition)
      setAction(match.defaultAction)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !action.trim()) return
    try {
      setSubmitting(true)
      const payload: CreateWorkflowPayload = {
        name: name.trim(),
        trigger,
        condition: condition.trim() || 'True',
        action: action.trim(),
      }
      const created = await workflowsService.create(payload)
      setRules((prev) => [created, ...prev])
      setSelectedRuleId(created.id)
      setName('')
      setShowModal(false)
    } catch (err: unknown) {
      console.error('Failed to create rule:', err)
      alert('Could not save rule.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      const updated = await workflowsService.toggleStatus(id)
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err: unknown) {
      console.error('Failed to toggle status:', err)
      alert('Failed to update status.')
    }
  }

  const handleTestRun = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    try {
      setRunningTestId(id)
      const updated = await workflowsService.testRun(id)
      setRules((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch (err: unknown) {
      console.error('Failed test run:', err)
      alert('Simulation test failed.')
    } finally {
      setRunningTestId(null)
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (!confirm('Are you sure you want to delete this rule?')) return
    try {
      await workflowsService.delete(id)
      setRules((prev) => prev.filter((r) => r.id !== id))
      if (selectedRuleId === id) setSelectedRuleId(null)
    } catch (err: unknown) {
      console.error('Failed to delete rule:', err)
      alert('Delete failed.')
    }
  }

  const totalRuns = rules.reduce((acc, r) => acc + (r.executedCount || 0), 0)
  const activeCount = rules.filter((r) => r.status === 'ACTIVE').length

  return (
    <div className="space-y-5">
      {/* Page Header — Clean HR Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-pine uppercase tracking-wider">
            <GitBranch size={14} /> Workflow & Multi-Stage Rules
          </div>
          <h1 className="text-xl font-display font-bold text-ink mt-0.5">Automations & Rules</h1>
          <p className="text-xs text-muted mt-0.5">
            Configure event triggers, validation logic, and automated HR actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchRules}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ctl border border-hairline bg-surface hover:bg-wash text-xs font-medium text-ink transition cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-ctl bg-pine hover:bg-pine-deep text-white text-xs font-bold transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-ctl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <button onClick={fetchRules} className="font-bold underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Main 2-Column Minimal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Rule List (4 cols) */}
        <div className="lg:col-span-4 bg-surface rounded-card border border-hairline overflow-hidden">
          <div className="p-3 border-b border-hairline flex items-center justify-between bg-wash/40">
            <span className="text-xs font-bold text-ink">Rules ({rules.length})</span>
            <span className="text-[11px] font-semibold text-pine bg-pine-tint px-2 py-0.5 rounded-full">
              {activeCount} Active
            </span>
          </div>

          <div className="divide-y divide-hairline max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted">
                <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-pine" />
                Loading rules...
              </div>
            ) : rules.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted space-y-1">
                <p className="font-medium text-ink">No rules configured</p>
                <p className="text-[11px]">Click "New Rule" to set up your first automation.</p>
              </div>
            ) : (
              rules.map((rule) => {
                const isSelected = selectedRule?.id === rule.id
                return (
                  <div
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`p-3.5 text-xs cursor-pointer transition flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-pine-tint/40 border-l-3 border-pine'
                        : 'hover:bg-wash/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full shrink-0 ${
                            rule.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        />
                        <h4 className="font-bold text-ink truncate">{rule.name}</h4>
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5 pl-4">
                        {rule.trigger}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted pl-4 mt-1">
                        <span>{rule.executedCount} runs</span>
                        {rule.lastExecutedAt && (
                          <span>
                            • {new Date(rule.lastExecutedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      size={14}
                      className={isSelected ? 'text-pine' : 'text-hairline-strong'}
                    />
                  </div>
                )
              })
            )}
          </div>

          {/* Quick Metrics Footer */}
          <div className="p-3 border-t border-hairline bg-wash/30 flex items-center justify-between text-[11px] text-muted">
            <span>Total automated runs:</span>
            <span className="font-bold text-ink">{totalRuns}</span>
          </div>
        </div>

        {/* Right Column: Visual Tree Node Flow (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedRule ? (
            <div className="bg-surface rounded-card border border-hairline p-5 space-y-5">
              {/* Rule Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-ink">{selectedRule.name}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedRule.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {selectedRule.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted mt-0.5">
                    Rule ID: <code className="font-mono text-ink">{selectedRule.id}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleTestRun(selectedRule.id, e)}
                    disabled={runningTestId === selectedRule.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-ctl text-xs font-semibold bg-wash hover:bg-hairline/60 text-ink border border-hairline transition cursor-pointer disabled:opacity-50"
                  >
                    <Play size={12} className={runningTestId === selectedRule.id ? 'animate-spin text-pine' : 'text-pine'} />
                    <span>Test Run</span>
                  </button>

                  <button
                    onClick={(e) => handleToggle(selectedRule.id, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-ctl text-xs font-semibold border border-hairline hover:bg-wash transition cursor-pointer"
                  >
                    {selectedRule.status === 'ACTIVE' ? (
                      <>
                        <PauseCircle size={13} className="text-amber-600" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} className="text-emerald-600" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(selectedRule.id, e)}
                    className="p-1.5 rounded-ctl text-muted hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Minimal Clean Tree Flow Nodes */}
              <div className="bg-wash/30 p-5 rounded-card border border-hairline">
                <div className="text-[11px] font-extrabold text-muted uppercase tracking-wider mb-4">
                  Visual Execution Pipeline
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-3 relative">
                  {/* Step 1: Trigger Node */}
                  <div className="w-full md:w-1/3 bg-white p-3.5 rounded-card border border-hairline shadow-2xs hover:border-pine transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-pine uppercase tracking-wider bg-pine-tint px-2 py-0.5 rounded">
                        1. Trigger
                      </span>
                      <Zap size={13} className="text-pine" />
                    </div>
                    <p className="text-xs font-bold text-ink mt-1 truncate">{selectedRule.trigger}</p>
                    <span className="text-[10px] text-muted block mt-1">Event listener</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="text-muted shrink-0 my-1 md:my-0">
                    <ArrowRight size={15} className="rotate-90 md:rotate-0" />
                  </div>

                  {/* Step 2: Condition Node */}
                  <div className="w-full md:w-1/3 bg-white p-3.5 rounded-card border border-hairline shadow-2xs hover:border-pine transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-ochre-deep uppercase tracking-wider bg-ochre-tint px-2 py-0.5 rounded">
                        2. IF Condition
                      </span>
                      <Sliders size={13} className="text-ochre-deep" />
                    </div>
                    <code className="text-[11px] font-mono text-ink block bg-wash/60 p-1.5 rounded border border-hairline/60 break-all">
                      {selectedRule.condition || 'True'}
                    </code>
                    <span className="text-[10px] text-muted block mt-1">Logic filter</span>
                  </div>

                  {/* Connector Arrow */}
                  <div className="text-muted shrink-0 my-1 md:my-0">
                    <ArrowRight size={15} className="rotate-90 md:rotate-0" />
                  </div>

                  {/* Step 3: Action Node */}
                  <div className="w-full md:w-1/3 bg-white p-3.5 rounded-card border border-hairline shadow-2xs hover:border-pine transition">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                        3. Execute Action
                      </span>
                      <CheckCircle size={13} className="text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-ink mt-1 truncate">{selectedRule.action}</p>
                    <span className="text-[10px] text-muted block mt-1">Target dispatch</span>
                  </div>
                </div>
              </div>

              {/* Status details bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-wash/50 rounded-ctl border border-hairline text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>Rule is active and listening for trigger events.</span>
                </div>
                <div className="text-[11px]">
                  Total runs: <strong className="text-ink">{selectedRule.executedCount}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-card border border-hairline p-12 text-center text-muted">
              <GitBranch size={32} className="mx-auto text-pine mb-2 opacity-60" />
              <p className="font-semibold text-ink text-sm">Select a workflow rule</p>
              <p className="text-xs mt-1">Choose a rule from the left panel to inspect its visual execution flow.</p>
            </div>
          )}
        </div>
      </div>

      {/* Clean Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 backdrop-blur-2xs p-4">
          <div className="bg-surface border border-hairline w-full max-w-md p-6 rounded-card shadow-overlay text-ink">
            <div className="flex items-center justify-between pb-3 border-b border-hairline mb-4">
              <h3 className="text-base font-bold font-display text-ink flex items-center gap-2">
                <GitBranch size={16} className="text-pine" />
                Create Workflow Rule
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-ink font-semibold mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auto-Approve Sick Leave Under 2 Days"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-ctl border border-hairline focus:border-pine focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Trigger Event</label>
                <select
                  value={trigger}
                  onChange={(e) => handleSelectTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-ctl border border-hairline focus:border-pine focus:outline-none bg-white cursor-pointer"
                >
                  {TRIGGER_DEFINITIONS.map((t) => (
                    <option key={t.id} value={t.name}>
                      [{t.category}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Condition Logic (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. type in ['SICK', 'CASUAL'] && days <= 2"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-ctl border border-hairline font-mono text-ink focus:border-pine focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-ink font-semibold mb-1">Action to Execute</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Auto-Approve & Notify Manager"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-ctl border border-hairline focus:border-pine focus:outline-none"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {ACTION_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setAction(s)}
                      className="px-2 py-0.5 rounded text-[10px] bg-wash hover:bg-hairline text-ink border border-hairline cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded-ctl border border-hairline text-muted hover:bg-wash font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-ctl bg-pine hover:bg-pine-deep text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
