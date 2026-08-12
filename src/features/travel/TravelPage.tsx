import { useState, useEffect, useCallback } from 'react'
import { Plane, Plus, AlertCircle, RefreshCw, Clock, CheckCircle, XCircle, Ban, BookOpen } from 'lucide-react'
import { travelService, type TravelRequest } from '@/services/travelService'

const statusStyles: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-800',
  APPROVED:  'bg-emerald-100 text-emerald-800',
  REJECTED:  'bg-rose-100 text-rose-800',
  BOOKED:    'bg-indigo-100 text-indigo-800',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

const statusIcon: Record<string, React.ReactNode> = {
  PENDING:   <Clock size={11} className="inline mr-0.5" />,
  APPROVED:  <CheckCircle size={11} className="inline mr-0.5" />,
  REJECTED:  <XCircle size={11} className="inline mr-0.5" />,
  BOOKED:    <BookOpen size={11} className="inline mr-0.5" />,
  CANCELLED: <Ban size={11} className="inline mr-0.5" />,
}

export default function TravelPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // booking modal
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [bookingDetails, setBookingDetails] = useState('')

  // cancel modal
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')

  // new request form
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [purpose, setPurpose]         = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      setRequests(await travelService.list())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load travel requests.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim() || !startDate || !endDate || !purpose.trim()) return
    setSubmitting(true); setFormError(null)
    try {
      const req = await travelService.create({
        destination, startDate, endDate, purpose,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      })
      setRequests(prev => [req, ...prev])
      setDestination(''); setStartDate(''); setEndDate(''); setPurpose(''); setEstimatedCost('')
      setShowModal(false)
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to submit travel request.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bookingId || !bookingDetails.trim()) return
    try {
      const updated = await travelService.addBookingDetails(bookingId, bookingDetails)
      setRequests(prev => prev.map(r => r.id === bookingId ? updated : r))
      setBookingId(null); setBookingDetails('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to save booking details.')
    }
  }

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelId || !cancelReason.trim()) return
    try {
      const updated = await travelService.cancel(cancelId, cancelReason)
      setRequests(prev => prev.map(r => r.id === cancelId ? updated : r))
      setCancelId(null); setCancelReason('')
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Failed to cancel request.')
    }
  }

  const pending   = requests.filter(r => r.status === 'PENDING').length
  const approved  = requests.filter(r => r.status === 'APPROVED').length
  const booked    = requests.filter(r => r.status === 'BOOKED').length
  const cancelled = requests.filter(r => r.status === 'CANCELLED').length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Plane size={14} /> Corporate Travel Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Travel Requests &amp; Booking Management</h1>
          <p className="text-slate-300 text-sm mt-1">Raise travel requests, track approvals, attach booking details, and manage cancellations.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> New Travel Request
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approval', value: pending,   color: 'text-amber-600',  sub: 'Awaiting manager sign-off' },
          { label: 'Approved',         value: approved,  color: 'text-emerald-600', sub: 'Ready for booking' },
          { label: 'Booked',           value: booked,    color: 'text-indigo-600',  sub: 'Tickets & hotels confirmed' },
          { label: 'Cancelled',        value: cancelled, color: 'text-slate-500',   sub: 'Withdrawn or denied' },
        ].map(m => (
          <div key={m.label} className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
            <span className="text-muted text-xs font-medium">{m.label}</span>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            <span className={`text-[11px] font-semibold mt-1 inline-block ${m.color}`}>{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted text-sm gap-2">
            <RefreshCw size={16} className="animate-spin" /> Loading travel requests…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No travel requests found. Click <strong>New Travel Request</strong> to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Est. Cost</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Booking</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-wash/30 transition">
                    <td className="p-3 font-semibold text-ink">{r.destination}</td>
                    <td className="p-3 text-muted">{r.employeeName ?? '—'}</td>
                    <td className="p-3 text-muted">{r.startDate} → {r.endDate}</td>
                    <td className="p-3 text-muted max-w-[180px] truncate">{r.purpose}</td>
                    <td className="p-3 font-medium text-ink">
                      {r.estimatedCost ? `₹${r.estimatedCost.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyles[r.status] ?? ''}`}>
                        {statusIcon[r.status]}{r.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-muted max-w-[160px]">
                      {r.bookingDetails ? (
                        <span className="text-indigo-700 font-medium line-clamp-1">{r.bookingDetails}</span>
                      ) : r.cancellationReason ? (
                        <span className="text-rose-600">⚠ {r.cancellationReason}</span>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status === 'APPROVED' && (
                          <button
                            onClick={() => { setBookingId(r.id); setBookingDetails('') }}
                            className="px-2 py-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                          >
                            Add Booking
                          </button>
                        )}
                        {(r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'BOOKED') && (
                          <button
                            onClick={() => { setCancelId(r.id); setCancelReason('') }}
                            className="px-2 py-1 text-[10px] font-bold bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Travel Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">New Travel Request</h3>
            {formError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Destination</label>
                <input required placeholder="e.g. Mumbai, Maharashtra" value={destination}
                  onChange={e => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Departure Date</label>
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Return Date</label>
                  <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Purpose of Travel</label>
                <textarea required rows={2} placeholder="e.g. Client meeting and product demo" value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Estimated Cost (₹) <span className="font-normal text-muted">(optional)</span></label>
                <input type="number" min="0" placeholder="e.g. 15000" value={estimatedCost}
                  onChange={e => setEstimatedCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {bookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Add Booking Details</h3>
            <form onSubmit={handleBooking} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Booking Reference &amp; Details</label>
                <textarea required rows={3} placeholder="e.g. IndiGo 6E-302 | Hotel Royal Orchid #B3421" value={bookingDetails}
                  onChange={e => setBookingDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setBookingId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold">Cancel</button>
                <button type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm">Save Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Cancel Travel Request</h3>
            <form onSubmit={handleCancel} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Reason for Cancellation</label>
                <textarea required rows={3} placeholder="e.g. Meeting rescheduled by client." value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setCancelId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold">Keep Request</button>
                <button type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-sm">Confirm Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
