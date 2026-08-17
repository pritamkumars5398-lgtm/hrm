import { useState } from 'react'
import { ShieldCheck, LayoutDashboard, Scale, Users, AlertTriangle } from 'lucide-react'
import ComplianceDashboard from './ComplianceDashboard'
import RequirementsView from './RequirementsView'
import EmployeeComplianceList from './EmployeeComplianceList'
import ViolationsTracker from './ViolationsTracker'

type ActiveTab = 'overview' | 'requirements' | 'employees' | 'violations'

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')

  return (
    <div className="space-y-6">
      {/* Module Title / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2 text-ink">
            <ShieldCheck className="text-cyan-600" /> Compliance Governance Console
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Monitor organizational and employee compliance against statutory guidelines, labour laws, and internal policies.
          </p>
        </div>
      </div>

      {/* Tabs Sub-Navigation */}
      <div className="flex gap-2 border-b border-hairline pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'overview' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <LayoutDashboard size={14} /> Overview
        </button>

        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'requirements' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Scale size={14} /> Requirements
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'employees' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <Users size={14} /> Employee Compliance
        </button>

        <button
          onClick={() => setActiveTab('violations')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition whitespace-nowrap ${
            activeTab === 'violations' ? 'border-cyan-600 text-cyan-600' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          <AlertTriangle size={14} /> Violations
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && <ComplianceDashboard />}
        {activeTab === 'requirements' && <RequirementsView />}
        {activeTab === 'employees' && <EmployeeComplianceList />}
        {activeTab === 'violations' && <ViolationsTracker />}
      </div>
    </div>
  )
}
