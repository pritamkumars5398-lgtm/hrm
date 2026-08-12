import { useState, useEffect, useCallback } from 'react'
import { LifeBuoy, Plus, Search, AlertCircle, RefreshCw, CheckCircle, Clock, MessageSquare } from 'lucide-react'
import { helpdeskService, type HelpdeskTicket } from '@/services/helpdeskService'

const CATEGORIES = ['IT', 'HR', 'Finance', 'Admin'] as const
const PRIORITIES: HelpdeskTicket['priority'][] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const STATUSES:   HelpdeskTicket['status'][] =   ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const priorityStyles: Record<string, string> = {
  LOW:    'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH:   'bg-orange-100 text-orange-800',
  URGENT: 'bg-rose-100 text-rose-800',
}

const statusStyles: Record<string, string> = {
  OPEN:        'bg-rose-100 text-rose-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  RESOLVED:    'bg-emerald-100 text-emerald-800',
  CLOSED:      'bg-slate-100 text-slate-600',
}

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [search, setSearch]     = useState('')
  const [showModal, setShowModal]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)

  // comment panel
  const [commentTicketId, setCommentTicketId] = useState<string | null>(null)
  const [commentText, setCommentText]         = useState('')

  // new ticket form
  const [subject, setSubject]   = useState('')
  const [description, setDesc]  = useState('')
  const [category, setCategory] = useState<string>('IT')
  const [priority, setPriority] = useState<HelpdeskTicket['priority']>('MEDIUM')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      setTickets(await helpdeskService.list())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load helpdesk tickets.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) return
    setSubmitting(true); setFormError(null)
    try {
      const t = await helpdeskService.create({ subject, description, category, priority })
      setTickets(prev => [t, ...prev])
      setSubject(''); setDesc(''); setCategory('IT'); setPriority('MEDIUM')
      setShowModal(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to create ticket.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, status: HelpdeskTicket['status']) => {
    try {
      const updated = await helpdeskService.updateStatus(id, { status })
      setTickets(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to update status.')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentTicketId || !commentText.trim()) return
    try {
      const comments = await helpdeskService.addComment(commentTicketId, commentText)
      setTickets(prev => prev.map(t => t.id === commentTicketId ? { ...t, comments } : t))
      setCommentText('')
      setCommentTicketId(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to post comment.')
    }
  }

  const filtered = tickets.filter(
    t => t.subject.toLowerCase().includes(search.toLowerCase()) ||
         (t.ticketNo ?? '').toLowerCase().includes(search.toLowerCase())
  )

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
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md">
          <Plus size={16} /> Raise Ticket
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Open Tickets',   value: tickets.filter(t => t.status === 'OPEN').length,        color: 'text-rose-600',    sub: 'Awaiting First Response' },
          { label: 'In Progress',    value: tickets.filter(t => t.status === 'IN_PROGRESS').length,  color: 'text-amber-600',   sub: 'Under Investigation' },
          { label: 'Resolved',       value: tickets.filter(t => t.status === 'RESOLVED').length,     color: 'text-emerald-600', sub: 'SLA Met' },
          { label: 'Closed',         value: tickets.filter(t => t.status === 'CLOSED').length,       color: 'text-slate-500',   sub: 'Completed' },
        ].map(m => (
          <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
            <span className="text-muted text-xs font-medium">{m.label}</span>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            <span className={`text-[11px] font-semibold mt-1 inline-block ${m.color}`}>{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4 space-y-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input type="text" placeholder="Search tickets by subject or #ID…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-rose-500 focus:outline-none bg-wash/30"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading tickets…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            {tickets.length === 0 ? 'No tickets yet — click Raise Ticket to get started.' : 'No tickets match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Requested By</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Resolution</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-wash/30 transition">
                    <td className="p-3 font-mono font-bold text-rose-600">{t.ticketNo ?? t.id.slice(-6)}</td>
                    <td className="p-3 font-semibold text-ink">{t.subject}</td>
                    <td className="p-3 text-muted">{t.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${priorityStyles[t.priority]}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-ink">{t.requesterName ?? '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[t.status]}`}>
                        {t.status === 'RESOLVED'
                          ? <><CheckCircle size={10} className="inline mr-0.5" />RESOLVED</>
                          : t.status === 'IN_PROGRESS'
                          ? <><Clock size={10} className="inline mr-0.5" />IN PROGRESS</>
                          : t.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-muted max-w-[160px] truncate">
                      {t.resolution ?? '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <select
                          value={t.status}
                          onChange={e => handleStatusChange(t.id, e.target.value as HelpdeskTicket['status'])}
                          className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none"
                        >
                          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <button
                          onClick={() => { setCommentTicketId(t.id); setCommentText('') }}
                          className="p-1 rounded hover:bg-rose-100 text-muted hover:text-rose-600 transition"
                          title="Add comment"
                        >
                          <MessageSquare size={13} />
                        </button>
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Raise Support Ticket</h3>
            {formError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Issue Subject</label>
                <input type="text" required placeholder="e.g. WiFi drops in conference room" value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Description <span className="font-normal">(optional)</span></label>
                <textarea rows={2} placeholder="Steps to reproduce or more context…" value={description}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Department Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Priority Level</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as HelpdeskTicket['priority'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Add Comment</h3>
            <form onSubmit={handleComment} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Comment</label>
                <textarea required rows={3} placeholder="Your update or question…" value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCommentTicketId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm">Post Comment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
