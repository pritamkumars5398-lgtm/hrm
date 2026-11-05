import { useState, useEffect, useCallback } from 'react'
import {
  Plane,
  Plus,
  Search,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import {
  travelService,
  type TravelRequest,
  type CreateTravelPayload,
} from '../../services/travelService'

export default function TravelPage() {
  const [requests, setRequests] = useState<TravelRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | TravelRequest['status']>('ALL')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [purpose, setPurpose] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [hotelDetails, setHotelDetails] = useState('')

  const fetchTravel = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await travelService.getAll(statusFilter)
      setRequests(data)
    } catch (err: unknown) {
      console.error('Failed to load travel requests:', err)
      setError('Failed to fetch travel requests. Please check backend connection.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchTravel()
  }, [fetchTravel])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination || !startDate || !endDate || !purpose || !estimatedCost) return
    try {
      setSubmitting(true)
      const payload: CreateTravelPayload = {
        destination,
        startDate,
        endDate,
        purpose,
        estimatedCost: Number(estimatedCost),
        hotelDetails: hotelDetails.trim() || undefined,
      }
      await travelService.create(payload)
      setShowModal(false)
      // reset form
      setDestination('')
      setStartDate('')
      setEndDate('')
      setPurpose('')
      setEstimatedCost('')
      setHotelDetails('')
      await fetchTravel()
    } catch (err: unknown) {
      console.error('Failed to submit travel request:', err)
      alert('Could not submit travel request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (
    id: string,
    newStatus: TravelRequest['status'],
  ) => {
    try {
      await travelService.updateStatus(id, newStatus)
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
      )
    } catch (err: unknown) {
      console.error('Failed to update status:', err)
      alert('Status update failed.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this travel request?')) return
    try {
      await travelService.delete(id)
      setRequests((prev) => prev.filter((r) => r.id !== id))
    } catch (err: unknown) {
      console.error('Failed to delete travel request:', err)
      alert('Delete failed.')
    }
  }

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.destination.toLowerCase().includes(search.toLowerCase()) ||
      r.purpose.toLowerCase().includes(search.toLowerCase()) ||
      r.employee.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

  // Metrics
  const totalCost = requests.reduce((acc, r) => acc + (r.estimatedCost || 0), 0)
  const bookedCount = requests.filter((r) => r.status === 'BOOKED').length
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white p-6 rounded-2xl border border-sky-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Plane size={14} /> Corporate Travel & Itinerary Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Corporate Travel Desk</h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage employee travel authorizations, hotel bookings, flight itineraries, and budget approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTravel}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-2.5 rounded-xl transition text-xs border border-white/10"
            title="Refresh requests"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
          >
            <Plus size={16} /> New Travel Request
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
            onClick={fetchTravel}
            className="font-bold underline cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Total Requests</span>
            <Plane size={14} className="text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-ink mt-1">{requests.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Active itineraries</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Pending Approvals</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Awaiting Manager Review</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Booked / Completed</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{bookedCount + approvedCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Tickets & Vouchers Issued</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-xs">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Estimated Budget</span>
            <TrendingUp size={14} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-ink mt-1">₹{totalCost.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Current fiscal cycle</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-hairline shadow-xs p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'BOOKED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-wash/60 text-muted hover:bg-wash'
              }`}
            >
              {status === 'ALL' ? 'All Requests' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search destination, employee, purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-sky-500 focus:outline-none bg-wash/30"
          />
        </div>
      </div>

      {/* Travel Requests Table / Cards */}
      <div className="bg-white rounded-xl border border-hairline shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-sky-600" />
            Loading travel itineraries...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted space-y-2">
            <Plane size={36} className="mx-auto text-slate-300" />
            <p className="font-semibold text-ink">No travel requests found</p>
            <p className="text-[11px]">Submit a new travel request or adjust your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash/80 border-b border-hairline text-muted font-semibold uppercase text-[10px]">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Destination & Purpose</th>
                  <th className="p-3.5">Travel Dates</th>
                  <th className="p-3.5">Hotel / Stay</th>
                  <th className="p-3.5">Estimated Cost</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-wash/30 transition">
                    <td className="p-3.5 font-semibold text-ink">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">
                          {req.employee.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div>{req.employee}</div>
                          <span className="text-[10px] text-muted font-normal">Requester</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-ink flex items-center gap-1.5">
                        <MapPin size={13} className="text-sky-600 shrink-0" />
                        {req.destination}
                      </div>
                      <div className="text-[11px] text-muted truncate max-w-xs mt-0.5">
                        {req.purpose}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 font-mono text-[11px] text-ink">
                        <Calendar size={12} className="text-muted" />
                        {req.startDate} → {req.endDate}
                      </div>
                    </td>
                    <td className="p-3.5 text-muted">
                      {req.hotelDetails ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Building size={12} className="text-slate-400" />
                          <span className="truncate max-w-[140px]">{req.hotelDetails}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">Not Specified</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold font-mono text-ink">
                      ₹{req.estimatedCost.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'BOOKED'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'BOOKED' && <CheckCircle2 size={10} />}
                        {req.status === 'APPROVED' && <FileCheck2 size={10} />}
                        {req.status === 'REJECTED' && <XCircle size={10} />}
                        {req.status === 'PENDING' && <Clock size={10} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(
                              req.id,
                              e.target.value as TravelRequest['status'],
                            )
                          }
                          className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approve</option>
                          <option value="BOOKED">Mark Booked</option>
                          <option value="REJECTED">Reject</option>
                        </select>
                        <button
                          onClick={() => handleDelete(req.id)}
                          title="Delete Request"
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
          <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <Plane size={18} className="text-sky-600" />
                Submit Travel Authorization Request
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-ink font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs mt-4">
              <div>
                <label className="block text-muted font-semibold mb-1">Destination & City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai (BOM) - Head Office Visit"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Business Purpose</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Client presentation for Q3 SaaS agreement renewal"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-sky-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="25000"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Preferred Hotel / Stay</label>
                  <input
                    type="text"
                    placeholder="e.g. Marriott Juhu"
                    value={hotelDetails}
                    onChange={(e) => setHotelDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-sky-500 focus:outline-none"
                  />
                </div>
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
                  className="px-5 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-500 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
