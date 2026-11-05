import { useState, useEffect } from 'react'
import {
  UserCheck,
  CheckCircle,
  Clock,
  FileCheck,
  Laptop,
  ShieldCheck,
  Plus,
  Search,
  X,
  Trash2,
  Calendar,
  CheckCircle2,
  ListChecks,
  ExternalLink,
  Users,
} from 'lucide-react'
import {
  onboardingTrackerService,
  type OnboardingItem,
  type OnboardingTask,
} from '@/services/onboardingTrackerService'

const CATEGORY_COLORS: Record<string, string> = {
  DOCS: 'bg-blue-50 text-blue-700 border-blue-200',
  IT: 'bg-purple-50 text-purple-700 border-purple-200',
  HR: 'bg-teal-50 text-teal-700 border-teal-200',
  TRAINING: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function OnboardingTrackerPage() {
  const [items, setItems] = useState<OnboardingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL')

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false)
  const [activeItem, setActiveItem] = useState<OnboardingItem | null>(null)

  // New joiner form state
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newDept, setNewDept] = useState('Engineering')
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10))
  const [newBuddy, setNewBuddy] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await onboardingTrackerService.getAll()
      setItems(data)
    } catch (err) {
      console.error('Failed to load onboarding items', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newJobTitle.trim() || submitting) return

    setSubmitting(true)
    try {
      const created = await onboardingTrackerService.create({
        name: newName.trim(),
        email: newEmail.trim(),
        jobTitle: newJobTitle.trim(),
        department: newDept,
        joiningDate: newDate,
        buddy: newBuddy.trim() || 'Unassigned',
      })

      setItems([created, ...items])
      setNewName('')
      setNewEmail('')
      setNewJobTitle('')
      setNewBuddy('')
      setShowNewModal(false)
    } catch (err) {
      console.error('Failed to create onboarding entry', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete onboarding record for "${name}"?`)) return
    try {
      await onboardingTrackerService.delete(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      if (activeItem?.id === id) setActiveItem(null)
    } catch (err) {
      console.error('Failed to delete', err)
    }
  }

  const handleToggleTask = async (itemId: string, taskId: string, currentCompleted: boolean) => {
    try {
      const updated = await onboardingTrackerService.toggleTask(itemId, taskId, !currentCompleted)
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)))
      if (activeItem?.id === itemId) {
        setActiveItem(updated)
      }
    } catch (err) {
      console.error('Failed to toggle task', err)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
      item.department.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Dynamic Metrics
  const activeCount = items.filter((i) => i.status === 'IN_PROGRESS').length
  const completedCount = items.filter((i) => i.status === 'COMPLETED').length
  const avgProgress =
    items.length > 0 ? Math.round(items.reduce((acc, i) => acc + i.checklistProgress, 0) / items.length) : 0

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-teal-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck size={14} /> Digital Employee Onboarding Engine
          </div>
          <h1 className="text-2xl font-bold font-display">New Joiner Tracker & Induction Checklists</h1>
          <p className="text-slate-300 text-sm mt-1">
            E-signatures, document verification, IT account setup, and buddy assignments.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer text-xs"
          >
            <Plus size={16} /> Initiate Onboarding
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Active Onboardings</span>
            <Clock size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-teal-600 mt-2">{activeCount}</p>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 inline-block">
            In progress induction
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Induction Completion</span>
            <CheckCircle size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{completedCount} Completed</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            100% Verified joiners
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Overall Task Completion</span>
            <ListChecks size={16} className="text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-ink mt-2">{avgProgress}%</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Across all candidate checklists</span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-hairline">
        <div className="flex items-center gap-2">
          {(['ALL', 'IN_PROGRESS', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-muted hover:bg-wash'
              }`}
            >
              {st === 'ALL' ? `All (${items.length})` : st === 'IN_PROGRESS' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search joiners, roles, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:outline-none focus:border-teal-500 bg-wash/30"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-hairline shadow-sm hover:border-teal-400 transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                  {item.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status === 'COMPLETED' ? 'COMPLETED' : 'IN PROGRESS'}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="text-slate-400 hover:text-rose-600 transition p-1"
                    title="Delete Onboarding"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-ink">{item.name}</h3>
                <p className="text-xs text-muted">
                  {item.jobTitle} • {item.department}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted mt-1.5">
                  <Calendar size={12} />
                  <span>Joined: {item.joiningDate}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted mt-0.5">
                  <Users size={12} />
                  <span>Buddy: {item.buddy}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-muted">Checklist Progress</span>
                  <span className="text-teal-600">{item.checklistProgress}%</span>
                </div>
                <div className="w-full bg-wash h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.checklistProgress === 100 ? 'bg-emerald-500' : 'bg-teal-500'
                    }`}
                    style={{ width: `${item.checklistProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* View Checklist Button */}
            <button
              onClick={() => setActiveItem(item)}
              className="w-full py-2 px-3 bg-wash hover:bg-teal-50 text-slate-800 hover:text-teal-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-hairline cursor-pointer"
            >
              <ListChecks size={14} className="text-teal-600" />
              View Induction Checklist ({item.tasks?.filter((t) => t.completed).length || 0}/
              {item.tasks?.length || 8})
            </button>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-hairline text-muted">
            <UserCheck size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm">No onboarding records found</p>
            <p className="text-xs mt-1">Initiate a new joiner onboarding to track induction tasks.</p>
          </div>
        )}
      </div>

      {/* Task Checklist Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-hairline space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                    Induction Checklist
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeItem.checklistProgress === 100
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeItem.checklistProgress}% Completed
                  </span>
                </div>
                <h3 className="text-lg font-bold text-ink mt-1">{activeItem.name}</h3>
                <p className="text-xs text-muted">
                  {activeItem.jobTitle} • {activeItem.department} • Buddy: {activeItem.buddy}
                </p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Checklist progress bar */}
            <div className="w-full bg-wash h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${activeItem.checklistProgress}%` }}
              />
            </div>

            {/* Tasks list */}
            <div className="space-y-2.5 pt-2">
              {activeItem.tasks?.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(activeItem.id, task.id, task.completed)}
                  className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer select-none ${
                    task.completed
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                      : 'bg-white border-hairline hover:border-teal-300 text-ink'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => {}} // handled by parent onClick
                      className="size-4 rounded text-teal-600 focus:ring-teal-500 border-gray-300 cursor-pointer"
                    />
                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          task.completed ? 'line-through text-slate-400' : 'text-ink'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.completedAt && (
                        <p className="text-[10px] text-emerald-600 mt-0.5">
                          ✓ Completed on {task.completedAt}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${
                      CATEGORY_COLORS[task.category] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {task.category}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-hairline">
              <button
                onClick={() => setActiveItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Onboarding Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Initiate Employee Onboarding</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Siddharth Varma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. siddharth@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Lead"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product">Product</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Assigned Buddy</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Mehta"
                    value={newBuddy}
                    onChange={(e) => setNewBuddy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold shadow-sm transition"
                >
                  {submitting ? 'Creating...' : 'Initiate Induction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
