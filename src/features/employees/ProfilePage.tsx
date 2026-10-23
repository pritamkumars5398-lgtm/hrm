import { useState } from 'react'
import { User, Mail, Phone, MapPin, Building, GraduationCap, Award, CreditCard, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function ProfilePage() {
  const user = useAuthStore(s => s.user)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-white p-6 rounded-2xl border border-hairline shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="size-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
          {user?.avatarInitials || 'PS'}
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl font-bold font-display text-ink">{user?.name || 'Priya Sharma'}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {user?.role || 'HR Manager'}
            </span>
          </div>
          <p className="text-xs text-muted">Employee Code: EMP-2026-0892 | Department: Human Resources</p>
          <p className="text-xs text-muted flex items-center justify-center sm:justify-start gap-3 pt-1">
            <span className="flex items-center gap-1"><Mail size={13} /> {user?.email || 'priya@company.com'}</span>
            <span className="flex items-center gap-1"><Phone size={13} /> +91 98765 43210</span>
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
              <span className="text-muted">Date of Birth</span>
              <span className="font-semibold text-ink">14th March 1994</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Gender</span>
              <span className="font-semibold text-ink">Female</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Emergency Contact</span>
              <span className="font-semibold text-ink">Ramesh Sharma (Father) - 9876543211</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">Work Location</span>
              <span className="font-semibold text-ink">Bengaluru Tech Park Campus</span>
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
              <span className="font-semibold text-ink">HDFC Bank Ltd</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">Account Number</span>
              <span className="font-mono font-bold text-ink">50100982341234</span>
            </div>
            <div className="flex justify-between py-1 border-b border-hairline">
              <span className="text-muted">IFSC Code</span>
              <span className="font-mono font-bold text-ink">HDFC0001234</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted">PAN / Aadhaar</span>
              <span className="font-mono font-bold text-ink">ABCDE1234F / XXXX-8912</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
