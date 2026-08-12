import { useState, useEffect } from 'react'
import { Laptop, Plus, Search, Filter, Wrench, CheckCircle, Clock, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react'
import { hasBackend } from '@/config/env'
import { assetService } from '@/services/assetService'
import { employeeService } from '@/services/employeeService'

type Asset = {
  id: string
  assetTag: string
  name: string
  category: 'Laptop' | 'Desktop' | 'Mobile' | 'SIM' | 'Accessory' | 'License'
  assignedTo: string
  assignedToId?: string | null
  status: 'AVAILABLE' | 'ASSIGNED' | 'REPAIR' | 'RETIRED'
  serialNumber?: string | null
}

const INITIAL_ASSETS: Asset[] = [
  { id: 'ast-1', assetTag: 'AST-MAC-01', name: 'MacBook Pro M3 Max 16"', category: 'Laptop', assignedTo: 'Priya Sharma', status: 'ASSIGNED', serialNumber: 'C02GX001XYZ' },
  { id: 'ast-2', assetTag: 'AST-DEL-04', name: 'Dell XPS 15 9530', category: 'Laptop', assignedTo: 'Rahul Mehta', status: 'ASSIGNED', serialNumber: 'DLXPS88721' },
  { id: 'ast-3', assetTag: 'AST-MON-09', name: 'Dell UltraSharp 27" 4K', category: 'Accessory', assignedTo: 'Unassigned', status: 'AVAILABLE', serialNumber: 'CN0981273' },
  { id: 'ast-4', assetTag: 'AST-PHN-02', name: 'iPhone 15 Pro 256GB', category: 'Mobile', assignedTo: 'Amit Kumar', status: 'REPAIR', serialNumber: 'F2LXYZ9812' },
]

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [employees, setEmployees] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Asset['category']>('Laptop')

  useEffect(() => {
    async function loadData() {
      if (hasBackend) {
        try {
          const list = await assetService.listAssets()
          setAssets(list.length > 0 ? list : INITIAL_ASSETS)
          const emps = await employeeService.listEmployees()
          setEmployees(emps)
        } catch (err) {
          console.error(err)
        }
      }
    }
    loadData()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      let newA: any
      if (hasBackend) {
        newA = await assetService.createAsset({
          name,
          category,
        })
      } else {
        newA = {
          id: `ast-${Date.now()}`,
          assetTag: `AST-${category.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
          name,
          category,
          assignedTo: 'Unassigned',
          status: 'AVAILABLE',
          serialNumber: `SN${Math.floor(100000 + Math.random() * 900000)}`,
        }
      }
      setAssets([newA, ...assets])
      setName('')
      setShowAddModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  const handleStatusChange = async (id: string, newStatus: Asset['status']) => {
    let assignedToId: string | undefined = undefined
    if (newStatus === 'ASSIGNED') {
      if (employees.length === 0) {
        alert('No employees found in the directory to assign the asset to.')
        return
      }
      const optionsStr = employees.map((e, idx) => `${idx + 1}. ${e.firstName} ${e.lastName} (ID: ${e.id})`).join('\n')
      const selection = prompt(`Select an employee number to assign:\n\n${optionsStr}`)
      if (!selection) return
      const idx = parseInt(selection) - 1
      if (idx >= 0 && idx < employees.length) {
        assignedToId = employees[idx].id
      } else {
        alert('Invalid employee selection.')
        return
      }
    }

    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const emp = employees.find(e => e.id === assignedToId)
        return {
          ...a,
          status: newStatus,
          assignedTo: emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned',
          assignedToId
        }
      }
      return a
    }))

    if (hasBackend) {
      try {
        await assetService.updateAssetStatus(id, newStatus, assignedToId)
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err))
      }
    }
  }

  const filtered = assets.filter(
    a => a.name.toLowerCase().includes(search.toLowerCase()) || a.assetTag.toLowerCase().includes(search.toLowerCase()) || a.assignedTo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Laptop size={14} /> IT & Company Asset Control
          </div>
          <h1 className="text-2xl font-bold font-display">Asset Inventory & Allocations</h1>
          <p className="text-slate-300 text-sm mt-1">Track hardware devices, IT accounts, software licenses, and repair requests.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md"
        >
          <Plus size={16} /> Add New Asset
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Total Assets</span>
          <p className="text-2xl font-bold text-ink mt-1">{assets.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">In Organization</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Assigned</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{assets.filter(a => a.status === 'ASSIGNED').length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Active with Employees</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Available Inventory</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{assets.filter(a => a.status === 'AVAILABLE').length}</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 inline-block">Ready to Allocate</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <span className="text-muted text-xs font-medium">Under Repair</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{assets.filter(a => a.status === 'REPAIR').length}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">IT Maintenance</span>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-xl border border-hairline shadow-sm p-4 space-y-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by tag, name, or employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-blue-500 focus:outline-none bg-wash/30"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Asset Tag</th>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map(asset => (
                <tr key={asset.id} className="hover:bg-wash/30 transition">
                  <td className="p-3 font-mono font-bold text-blue-600">{asset.assetTag}</td>
                  <td className="p-3 font-semibold text-ink">
                    <div>{asset.name}</div>
                    <div className="text-[10px] text-muted font-mono">{asset.serialNumber}</div>
                  </td>
                  <td className="p-3 text-muted">{asset.category}</td>
                  <td className="p-3 font-medium text-ink">{asset.assignedTo}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      asset.status === 'ASSIGNED' ? 'bg-emerald-100 text-emerald-800' :
                      asset.status === 'AVAILABLE' ? 'bg-blue-100 text-blue-800' :
                      asset.status === 'REPAIR' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <select
                      value={asset.status}
                      onChange={e => handleStatusChange(asset.id, e.target.value as Asset['status'])}
                      className="text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="AVAILABLE">Mark Available</option>
                      <option value="ASSIGNED">Mark Assigned</option>
                      <option value="REPAIR">Send to Repair</option>
                      <option value="RETIRED">Retire Asset</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Add IT Asset</h3>
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as Asset['category'])}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-500 focus:outline-none"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="SIM">SIM Card</option>
                  <option value="Accessory">Accessory</option>
                  <option value="License">Software License</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
