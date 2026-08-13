import { useState, useEffect, useCallback } from 'react'
import {
  Laptop, Plus, Search, Loader2, AlertCircle,
  Trash2, UserCheck, Wrench, ArchiveX, PackageCheck, X, CheckCircle
} from 'lucide-react'
import { assetService, type Asset } from '@/services/assetService'
import { employeeService } from '@/services/employeeService'
import { useAuthStore } from '@/features/auth/store/authStore'

const CATEGORIES: Asset['category'][] = [
  'Laptop', 'Desktop', 'Monitor', 'Mobile', 'Tablet',
  'ID Card', 'Access Card', 'Furniture', 'Vehicle', 'SIM', 'Accessory', 'License'
]

const STATUS_META: Record<Asset['status'], { label: string; cls: string; Icon: React.ElementType }> = {
  AVAILABLE: { label: 'Available', cls: 'bg-blue-100 text-blue-800', Icon: PackageCheck },
  ASSIGNED: { label: 'Assigned', cls: 'bg-emerald-100 text-emerald-800', Icon: UserCheck },
  REPAIR: { label: 'In Repair', cls: 'bg-amber-100 text-amber-800', Icon: Wrench },
  RETIRED: { label: 'Retired', cls: 'bg-slate-100 text-slate-600', Icon: ArchiveX },
}

function canManage(permissions: string[]) {
  return permissions.includes('*') || permissions.includes('assets.manage') || permissions.includes('employees.manage')
}

export default function AssetsPage() {
  const user = useAuthStore((s) => s.user)
  const isManager = user ? canManage(user.permissions) : false

  const [assets, setAssets] = useState<Asset[]>([])
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add modal
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addCategory, setAddCategory] = useState<Asset['category']>('Laptop')
  const [addSerial, setAddSerial] = useState('')
  const [addTag, setAddTag] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Assign modal
  const [assignId, setAssignId] = useState<string | null>(null)
  const [assignEmpId, setAssignEmpId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      if (isManager) {
        const [list, emps] = await Promise.all([
          assetService.listAssets(),
          employeeService.getAll({ pageSize: 1000 }, 'ACTIVE'),
        ])
        setAssets(list)
        setEmployees(emps.rows.map((e: any) => ({ id: e.id, firstName: e.firstName, lastName: e.lastName })))
      } else {
        const myAssets = await assetService.listMyAssets()
        setAssets(myAssets)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load asset inventory.')
    } finally {
      setLoading(false)
    }
  }, [isManager])

  useEffect(() => { load() }, [load])

  // ── Add asset ─────────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true); setAddError(null)
    try {
      const a = await assetService.createAsset({
        name: addName.trim(),
        category: addCategory,
        serialNumber: addSerial.trim() || undefined,
        assetTag: addTag.trim() || undefined,
      })
      setAssets(prev => [a, ...prev])
      setAddName(''); setAddSerial(''); setAddTag(''); setAddCategory('Laptop'); setShowAdd(false)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add asset.')
    } finally {
      setAdding(false)
    }
  }

  // ── Status quick-change (non-ASSIGNED) ────────────────────────────────────
  const handleStatus = async (id: string, status: Asset['status']) => {
    if (status === 'ASSIGNED') { setAssignId(id); setAssignEmpId(''); return }
    try {
      const updated = await assetService.updateAssetStatus(id, status)
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Status update failed.')
    }
  }

  // ── Assign modal submit ────────────────────────────────────────────────────
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignId || !assignEmpId) return
    setAssigning(true); setAssignError(null)
    try {
      const updated = await assetService.updateAssetStatus(assignId, 'ASSIGNED', assignEmpId)
      const emp = employees.find(e => e.id === assignEmpId)
      setAssets(prev => prev.map(a => a.id === assignId
        ? { ...a, status: 'ASSIGNED', assignedToId: assignEmpId, assignedTo: emp ? `${emp.firstName} ${emp.lastName}` : 'Assigned' }
        : a
      ))
      setAssignId(null)
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : 'Assignment failed.')
    } finally {
      setAssigning(false)
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete asset "${name}"? This cannot be undone.`)) return
    try {
      await assetService.deleteAsset(id)
      setAssets(prev => prev.filter(a => a.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  const filtered = assets.filter(a =>
    [a.name, a.assetTag, a.assignedTo, a.category].some(v =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Laptop size={14} /> IT &amp; Company Asset Control
          </div>
          <h1 className="text-2xl font-bold font-display">
            {isManager ? 'Asset Inventory & Allocations' : 'My Assigned Company Assets'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {isManager
              ? 'Track hardware devices, IT accounts, software licenses, and repair requests.'
              : 'View devices and accessories currently issued to you.'}
          </p>
        </div>
        {isManager && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer text-xs shadow-md shrink-0"
          >
            <Plus size={16} /> Add New Asset
          </button>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['AVAILABLE', 'ASSIGNED', 'REPAIR', 'RETIRED'] as Asset['status'][]).map(s => {
          const m = STATUS_META[s]
          const count = assets.filter(a => a.status === s).length
          return (
            <div key={s} className="bg-white p-4 rounded-xl border border-hairline shadow-2xs">
              <span className="text-muted text-xs font-medium">{m.label}</span>
              <p className="text-2xl font-bold text-ink mt-1">{count}</p>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded ${m.cls}`}>
                <m.Icon size={10} /> {s}
              </span>
            </div>
          )
        })}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-hairline shadow-2xs p-4 space-y-4">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search name, tag, category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:border-blue-400 focus:outline-none bg-wash/30"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-muted text-sm">
            <Loader2 size={18} className="animate-spin text-blue-500" /> Loading inventory…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-rose-600 text-sm py-8 justify-center">
            <AlertCircle size={16} /> {error}
            <button onClick={load} className="ml-2 underline text-xs">Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-muted text-sm">
            {assets.length === 0 ? (
              <>
                <Laptop size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-ink">
                  {isManager ? 'No assets in inventory' : 'No assets currently assigned to you'}
                </p>
                <p className="text-xs mt-1">
                  {isManager
                    ? 'Click Add New Asset to register your first device.'
                    : 'When IT or HR assigns a device to your profile, it will appear here.'}
                </p>
              </>
            ) : 'No assets match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-wash border-b border-hairline text-muted font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Asset Tag</th>
                  <th className="p-3">Name &amp; Serial</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Assigned To</th>
                  <th className="p-3">Status</th>
                  {isManager && <th className="p-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map(asset => {
                  const meta = STATUS_META[asset.status]
                  return (
                    <tr key={asset.id} className="hover:bg-wash/30 transition group">
                      <td className="p-3 font-mono font-bold text-blue-600">{asset.assetTag}</td>
                      <td className="p-3">
                        <div className="font-semibold text-ink">{asset.name}</div>
                        <div className="text-[10px] text-muted font-mono">{asset.serialNumber || '—'}</div>
                      </td>
                      <td className="p-3 text-muted">{asset.category}</td>
                      <td className="p-3 font-medium text-ink">
                        {asset.status === 'ASSIGNED' ? asset.assignedTo : <span className="text-muted">—</span>}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.cls}`}>
                          <meta.Icon size={10} /> {meta.label}
                        </span>
                      </td>
                      {isManager && (
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <select
                              value={asset.status}
                              onChange={e => handleStatus(asset.id, e.target.value as Asset['status'])}
                              className="text-[10px] font-semibold bg-wash border border-hairline rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                            >
                              <option value="AVAILABLE">Available</option>
                              <option value="ASSIGNED">Assign…</option>
                              <option value="REPAIR">Send to Repair</option>
                              <option value="RETIRED">Retire</option>
                            </select>
                            <button
                              onClick={() => handleDelete(asset.id, asset.name)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">Add IT Asset</h3>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-wash cursor-pointer"><X size={16} /></button>
            </div>
            {addError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {addError}
              </div>
            )}
            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Asset Name *</label>
                <input required placeholder="e.g. MacBook Pro M3 16&quot;" value={addName}
                  onChange={e => setAddName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Category *</label>
                  <select value={addCategory} onChange={e => setAddCategory(e.target.value as Asset['category'])}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-400 focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Asset Tag <span className="font-normal text-muted">(opt.)</span></label>
                  <input placeholder="e.g. AST-LAP-99" value={addTag}
                    onChange={e => setAddTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-muted font-semibold mb-1">Serial No. <span className="font-normal text-muted">(opt.)</span></label>
                <input placeholder="e.g. C02GX001XYZ" value={addSerial}
                  onChange={e => setAddSerial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold cursor-pointer"
                >Cancel</button>
                <button type="submit" disabled={adding}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {adding ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
                  {adding ? 'Adding…' : 'Add Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {assignId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink">Assign Asset to Employee</h3>
              <button onClick={() => setAssignId(null)} className="p-1 rounded-lg hover:bg-wash cursor-pointer"><X size={16} /></button>
            </div>
            {assignError && (
              <div className="mb-3 flex items-center gap-2 text-rose-600 text-xs bg-rose-50 p-3 rounded-lg border border-rose-200">
                <AlertCircle size={14} /> {assignError}
              </div>
            )}
            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Select Employee *</label>
                {employees.length === 0 ? (
                  <p className="text-rose-600 text-xs">No active employees found.</p>
                ) : (
                  <select required value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">— Choose employee —</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAssignId(null)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold cursor-pointer"
                >Cancel</button>
                <button type="submit" disabled={assigning || !assignEmpId}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-sm disabled:opacity-60 cursor-pointer"
                >
                  {assigning ? <Loader2 size={14} className="animate-spin inline mr-1" /> : <CheckCircle size={14} className="inline mr-1" />}
                  {assigning ? 'Assigning…' : 'Assign Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
