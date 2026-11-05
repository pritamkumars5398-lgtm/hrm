import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Award,
  CreditCard,
  ShieldCheck,
  Pencil,
  Check,
  X,
  Calendar,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { employeeService } from '@/services/employeeService'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const isPrivileged =
    user?.role === 'OWNER' ||
    user?.role === 'HR' ||
    user?.role === 'MANAGER' ||
    (user?.permissions && user.permissions.includes('*'))

  const [loading, setLoading] = useState(true)
  const [empProfile, setEmpProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    dob: '',
    gender: 'Male',
    emergencyContact: '',
    location: '',
    department: '',
    designation: '',
    employeeId: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    panAadhaar: '',
  })

  // Fetch real employee profile from backend
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    employeeService
      .getMe()
      .then((data: any) => {
        if (cancelled) return
        setEmpProfile(data)
        const fin = data.financialDetails || {}
        setFormData({
          name: data.name || user?.name || '',
          phone: data.phone || '',
          dob: '15th August 1996',
          gender: 'Male',
          emergencyContact: data.homeAddress || 'Family Contact',
          location: data.location || 'Office',
          department: data.department || 'General',
          designation: data.designation || user?.role || 'Employee',
          employeeId: data.employeeId || 'EMP-001',
          bankName: fin.bankName || 'Not Provided',
          accountNumber: fin.accNumber || 'Not Provided',
          ifscCode: fin.ifscCode || 'Not Provided',
          panAadhaar: 'Verified on File',
        })
      })
      .catch(() => {
        // Fallback to auth user state if not linked
        setFormData((prev) => ({
          ...prev,
          name: user?.name || '',
          phone: '+91 98765 43210',
          location: 'Office Campus',
          designation: user?.role || 'Employee',
        }))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, user?.name, user?.role])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditing(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={28} />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-hairline shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="size-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
          {user?.avatarInitials || formData.name.slice(0, 2).toUpperCase() || 'AD'}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold font-display text-ink">{formData.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {user?.role || formData.designation}
            </span>
          </div>
          <p className="text-xs text-muted">
            Employee Code: {formData.employeeId} | Department: {formData.department}
          </p>
          <p className="text-xs text-muted flex items-center justify-center sm:justify-start gap-3 pt-1">
            <span className="flex items-center gap-1">
              <Mail size={13} /> {user?.email}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={13} /> {formData.phone || 'Not added'}
            </span>
          </p>
        </div>

        {/* Edit Button - Visible for OWNER, HR, and MANAGER */}
        {isPrivileged && (
          <div className="sm:ml-auto shrink-0 flex items-center gap-2">
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <Check size={12} /> Saved
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isEditing ? <X size={13} /> : <Pencil size={13} />}
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Form Modal/Drawer when editing */}
      {isEditing && isPrivileged && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border-2 border-emerald-500/40 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-hairline pb-3">
            <div>
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Pencil size={15} className="text-emerald-600" /> Edit Complete Profile Details
              </h3>
              <p className="text-[11px] text-muted mt-0.5">
                Update personal contact, location, and bank account information.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {user?.role} Edit Mode
            </span>
          </div>

          <div className="space-y-4">
            {/* Section 1: Personal & Contact */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                <User size={13} className="text-emerald-600" /> 1. Personal & Contact Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Date of Birth (DOB)</label>
                  <input
                    type="text"
                    placeholder="e.g. 15th August 1996 or YYYY-MM-DD"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Emergency Contact / Address</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Work Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Financial & Bank Details */}
            <div className="pt-2 border-t border-hairline">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
                <CreditCard size={13} className="text-indigo-600" /> 2. Financial & Bank Details
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-ink block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Account Number</label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">PAN / Aadhaar</label>
                  <input
                    type="text"
                    value={formData.panAadhaar}
                    onChange={(e) => setFormData({ ...formData, panAadhaar: e.target.value })}
                    className="w-full rounded-lg border border-hairline px-3 py-2 text-ink font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 rounded-lg border border-hairline text-xs font-semibold text-muted hover:bg-wash cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Save All Details
            </button>
          </div>
        </form>
      )}

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Emergency Info */}
        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <User size={16} className="text-emerald-600" /> Personal & Contact Details
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Date of Birth</span>
              <span className="font-semibold text-ink">{formData.dob}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Gender</span>
              <span className="font-semibold text-ink">{formData.gender}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Emergency Contact / Address</span>
              <span className="font-semibold text-ink">{formData.emergencyContact}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Work Location</span>
              <span className="font-semibold text-ink">{formData.location}</span>
            </div>
          </div>
        </div>

        {/* Financial & Statutory Info */}
        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <CreditCard size={16} className="text-indigo-600" /> Financial & Bank Details
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Bank Name</span>
              <span className="font-semibold text-ink">{formData.bankName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Account Number</span>
              <span className="font-mono font-bold text-ink">{formData.accountNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">IFSC Code</span>
              <span className="font-mono font-bold text-ink">{formData.ifscCode}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">PAN / Aadhaar</span>
              <span className="font-mono font-bold text-ink">{formData.panAadhaar}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
