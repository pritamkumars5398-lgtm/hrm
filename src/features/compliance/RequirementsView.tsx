import { useEffect, useState } from 'react'
import { ShieldCheck, Plus, Scale, Tag, User, HelpCircle } from 'lucide-react'
import { complianceService } from './complianceService'
import type { ComplianceRequirement } from './complianceService'

export default function RequirementsView() {
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  // Form states
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<'DOCUMENT' | 'POLICY' | 'TRAINING' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'ONBOARDING'>('DOCUMENT')
  const [mandatory, setMandatory] = useState(true)
  const [frequency, setFrequency] = useState<'ONCE' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'>('ONCE')
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('LOW')
  const [evidenceRequired, setEvidenceRequired] = useState(false)
  const [verificationRequired, setVerificationRequired] = useState(false)
  const [applicabilityRules, setApplicabilityRules] = useState('{}')

  const fetchRequirements = () => {
    setLoading(true)
    complianceService.getRequirements()
      .then(setRequirements)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRequirements()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !name) return

    complianceService.createRequirement({
      code,
      name,
      description,
      category,
      mandatory,
      frequency,
      riskLevel,
      evidenceRequired,
      verificationRequired,
      applicabilityRules,
    })
      .then(() => {
        setShowAddModal(false)
        fetchRequirements()
        // Reset form
        setCode('')
        setName('')
        setDescription('')
        setCategory('DOCUMENT')
        setMandatory(true)
        setFrequency('ONCE')
        setRiskLevel('LOW')
        setEvidenceRequired(false)
        setVerificationRequired(false)
        setApplicabilityRules('{}')
      })
      .catch(console.error)
  }

  if (loading && requirements.length === 0) {
    return <div className="p-8 text-center text-muted text-xs animate-pulse">Loading compliance requirements...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-ink">Regulatory Compliance Requirements</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl cursor-pointer text-xs shadow-sm transition"
        >
          <Plus size={14} /> Add Requirement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requirements.length === 0 ? (
          <div className="p-6 text-center text-muted text-xs col-span-full bg-white rounded-2xl border border-hairline shadow-sm">
            No compliance requirements defined yet. Click "Add Requirement" to create one.
          </div>
        ) : (
          requirements.map(req => (
            <div key={req.id} className="bg-white p-5 rounded-2xl border border-hairline shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-cyan-600 uppercase">
                  <span className="flex items-center gap-1"><Scale size={11} /> {req.category}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                    req.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                    req.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    req.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {req.riskLevel} Risk
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink mt-3">{req.name}</h4>
                <p className="text-xs text-muted mt-1">{req.description || 'No description provided.'}</p>
              </div>

              <div className="border-t border-hairline pt-3 flex items-center justify-between text-[11px] text-muted font-medium">
                <span>Code: <strong className="text-ink font-semibold">{req.code}</strong></span>
                <span>Frequency: <strong className="text-ink font-semibold">{req.frequency}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-hairline shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold font-display text-ink border-b border-hairline pb-3">Create Compliance Requirement</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink">Requirement Code</label>
                <input
                  type="text"
                  placeholder="e.g. EPF-ECR-01"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none bg-white"
                >
                  <option value="DOCUMENT">Document Submission</option>
                  <option value="POLICY">Policy Acknowledgement</option>
                  <option value="TRAINING">Mandatory LMS Course</option>
                  <option value="ATTENDANCE">Attendance Punches</option>
                  <option value="LEAVE">Leave Planner Policy</option>
                  <option value="PAYROLL">Payroll Limits</option>
                  <option value="ONBOARDING">Digital Onboarding Tasks</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink">Requirement Name</label>
              <input
                type="text"
                placeholder="e.g. EPF Monthly Return Submission"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink">Description</label>
              <textarea
                placeholder="Enter details about this compliance obligation..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink">Frequency</label>
                <select
                  value={frequency}
                  onChange={e => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none bg-white"
                >
                  <option value="ONCE">Once (One-time)</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="ANNUALLY">Annually</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-ink">Risk Level</label>
                <select
                  value={riskLevel}
                  onChange={e => setRiskLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-ink font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={evidenceRequired}
                  onChange={e => setEvidenceRequired(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                /> Evidence Required
              </label>

              <label className="flex items-center gap-2 text-xs text-ink font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={verificationRequired}
                  onChange={e => setVerificationRequired(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500"
                /> Manager Verification Required
              </label>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink flex items-center gap-1">
                Applicability Rules (JSON) <HelpCircle size={12} className="text-muted" title="JSON criteria match: e.g. {&quot;location&quot;:&quot;London&quot;}" />
              </label>
              <input
                type="text"
                placeholder="{}"
                value={applicabilityRules}
                onChange={e => setApplicabilityRules(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-hairline focus:border-cyan-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-hairline">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-hairline rounded-xl text-xs font-bold text-muted hover:bg-wash transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Save Requirement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
