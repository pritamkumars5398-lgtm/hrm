import { useState, useEffect } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  Upload,
  DollarSign,
  AlertCircle,
  Trash2,
  X,
} from 'lucide-react'
import { expensesService, type Expense } from '@/services/expensesService'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Expense['category']>('Travel')

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await expensesService.getAll()
      setExpenses(data)
    } catch (err) {
      console.warn('Backend expenses load fallback', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount || submitting) return

    setSubmitting(true)
    try {
      const created = await expensesService.create({
        title: title.trim(),
        category,
        amount: parseFloat(amount),
        receiptName: `${category.toLowerCase()}_receipt.pdf`,
      })

      setExpenses([created, ...expenses])
      setTitle('')
      setAmount('')
      setShowModal(false)
    } catch (err) {
      console.error('Failed to submit claim', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatus = async (id: string, newStatus: Expense['status']) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    )
    try {
      await expensesService.updateStatus(id, newStatus)
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete expense claim "${title}"?`)) return
    try {
      await expensesService.delete(id)
      setExpenses((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      console.error('Failed to delete claim', err)
    }
  }

  const filtered = expenses.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.employee.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase()),
  )

  const totalSubmitted = expenses
    .filter((e) => e.status === 'SUBMITTED')
    .reduce((a, b) => a + b.amount, 0)
  const totalReimbursed = expenses
    .filter((e) => e.status === 'REIMBURSED')
    .reduce((a, b) => a + b.amount, 0)
  const approvedUnpaid = expenses
    .filter((e) => e.status === 'APPROVED')
    .reduce((a, b) => a + b.amount, 0)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white p-6 rounded-2xl border border-purple-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard size={14} /> Finance & Expense Claims Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Expense Reimbursements</h1>
          <p className="text-slate-300 text-sm mt-1">
            Submit receipts, manage multi-tier approvals, and track disbursal status.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> File New Claim
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Pending Approvals</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">₹{totalSubmitted.toLocaleString()}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">
            {expenses.filter((e) => e.status === 'SUBMITTED').length} Claims Pending
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Reimbursed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            ₹{totalReimbursed.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
            Disbursed to Bank
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Approved Unpaid</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">₹{approvedUnpaid.toLocaleString()}</p>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 inline-block">
            Queued for Next Payroll
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4 space-y-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search claim, employee, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-purple-500 focus:outline-none bg-wash/30"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Claim Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Employee</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Receipt</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-wash/30 transition">
                  <td className="p-3 font-semibold text-ink">{e.title}</td>
                  <td className="p-3 text-muted">{e.category}</td>
                  <td className="p-3 font-medium text-ink">{e.employee}</td>
                  <td className="p-3 text-muted">{e.date}</td>
                  <td className="p-3 font-bold text-ink">₹{e.amount.toLocaleString()}</td>
                  <td className="p-3 text-indigo-600 font-medium cursor-pointer hover:underline">
                    <FileText size={14} className="inline mr-1" /> {e.receiptName}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        e.status === 'REIMBURSED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : e.status === 'APPROVED'
                            ? 'bg-purple-100 text-purple-800'
                            : e.status === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={e.status}
                        onChange={(ev) =>
                          handleStatus(e.id, ev.target.value as Expense['status'])
                        }
                        className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="SUBMITTED">Pending</option>
                        <option value="APPROVED">Approve Claim</option>
                        <option value="REIMBURSED">Mark Reimbursed</option>
                        <option value="REJECTED">Reject Claim</option>
                      </select>
                      <button
                        onClick={() => handleDelete(e.id, e.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Claim"
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
      </div>

      {/* Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">File Expense Reimbursement</h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taxi Fare to Client Site"
                  value={title}
                  onChange={(ev) => setTitle(ev.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(ev) => setCategory(ev.target.value as Expense['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Fuel">Fuel</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Client Dinner">Client Dinner</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(ev) => setAmount(ev.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Upload Receipt (PDF/Image)</label>
                <div className="border-2 border-dashed border-hairline p-4 rounded-xl text-center text-muted hover:border-purple-500 transition cursor-pointer">
                  <Upload size={20} className="mx-auto mb-1 text-purple-500" />
                  <span className="font-semibold">Drag receipt here or click to browse</span>
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
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
