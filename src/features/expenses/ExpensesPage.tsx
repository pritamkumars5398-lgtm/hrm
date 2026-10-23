import { useState } from 'react'
import { CreditCard, Plus, Search, Filter, CheckCircle, Clock, FileText, Upload, DollarSign, AlertCircle } from 'lucide-react'

type Expense = {
  id: string
  title: string
  category: 'Travel' | 'Food' | 'Fuel' | 'Hotel' | 'Client Dinner' | 'Misc'
  amount: number
  date: string
  employee: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED'
  receiptName: string
}

const INITIAL_EXPENSES: Expense[] = [
  { id: 'exp-1', title: 'Client Meeting Lunch - Tech Corp', category: 'Client Dinner', amount: 3450, date: '2026-08-02', employee: 'Rahul Mehta', status: 'REIMBURSED', receiptName: 'lunch_receipt.pdf' },
  { id: 'exp-2', title: 'Flight Ticket to Bengaluru Offsite', category: 'Travel', amount: 8200, date: '2026-08-04', employee: 'Priya Sharma', status: 'APPROVED', receiptName: 'flight_ticket.pdf' },
  { id: 'exp-3', title: 'Taxi Fare - Airport to Office', category: 'Fuel', amount: 950, date: '2026-08-05', employee: 'Ananya Verma', status: 'SUBMITTED', receiptName: 'cab_bill.png' },
]

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<Expense['category']>('Travel')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount) return
    const newE: Expense = {
      id: `exp-${Date.now()}`,
      title,
      category,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      employee: 'Priya Sharma',
      status: 'SUBMITTED',
      receiptName: 'uploaded_receipt.pdf'
    }
    setExpenses([newE, ...expenses])
    setTitle('')
    setAmount('')
    setShowModal(false)
  }

  const handleStatus = (id: string, newStatus: Expense['status']) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e))
  }

  const totalSubmitted = expenses.filter(e => e.status === 'SUBMITTED').reduce((a, b) => a + b.amount, 0)
  const totalReimbursed = expenses.filter(e => e.status === 'REIMBURSED').reduce((a, b) => a + b.amount, 0)

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-purple-950 text-white p-6 rounded-2xl border border-purple-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CreditCard size={14} /> Finance & Expense Claims Desk
          </div>
          <h1 className="text-2xl font-bold font-display">Employee Expense Reimbursements</h1>
          <p className="text-slate-300 text-sm mt-1">Submit receipts, manage multi-tier approvals, and track disbursal status.</p>
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
            {expenses.filter(e => e.status === 'SUBMITTED').length} Claims Pending
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Reimbursed</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalReimbursed.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Disbursed to Bank</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Approved Unpaid</span>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            ₹{expenses.filter(e => e.status === 'APPROVED').reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 inline-block">Queued for Next Payroll</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4">
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
              {expenses.map(e => (
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
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      e.status === 'REIMBURSED' ? 'bg-emerald-100 text-emerald-800' :
                      e.status === 'APPROVED' ? 'bg-purple-100 text-purple-800' :
                      e.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <select
                      value={e.status}
                      onChange={ev => handleStatus(e.id, ev.target.value as Expense['status'])}
                      className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="SUBMITTED">Pending</option>
                      <option value="APPROVED">Approve Claim</option>
                      <option value="REIMBURSED">Mark Reimbursed</option>
                      <option value="REJECTED">Reject Claim</option>
                    </select>
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
            <h3 className="text-lg font-bold text-ink mb-4">File Expense Reimbursement</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taxi Fare to Client Site"
                  value={title}
                  onChange={ev => setTitle(ev.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={ev => setCategory(ev.target.value as Expense['category'])}
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
                  <label className="block text-muted font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={ev => setAmount(ev.target.value)}
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
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-sm"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
