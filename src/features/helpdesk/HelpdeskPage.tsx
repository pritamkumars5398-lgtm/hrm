import { useState } from 'react'
import { LifeBuoy, Plus, Search, CheckCircle, Clock, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react'

type Ticket = {
  id: string
  ticketNo: string
  subject: string
  category: 'HR' | 'IT' | 'Finance' | 'Admin'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  requestedBy: string
  assignedTo: string
  createdAt: string
  slaHoursLeft: number
}

const INITIAL_TICKETS: Ticket[] = [
  { id: 't-1', ticketNo: 'HD-1092', subject: 'VPN Access issue on MacBook', category: 'IT', priority: 'HIGH', status: 'IN_PROGRESS', requestedBy: 'Priya Sharma', assignedTo: 'IT Desk Lead', createdAt: '2026-08-05', slaHoursLeft: 3 },
  { id: 't-2', ticketNo: 'HD-1093', subject: 'Form 16 Tax Query for FY25', category: 'Finance', priority: 'MEDIUM', status: 'OPEN', requestedBy: 'Rahul Mehta', assignedTo: 'Payroll Admin', createdAt: '2026-08-06', slaHoursLeft: 18 },
  { id: 't-3', ticketNo: 'HD-1088', subject: 'Request for Dual Monitor Setup', category: 'Admin', priority: 'LOW', status: 'RESOLVED', requestedBy: 'Ananya Verma', assignedTo: 'Facilities Lead', createdAt: '2026-08-01', slaHoursLeft: 0 },
]

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState<Ticket['category']>('IT')
  const [priority, setPriority] = useState<Ticket['priority']>('MEDIUM')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) return
    const newT: Ticket = {
      id: `t-${Date.now()}`,
      ticketNo: `HD-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category,
      priority,
      status: 'OPEN',
      requestedBy: 'Priya Sharma',
      assignedTo: 'Support Desk',
      createdAt: new Date().toISOString().split('T')[0],
      slaHoursLeft: priority === 'URGENT' ? 4 : priority === 'HIGH' ? 8 : 24
    }
    setTickets([newT, ...tickets])
    setSubject('')
    setShowModal(false)
  }

  const handleStatusChange = (id: string, newStatus: Ticket['status']) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
  }

  const filtered = tickets.filter(
    t => t.subject.toLowerCase().includes(search.toLowerCase()) || t.ticketNo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-rose-950 text-white p-6 rounded-2xl border border-rose-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <LifeBuoy size={14} /> HR, IT & Operations Service Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Helpdesk & SLA Ticketing</h1>
          <p className="text-slate-300 text-sm mt-1">Raise support requests, track resolution SLAs, and assign department tickets.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> Raise Ticket
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Open Tickets</span>
          <p className="text-2xl font-bold text-rose-600 mt-1">{tickets.filter(t => t.status === 'OPEN').length}</p>
          <span className="text-[11px] text-rose-600 font-semibold mt-1 inline-block">Awaiting First Response</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">In Progress</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Under Investigation</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Resolved Today</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{tickets.filter(t => t.status === 'RESOLVED').length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">98.4% SLA Compliance</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Avg Resolution Time</span>
          <p className="text-2xl font-bold text-ink mt-1">2.4 hrs</p>
          <span className="text-[11px] text-muted mt-1 inline-block">CSAT 4.9/5.0</span>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4 space-y-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search tickets by subject or #ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-rose-500 focus:outline-none bg-wash/30"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Category</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Requested By</th>
                <th className="p-3">SLA Status</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-wash/30 transition">
                  <td className="p-3 font-mono font-bold text-rose-600">{t.ticketNo}</td>
                  <td className="p-3 font-semibold text-ink">{t.subject}</td>
                  <td className="p-3 text-muted">{t.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                      t.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      t.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-ink">{t.requestedBy}</td>
                  <td className="p-3">
                    {t.status === 'RESOLVED' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> SLA Met
                      </span>
                    ) : (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <Clock size={12} /> {t.slaHoursLeft}h left
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                      t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <select
                      value={t.status}
                      onChange={e => handleStatusChange(t.id, e.target.value as Ticket['status'])}
                      className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Mark Resolved</option>
                      <option value="CLOSED">Close Ticket</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Raise Support Ticket</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Issue Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WiFi connection drops in 2nd floor conference room"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Department Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Ticket['category'])}
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
                    onChange={e => setPriority(e.target.value as Ticket['priority'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
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
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
