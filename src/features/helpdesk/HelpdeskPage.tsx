import { useState, useEffect, useCallback } from 'react'
import {
  LifeBuoy, Plus, Search, AlertCircle, Loader2, CheckCircle, Clock,
  MessageSquare, ShieldAlert, Check, X, User, Tag, Calendar,
  UserCheck, Send, Info, Eye
} from 'lucide-react'
import { helpdeskService, type HelpdeskTicket } from '@/services/helpdeskService'
import { employeeService } from '@/services/employeeService'
import { useAuthStore } from '@/features/auth/store/authStore'

const CATEGORIES = ['IT', 'HR', 'Finance', 'Admin'] as const
const PRIORITIES: HelpdeskTicket['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const STATUSES: HelpdeskTicket['status'][] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const priorityStyles: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-700 border border-slate-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border border-orange-200',
  URGENT: 'bg-rose-50 text-rose-700 border border-rose-200',
}

const statusStyles: Record<string, string> = {
  OPEN: 'bg-rose-50 text-rose-700 border border-rose-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200',
  RESOLVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  CLOSED: 'bg-slate-50 text-slate-500 border border-slate-200',
}

function canManage(permissions: string[]): boolean {
  return permissions.includes('*') || permissions.includes('helpdesk.manage') || permissions.includes('reports.view')
}

export default function HelpdeskPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user ? canManage(user.permissions) : false

  const [tab, setTab] = useState<'mine' | 'all'>('mine')
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([])
  const [allTickets, setAllTickets] = useState<HelpdeskTicket[]>([])
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // New ticket state
  const [subject, setSubject] = useState('')
  const [description, setDesc] = useState('')
  const [category, setCategory] = useState<string>('IT')
  const [priority, setPriority] = useState<HelpdeskTicket['priority']>('MEDIUM')

  // Resolve modal state
  const [resolveTicketId, setResolveTicketId] = useState<string | null>(null)
  const [resolutionText, setResolutionText] = useState('')
  const [resolving, setResolving] = useState(false)

  // Assign modal state
  const [assignTicketId, setAssignTicketId] = useState<string | null>(null)
  const [assignEmpId, setAssignEmpId] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Detail Modal / Comment Sidebar state
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [mine, all, emps] = await Promise.all([
        helpdeskService.list(),
        isManager ? helpdeskService.listAll() : Promise.resolve([]),
        isManager ? employeeService.getAll({ pageSize: 1000 }, 'ACTIVE') : Promise.resolve({ rows: [] }),
      ])
      setTickets(mine)
      setAllTickets(all)
      if (emps && emps.rows) {
        setEmployees(emps.rows.map((e: any) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName })))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load tickets.')
    } finally {
      setLoading(false)
    }
  }, [isManager])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) return
    setSubmitting(true)
    setFormError(null)
    try {
      const t = await helpdeskService.create({ subject, description, category, priority })
      setTickets(prev => [t, ...prev])
      if (isManager) {
        setAllTickets(prev => [t, ...prev])
      }
      setSubject('')
      setDesc('')
      setCategory('IT')
      setPriority('MEDIUM')
      setShowCreateModal(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: HelpdeskTicket['status']) => {
    if (status === 'RESOLVED') {
      setResolveTicketId(id)
      setResolutionText('')
      return
    }

    try {
      const updated = await helpdeskService.updateStatus(id, { status })
      updateLocalTickets(id, updated)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to update status.')
    }
  }

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolveTicketId || !resolutionText.trim()) return
    setResolving(true)
    try {
      const updated = await helpdeskService.updateStatus(resolveTicketId, {
        status: 'RESOLVED',
        resolution: resolutionText.trim(),
      })
      updateLocalTickets(resolveTicketId, updated)
      setResolveTicketId(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to resolve ticket.')
    } finally {
      setResolving(false)
    }
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignTicketId) return
    setAssigning(true)
    try {
      const target = allTickets.find((t) => t.id === assignTicketId)
      const currentStatus = target?.status ?? 'OPEN'
      const updated = await helpdeskService.updateStatus(assignTicketId, {
        status: currentStatus,
        assignedToId: assignEmpId || undefined,
      })
      updateLocalTickets(assignTicketId, updated)
      setAssignTicketId(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Assignment failed.')
    } finally {
      setAssigning(false)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !commentText.trim()) return
    setCommenting(true)
    try {
      const updatedComments = await helpdeskService.addComment(selectedTicket.id, commentText)
      const updatedTicket = { ...selectedTicket, comments: updatedComments }
      setSelectedTicket(updatedTicket)
      updateLocalTickets(selectedTicket.id, updatedTicket)
      setCommentText('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to post comment.')
    } finally {
      setCommenting(false)
    }
  }

  const updateLocalTickets = (id: string, updated: HelpdeskTicket) => {
    const mapper = (t: HelpdeskTicket) => (t.id === id ? { ...t, ...updated } : t)
    setTickets((prev) => prev.map(mapper))
    setAllTickets((prev) => prev.map(mapper))
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) => (prev ? { ...prev, ...updated } : null))
    }
  }

  const activeTicketsList = tab === 'mine' ? tickets : allTickets

  const filtered = activeTicketsList.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.ticketNo ?? '').toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  )

  const openCount = activeTicketsList.filter((t) => t.status === 'OPEN').length
  const progressCount = activeTicketsList.filter((t) => t.status === 'IN_PROGRESS').length
  const resolvedCount = activeTicketsList.filter((t) => t.status === 'RESOLVED').length
  const closedCount = activeTicketsList.filter((t) => t.status === 'CLOSED').length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white p-6 rounded-2xl border border-rose-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy size={14} /> HR, IT &amp; Operations Service Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Helpdesk &amp; SLA Ticketing</h1>
          <p className="text-slate-300 text-sm mt-1">Raise support requests, track resolution SLAs, and assign department tickets.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {isManager && (
            <div className="flex bg-slate-800/60 p-1 rounded-xl border border-rose-500/20">
              <button
                onClick={() => setTab('mine')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tab === 'mine' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                My Tickets
              </button>
              <button
                onClick={() => setTab('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  tab === 'all' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Tickets
              </button>
            </div>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
          >
            <Plus size={16} /> Raise Ticket
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open Tickets', value: openCount, color: 'text-rose-600', sub: 'Awaiting response' },
          { label: 'In Progress', value: progressCount, color: 'text-amber-600', sub: 'Under investigation' },
          { label: 'Resolved', value: resolvedCount, color: 'text-emerald-600', sub: 'SLA Met / Cleared' },
          { label: 'Closed', value: closedCount, color: 'text-slate-500', sub: 'Archive' },
        ].map((m) => (
          <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
            <span className="text-muted text-xs font-medium block">{m.label}</span>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            <span className="text-[11px] text-muted mt-1 inline-block">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-hairline shadow-2xs p-4 space-y-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search tickets by subject, #ID, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-rose-500 focus:outline-none bg-wash/30"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <Loader2 size={18} className="animate-spin text-rose-500" /> Loading tickets…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            {tickets.length === 0 ? 'No tickets yet. Click Raise Ticket to file your first issue.' : 'No tickets match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash border-b border-hairline text-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Requester</th>
                  <th className="p-3">Assignee</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-wash/30 transition group">
                    <td className="p-3 font-mono font-bold text-rose-600">
                      {t.ticketNo ?? t.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-3 font-semibold text-ink">
                      <div className="max-w-xs truncate">{t.subject}</div>
                      {t.resolution && (
                        <div className="text-[10px] text-emerald-600 font-normal mt-0.5 line-clamp-1">
                          Res: {t.resolution}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-muted">{t.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityStyles[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-ink">{t.requesterName || '—'}</td>
                    <td className="p-3 text-muted">
                      {t.assignedToId ? (
                        <span className="font-medium text-slate-800">
                          {t.assignedToName || employees.find((e) => e.id === t.assignedToId)?.firstName || 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                          title="View Details & Comments"
                        >
                          <Eye size={14} />
                        </button>
                        {isManager && (
                          <button
                            onClick={() => {
                              setAssignTicketId(t.id)
                              setAssignEmpId(t.assignedToId || '')
                            }}
                            className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-700 transition"
                            title="Assign Ticket"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value as HelpdeskTicket['status'])}
                          className="text-[10px] font-semibold bg-wash border border-hairline rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">Raise Support Ticket</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-wash cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            {formError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Issue Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi drops in conference room"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide more context or steps to reproduce…"
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as HelpdeskTicket['priority'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal (Resolution Notes) */}
      {resolveTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">Resolve Helpdesk Ticket</h3>
              <button
                onClick={() => setResolveTicketId(null)}
                className="p-1 rounded-lg hover:bg-wash cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Resolution Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain how the issue was fixed (e.g. rebooted access point)..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResolveTicketId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm cursor-pointer"
                >
                  {resolving ? 'Resolving…' : 'Confirm Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">Assign Support Ticket</h3>
              <button
                onClick={() => setAssignTicketId(null)}
                className="p-1 rounded-lg hover:bg-wash cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Choose Support Representative</label>
                <select
                  value={assignEmpId}
                  onChange={(e) => setAssignEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-400 focus:outline-none"
                >
                  <option value="">Unassigned (None)</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssignTicketId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  {assigning ? 'Assigning…' : 'Save Assignee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details & Comments Modal (Slideout Style) */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-hairline">
            {/* Slideout Header */}
            <div className="p-4 border-b border-hairline flex items-center justify-between bg-wash">
              <div>
                <span className="font-mono font-bold text-rose-600 text-[11px]">
                  {selectedTicket.ticketNo ?? selectedTicket.id.slice(-6).toUpperCase()}
                </span>
                <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-1">{selectedTicket.subject}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 cursor-pointer text-muted hover:text-ink transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Slideout Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* Ticket Information */}
              <div className="bg-wash/50 border border-hairline rounded-xl p-3.5 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted block font-medium">Requester</span>
                    <span className="font-semibold text-ink flex items-center gap-1.5 mt-0.5">
                      <User size={13} className="text-muted" /> {selectedTicket.requesterName || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block font-medium">Department</span>
                    <span className="font-semibold text-ink flex items-center gap-1.5 mt-0.5">
                      <Tag size={13} className="text-muted" /> {selectedTicket.category}
                    </span>
                  </div>
                </div>

                <hr className="border-hairline" />

                <div>
                  <span className="text-muted block font-medium">Description</span>
                  <p className="mt-1 text-slate-700 whitespace-pre-line leading-relaxed">
                    {selectedTicket.description || <span className="italic text-slate-400">No description provided.</span>}
                  </p>
                </div>

                {selectedTicket.resolution && (
                  <>
                    <hr className="border-hairline" />
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                      <span className="text-emerald-800 font-bold block flex items-center gap-1">
                        <CheckCircle size={13} /> Resolution details
                      </span>
                      <p className="mt-1 text-emerald-950 font-medium">{selectedTicket.resolution}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Comments Feed */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-slate-400" /> Comments Feed ({selectedTicket.comments?.length || 0})
                </h4>

                <div className="space-y-2.5">
                  {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                    <div className="text-center py-6 text-slate-400 bg-wash/30 rounded-xl border border-dashed border-hairline">
                      No comments yet. Send a message below to coordinate.
                    </div>
                  ) : (
                    selectedTicket.comments.map((c: any) => (
                      <div key={c.id || c.timestamp} className="bg-wash/30 p-2.5 rounded-xl border border-hairline">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-800">{c.author}</span>
                          <span className="text-[10px] text-muted font-mono">
                            {new Date(c.timestamp || c.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-normal">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handlePostComment} className="p-3 border-t border-hairline bg-wash flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Post a comment/update..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-white border border-hairline rounded-xl px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={commenting || !commentText.trim()}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer disabled:opacity-40 transition shrink-0"
              >
                {commenting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
