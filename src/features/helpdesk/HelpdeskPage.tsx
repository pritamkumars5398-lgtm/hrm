import { useState, useEffect, useCallback } from 'react'
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'
import {
  helpdeskService,
  type Ticket,
  type CreateTicketPayload,
} from '../../services/helpdeskService'

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | Ticket['status']>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<Ticket['category']>('IT')
  const [priority, setPriority] = useState<Ticket['priority']>('MEDIUM')
  const [notes, setNotes] = useState('')

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await helpdeskService.getAll(search, statusFilter)
      setTickets(data)
    } catch (err: unknown) {
      console.error('Failed to load tickets:', err)
      setError('Failed to fetch helpdesk tickets. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) return
    try {
      setSubmitting(true)
      const payload: CreateTicketPayload = {
        subject: subject.trim(),
        category,
        priority,
        notes: notes.trim() || undefined,
      }
      await helpdeskService.create(payload)
      setShowModal(false)
      setSubject('')
      setCategory('IT')
      setPriority('MEDIUM')
      setNotes('')
      await fetchTickets()
    } catch (err: unknown) {
      console.error('Failed to submit ticket:', err)
      alert('Could not submit ticket. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: Ticket['status']) => {
    try {
      await helpdeskService.updateStatus(id, newStatus)
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
      )
    } catch (err: unknown) {
      console.error('Failed to update ticket status:', err)
      alert('Failed to update status.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return
    try {
      await helpdeskService.delete(id)
      setTickets((prev) => prev.filter((t) => t.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete ticket:', err)
      alert('Failed to delete ticket.')
    }
  }

  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolvedCount = tickets.filter(
    (t) => t.status === 'RESOLVED' || t.status === 'CLOSED',
  ).length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white p-6 rounded-2xl border border-rose-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy size={14} /> HR, IT & Operations Service Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Helpdesk & SLA Ticketing</h1>
          <p className="text-slate-300 text-sm mt-1">
            Raise support requests, track resolution SLAs, assign tickets, and monitor satisfaction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2.5 rounded-xl transition text-xs border border-white/10"
            title="Refresh tickets"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
          >
            <Plus size={16} /> Raise Ticket
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchTickets}
            className="font-bold underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Open Tickets</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{openCount}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">
            Awaiting First Response
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">In Progress</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{inProgressCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            Under Investigation
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Resolved / Closed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            SLA Met Compliance
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <span className="text-muted text-xs font-medium">Resolution Benchmark</span>
          <p className="text-2xl font-bold text-ink mt-1">2.4 hrs</p>
          <span className="text-[11px] text-muted mt-1 inline-block">CSAT 4.9/5.0</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-hairline shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-wash/60 text-muted hover:bg-wash'
              }`}
            >
              {status === 'ALL' ? 'All Tickets' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search tickets by subject or #ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-rose-500 focus:outline-none bg-wash/30"
          />
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl border border-hairline shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-rose-600" />
            Loading helpdesk tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted space-y-2">
            <LifeBuoy size={36} className="mx-auto text-slate-300" />
            <p className="font-semibold text-ink">No tickets found</p>
            <p className="text-[11px]">Raise a support ticket to get immediate assistance.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash/80 border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Ticket ID</th>
                  <th className="p-3.5">Subject & Details</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Requested By</th>
                  <th className="p-3.5">Assigned To</th>
                  <th className="p-3.5">SLA Status</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-wash/30 transition">
                    <td className="p-3.5 font-mono font-bold text-rose-600">{t.ticketNo}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-ink">{t.subject}</div>
                      {t.notes && (
                        <div className="text-[11px] text-muted truncate max-w-xs mt-0.5">
                          {t.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-muted font-medium">{t.category}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : t.priority === 'HIGH'
                              ? 'bg-orange-100 text-orange-800'
                              : t.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.priority === 'URGENT' && <AlertTriangle size={10} />}
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-ink">{t.requestedBy}</td>
                    <td className="p-3.5 text-muted">{t.assignedTo}</td>
                    <td className="p-3.5">
                      {t.status === 'RESOLVED' || t.status === 'CLOSED' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle size={12} /> SLA Met
                        </span>
                      ) : (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <Clock size={12} /> {t.slaHoursLeft}h left
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED' || t.status === 'CLOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={t.status}
                          onChange={(e) =>
                            handleStatusChange(
                              t.id,
                              e.target.value as Ticket['status'],
                            )
                          }
                          className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Mark Resolved</option>
                          <option value="CLOSED">Close Ticket</option>
                        </select>
                        <button
                          onClick={() => handleDelete(t.id)}
                          title="Delete Ticket"
                          className="p-1 text-muted hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 size={13} />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <LifeBuoy size={18} className="text-rose-600" />
                Raise Support Ticket
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block text-muted font-semibold mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi drops in 2nd floor conference room"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Department Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Ticket['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                  >
                    <option value="IT">IT Support</option>
                    <option value="HR">HR & Payroll</option>
                    <option value="Finance">Finance</option>
                    <option value="Admin">Admin & Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                  >
                    <option value="LOW">Low (48 hrs SLA)</option>
                    <option value="MEDIUM">Medium (24 hrs SLA)</option>
                    <option value="HIGH">High (8 hrs SLA)</option>
                    <option value="URGENT">Urgent (4 hrs SLA)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Additional Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Provide system details, error codes, or urgency context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
