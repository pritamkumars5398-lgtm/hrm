import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Building, GraduationCap, Award, CreditCard, ShieldCheck, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { apiClient } from '@/services/apiClient'

type EmployeeProfile = {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  department: string
  designation: string
  location: string
  joinedAt: string
  homeAddress: string
  financialDetails?: {
    accName: string
    accNumber: string
    bankName: string
    ifscCode: string
  } | null
}

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    apiClient.get<EmployeeProfile>('/employees/me')
      .then((res) => {
        setProfile(res.data)
      })
      .catch((err) => {
        console.error('Failed to load profile:', err)
        setError('Could not load your profile details from the server.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-xs text-muted">Loading profile details...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-12">
        <h3 className="font-bold text-red-800 mb-1">Error Loading Profile</h3>
        <p className="text-xs text-red-600 mb-4">{error || 'Your employee record could not be found.'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  const joinedDateStr = profile.joinedAt
    ? new Date(profile.joinedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-hairline shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="size-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
          {user?.avatarInitials || profile.firstName.slice(0, 1) + profile.lastName.slice(0, 1) || 'EMP'}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold font-display text-ink">{profile.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {profile.designation || user?.role || 'Employee'}
            </span>
          </div>
          <p className="text-xs text-muted">Employee Code: {profile.employeeId} | Department: {profile.department}</p>
          <p className="text-xs text-muted flex items-center justify-center sm:justify-start gap-3 pt-1">
            <span className="flex items-center gap-1"><Mail size={13} /> {profile.email}</span>
            {profile.phone && <span className="flex items-center gap-1"><Phone size={13} /> {profile.phone}</span>}
          </p>
        </div>
      </div>

      {/* Grid of Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Emergency Info */}
        <div className="bg-white p-5 rounded-2xl border border-hairline shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-ink flex items-center gap-2">
            <User size={16} className="text-emerald-600" /> Personal & Contact Details
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Joined Date</span>
              <span className="font-semibold text-ink">{joinedDateStr}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Home Address</span>
              <span className="font-semibold text-ink">{profile.homeAddress || 'Not provided'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Work Location</span>
              <span className="font-semibold text-ink">{profile.location || 'Office-Default'}</span>
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
              <span className="font-semibold text-ink">{profile.financialDetails?.bankName || 'Not configured'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Account Holder</span>
              <span className="font-semibold text-ink">{profile.financialDetails?.accName || 'Not configured'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Account Number</span>
              <span className="font-mono font-bold text-ink">{profile.financialDetails?.accNumber || 'Not configured'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">IFSC Code</span>
              <span className="font-mono font-bold text-ink">{profile.financialDetails?.ifscCode || 'Not configured'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
