import { useState, useEffect, useCallback } from 'react'
import {
  UserCheck,
  CheckCircle,
  Clock,
  Plus,
  X,
  Loader2,
  Calendar,
  AlertCircle,
  FileCheck2,
  User,
  Users,
  Compass,
  Laptop
} from 'lucide-react'
import { onboardingService, type OnboardingRecord, type OnboardingTask } from '@/services/onboardingService'

export default function OnboardingTrackerPage() {
  const [data, setData] = useState<{
    scope: 'company' | 'team' | 'me';
    records: OnboardingRecord[];
    summary: { total: number; pending: number; completed: number; avgProgress: number };
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals & form state
  const [addingTaskRecord, setAddingTaskRecord] = useState<OnboardingRecord | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskCategory, setTaskCategory] = useState<'HR' | 'IT' | 'MANAGER' | 'EMPLOYEE'>('HR')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [submittingTask, setSubmittingTask] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL')

  const fetchOnboardings = useCallback(async () => {
    try {
      setError(null)
      const res = await onboardingService.getOnboardings()
      setData(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch onboarding checklists.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOnboardings()
  }, [fetchOnboardings])

  const handleToggleTask = async (record: OnboardingRecord, task: OnboardingTask) => {
    const nextStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    
    // Optimistic UI update
    setData((prev) => {
      if (!prev) return null
      const nextRecords = prev.records.map((r) => {
        if (r.id !== record.id) return r
        const nextTasks = r.tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus as 'PENDING' | 'COMPLETED' } : t))
        const completedCount = nextTasks.filter((t) => t.status === 'COMPLETED').length
        const checklistProgress = nextTasks.length === 0 ? 0 : Math.round((completedCount / nextTasks.length) * 100)
        return { ...r, tasks: nextTasks, checklistProgress }
      })
      
      const total = nextRecords.length
      const completed = nextRecords.filter((r) => r.status === 'COMPLETED').length
      const pending = total - completed
      const avgProgress = total === 0 ? 0 : Math.round(nextRecords.reduce((acc, r) => acc + r.checklistProgress, 0) / total)

      return {
        ...prev,
        records: nextRecords,
        summary: { total, pending, completed, avgProgress }
      }
    })

    try {
      await onboardingService.updateTaskStatus(task.id, nextStatus as 'PENDING' | 'COMPLETED')
    } catch (err) {
      // Revert optimistic update on failure
      fetchOnboardings()
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addingTaskRecord || !taskTitle.trim()) return

    setSubmittingTask(true)
    try {
      await onboardingService.addTask(addingTaskRecord.employeeId, {
        title: taskTitle.trim(),
        description: taskDescription.trim() || undefined,
        category: taskCategory,
        dueDate: taskDueDate || undefined,
      })
      setAddingTaskRecord(null)
      setTaskTitle('')
      setTaskDescription('')
      setTaskDueDate('')
      fetchOnboardings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add task')
    } finally {
      setSubmittingTask(false)
    }
  }

  const handleCompleteOnboarding = async (record: OnboardingRecord) => {
    if (!confirm(`Are you sure you want to finalize onboarding for ${record.employeeName}?`)) return
    
    try {
      await onboardingService.completeOnboarding(record.employeeId)
      fetchOnboardings()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to complete onboarding')
    }
  }

  const categoryIcon = (category: OnboardingTask['category']) => {
    switch (category) {
      case 'HR':
        return <FileCheck2 size={13} className="text-pink-600" />
      case 'IT':
        return <Laptop size={13} className="text-blue-600" />
      case 'MANAGER':
        return <Users size={13} className="text-violet-600" />
      case 'EMPLOYEE':
        return <User size={13} className="text-emerald-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 size={36} className="text-teal-600 animate-spin" />
        <p className="text-xs text-muted font-bold tracking-wide">Loading Induction Checklists…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
        <AlertCircle size={18} className="shrink-0" />
        <div>
          <p className="font-bold">Induction Catalog Error</p>
          <p className="mt-1">{error}</p>
        </div>
      </div>
    )
  }

  const records = data?.records ?? []
  
  const filteredRecords = records.filter((r) => {
    if (search && !r.employeeName.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white p-6 rounded-2xl border border-teal-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <UserCheck size={14} /> Digital New Hire Onboarding Engine
          </div>
          <h1 className="text-2xl font-bold font-display">New Joiner Tracker & Induction Checklists</h1>
          <p className="text-slate-300 text-sm mt-1">
            Audit and complete mandatory IT access provisioning, contract agreements, buddy pairings, and HR documents.
          </p>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
          <span className="text-muted text-xs font-medium">Total Onboarding Records</span>
          <p className="text-2xl font-bold text-ink mt-1">{data?.summary.total ?? 0}</p>
          <span className="text-[11px] text-muted inline-block mt-0.5">Hired candidates conversion</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
          <span className="text-muted text-xs font-medium">In Progress Checklists</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data?.summary.pending ?? 0}</p>
          <span className="text-[11px] text-amber-600 font-semibold inline-block mt-0.5">Tasks outstanding</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
          <span className="text-muted text-xs font-medium">Inductions Finalized</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{data?.summary.completed ?? 0}</p>
          <span className="text-[11px] text-emerald-600 font-semibold inline-block mt-0.5">Active profiles</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
          <span className="text-muted text-xs font-medium">Avg. Completion Rate</span>
          <p className="text-2xl font-bold text-teal-600 mt-1">{data?.summary.avgProgress ?? 0}%</p>
          <span className="text-[11px] text-teal-600 font-semibold inline-block mt-0.5">Overall task completions</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-hairline shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink px-2">Listings ({filteredRecords.length})</span>
          <div className="flex bg-wash p-0.5 rounded-lg border border-hairline">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-ink shadow-2xs' : 'text-muted hover:text-ink'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                statusFilter === 'IN_PROGRESS' ? 'bg-white text-ink shadow-2xs' : 'text-muted hover:text-ink'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                statusFilter === 'COMPLETED' ? 'bg-white text-ink shadow-2xs' : 'text-muted hover:text-ink'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by employee name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-hairline focus:border-teal-500 focus:outline-none w-full sm:w-72"
        />
      </div>

      {/* Cards Catalog */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white py-16 text-center text-muted text-xs space-y-2 rounded-2xl border border-hairline">
          <Compass size={36} className="mx-auto text-slate-300 animate-pulse" />
          <p className="font-bold text-ink">No new joiner checklists found</p>
          <p className="max-w-xs mx-auto">
            Hired candidates from the Recruitment panel are automatically registered here as pending inductions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecords.map((record) => {
            const allTasksCompleted = record.tasks.length > 0 && record.tasks.every((t) => t.status === 'COMPLETED')
            
            return (
              <div key={record.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-xs flex flex-col justify-between space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-hairline/60 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-ink leading-snug">{record.employeeName}</h3>
                    <p className="text-xs text-muted mt-0.5">{record.jobTitle} · {record.department}</p>
                    <p className="text-[10px] text-muted/80 mt-1 font-medium">Joined: {record.joiningDate} | Buddy: {record.buddy || 'None'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                    record.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : allTasksCompleted
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {record.status === 'COMPLETED' ? 'COMPLETED' : allTasksCompleted ? 'READY FOR SIGN-OFF' : 'IN PROGRESS'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted">Induction Tasks Progress</span>
                    <span className="text-teal-600">{record.checklistProgress}%</span>
                  </div>
                  <div className="w-full bg-wash h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${record.checklistProgress}%` }}
                    />
                  </div>
                </div>

                {/* Task Checklist Items */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-ink block uppercase tracking-wider">Checklist Items</span>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {record.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(record, task)}
                        className="flex items-start gap-2.5 p-2 rounded-xl bg-wash/50 border border-hairline/30 hover:border-teal-300 transition cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={task.status === 'COMPLETED'}
                          onChange={() => {}} // handled by click
                          className="mt-0.5 size-3.5 rounded-sm border-gray-300 text-teal-600 focus:ring-teal-500 shrink-0 pointer-events-none"
                        />
                        <div className="flex-1 text-xs">
                          <p className={`font-bold leading-normal ${task.status === 'COMPLETED' ? 'line-through text-muted font-semibold' : 'text-ink'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-muted leading-snug mt-0.5">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 bg-white border border-hairline/60 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-muted">
                              {categoryIcon(task.category)}
                              {task.category}
                            </span>
                            {task.dueDate && (
                              <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-600 font-mono">
                                <Calendar size={9} /> {task.dueDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-hairline/60 flex items-center justify-between gap-3 text-xs">
                  <button
                    onClick={() => setAddingTaskRecord(record)}
                    className="flex items-center gap-1 text-teal-600 hover:text-teal-500 font-bold cursor-pointer"
                  >
                    <Plus size={14} /> Add Custom Task
                  </button>

                  {record.status === 'IN_PROGRESS' && allTasksCompleted && (
                    <button
                      onClick={() => handleCompleteOnboarding(record)}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer text-[11px]"
                    >
                      <CheckCircle size={13} /> Complete Onboarding
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {addingTaskRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-4">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">New Induction Task</span>
                <h3 className="font-bold text-base text-ink mt-0.5">Assign Task for {addingTaskRecord.employeeName}</h3>
              </div>
              <button
                onClick={() => setAddingTaskRecord(null)}
                className="text-muted hover:text-ink cursor-pointer p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-ink font-bold block">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule DevOps infrastructure setup call"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-hairline focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-ink font-bold block">Category *</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-hairline focus:border-teal-500 focus:outline-none"
                  >
                    <option value="HR">HR Dept Task</option>
                    <option value="IT">IT Provisioning</option>
                    <option value="MANAGER">Manager actions</option>
                    <option value="EMPLOYEE">Employee task</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-ink font-bold block">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-hairline focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-ink font-bold block">Description (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Provide instructions or links for completion…"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-hairline focus:border-teal-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAddingTaskRecord(null)}
                  className="px-4 py-2 rounded-xl bg-wash hover:bg-slate-200 text-ink transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask || !taskTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingTask && <Loader2 size={13} className="animate-spin" />}
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
