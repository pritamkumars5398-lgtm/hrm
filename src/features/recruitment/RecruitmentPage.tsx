import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Plus,
  Users,
  Search,
  Filter,
  Sparkles,
  Calendar,
  FileCheck,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Building,
  UserCheck,
  Trash2,
} from 'lucide-react'
import { recruitmentService } from '@/services/recruitmentService'

type Job = {
  id: string
  title: string
  department: string
  location: string
  headcount: number
  applicantsCount: number
  status: 'OPEN' | 'DRAFT' | 'CLOSED'
  type: string
}

type Candidate = {
  id: string
  name: string
  email: string
  jobTitle: string
  stage: 'APPLIED' | 'SCREENED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED'
  aiScore: number
  experience: string
  appliedDate: string
}

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'jobs' | 'ai-match'>('pipeline')
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDept, setNewJobDept] = useState('Engineering')
  const [newJobLocation, setNewJobLocation] = useState('Remote / Bengaluru')
  const [newJobType, setNewJobType] = useState('Full-time')
  const [newJobHeadcount, setNewJobHeadcount] = useState(1)
  const [convertingId, setConvertingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const [fetchedJobs, fetchedApplications] = await Promise.all([
        recruitmentService.getJobs(),
        recruitmentService.getApplications(),
      ])

      setJobs(
          (fetchedJobs ?? []).map((j: any) => ({
            id: j.id,
            title: j.title,
            department: j.department,
            location: j.location,
            headcount: j.headcount ?? 1,
            applicantsCount: j.applicantCount ?? j.applicantsCount ?? 0,
            status: (j.status as 'OPEN' | 'DRAFT' | 'CLOSED') || 'OPEN',
            type: j.type ?? 'Full-time',
          })),
        )

      setCandidates(
          (fetchedApplications ?? []).map((a: any) => ({
            id: a.id,
            name: a.candidateName || a.name,
            email: a.email,
            jobTitle: a.jobTitle || 'Role',
            stage: (a.stage || a.status) as Candidate['stage'],
            aiScore: a.aiScore ?? 85,
            experience: a.experience || `${a.experienceYears ?? 0} yrs`,
            appliedDate: String(a.appliedDate || a.appliedAt || '').slice(0, 10),
          })),
        )
    } catch (err) {
      console.error('Recruitment fetch failed', err)
      setLoadError('Could not load jobs and candidates. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJobTitle.trim()) return

    try {
      const created = await recruitmentService.createJob({
        title: newJobTitle.trim(),
        department: newJobDept,
        location: newJobLocation,
        type: newJobType,
        headcount: Number(newJobHeadcount),
        status: 'OPEN',
      })

      const newJ: Job = {
        id: created.id,
        title: created.title,
        department: created.department,
        location: created.location,
        headcount: created.headcount ?? 1,
        applicantsCount: 0,
        status: (created.status as 'OPEN' | 'DRAFT' | 'CLOSED') || 'OPEN',
        type: created.type ?? 'Full-time',
      }
      setJobs([newJ, ...jobs])
      setNewJobTitle('')
      setShowNewJobModal(false)
    } catch (err) {
      console.error('Failed to create job', err)
      alert('Could not create the job requisition.')
    }
  }

  const handleDeleteJob = async (id: string, title: string) => {
    if (!window.confirm(`Delete requisition "${title}"?`)) return
    try {
      await recruitmentService.deleteJob(id)
      setJobs((prev) => prev.filter((j) => j.id !== id))
    } catch (err) {
      console.error('Failed to delete job', err)
    }
  }

  const handleStageChange = async (candId: string, newStage: Candidate['stage']) => {
    setCandidates((prev) => prev.map((c) => (c.id === candId ? { ...c, stage: newStage } : c)))
    try {
      await recruitmentService.updateApplication(candId, { status: newStage })
    } catch (err) {
      console.error('Failed to update stage in backend', err)
      alert('Could not update the candidate stage.')
      void loadData()
    }
  }

  const handleConvertToEmployee = async (candId: string, candName: string) => {
    if (!window.confirm(`Convert "${candName}" into an active employee in Employee Directory?`)) return
    try {
      setConvertingId(candId)
      await recruitmentService.convertToEmployee(candId)
      setCandidates((prev) =>
        prev.map((c) => (c.id === candId ? { ...c, stage: 'HIRED' } : c)),
      )
      alert(`🎉 ${candName} was hired and added to the employee directory!`)
    } catch (err) {
      console.error('Failed to convert candidate', err)
      alert('Could not convert candidate to employee.')
    } finally {
      setConvertingId(null)
    }
  }

  const filteredCandidates = candidates.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.jobTitle.toLowerCase().includes(search.toLowerCase())
  )

  const stages: Candidate['stage'][] = ['APPLIED', 'SCREENED', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED']

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 rounded-2xl border border-emerald-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <Sparkles size={14} /> AI-Powered ATS & Talent Engine
          </div>
          <h1 className="text-2xl font-bold font-display">Recruitment & Applicant Tracking</h1>
          <p className="text-emerald-100/70 text-sm mt-1">Manage requisitions, AI resume match scores, candidate pipelines, and automated offers.</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setShowNewJobModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg cursor-pointer text-xs"
          >
            <Plus size={16} /> Create Job Requisition
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Active Openings</span>
            <Briefcase size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-ink mt-2">{jobs.filter(j => j.status === 'OPEN').length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">↑ 2 new this month</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Total Candidates</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-ink mt-2">{candidates.length}</p>
          <span className="text-[11px] text-muted mt-1 inline-block">Across all stages</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Offers Extended</span>
            <FileCheck size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-ink mt-2">{candidates.filter(c => c.stage === 'OFFERED').length}</p>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 inline-block">Pending acceptance</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-hairline shadow-sm">
          <div className="flex items-center justify-between text-muted text-xs font-medium">
            <span>Avg AI Match Score</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-ink mt-2">
            {Math.round(candidates.reduce((acc, c) => acc + c.aiScore, 0) / candidates.length)}%
          </p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 inline-block">Top 10% talent pool</span>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-xl border border-hairline">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
              activeTab === 'pipeline' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
            }`}
          >
            Kanban Pipeline
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition cursor-pointer ${
              activeTab === 'jobs' ? 'bg-slate-900 text-white shadow-sm' : 'text-muted hover:bg-wash'
            }`}
          >
            Job Requisitions ({jobs.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search candidates or jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-hairline focus:outline-none focus:border-emerald-500 bg-wash/30"
          />
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-clay/30 bg-clay/5 p-3 text-[13px] text-clay">
          {loadError}
        </div>
      )}
      {loading && <p className="text-[13px] text-muted">Loading recruitment data…</p>}

      {/* Tab 1: Kanban Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {stages.map((stg) => {
            const stageCandidates = filteredCandidates.filter(c => c.stage === stg)
            return (
              <div key={stg} className="bg-wash/50 p-3 rounded-xl border border-hairline min-w-[200px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-deep">{stg}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-ink border border-hairline">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {stageCandidates.map((cand) => (
                    <motion.div
                      key={cand.id}
                      layout
                      className="bg-white p-3 rounded-xl border border-hairline shadow-sm hover:border-emerald-400 transition"
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-ink">{cand.name}</h4>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          {cand.aiScore}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-1">{cand.jobTitle}</p>
                      <div className="flex items-center gap-2 text-[10px] text-muted mt-2">
                        <span>{cand.experience} exp</span>
                        <span>•</span>
                        <span>{cand.appliedDate}</span>
                      </div>

                      {/* Action selector */}
                      <select
                        value={cand.stage}
                        onChange={(e) => handleStageChange(cand.id, e.target.value as Candidate['stage'])}
                        className="mt-3 w-full text-[10px] font-semibold bg-wash border border-hairline rounded px-2 py-1 focus:outline-none"
                      >
                        {stages.map(s => (
                          <option key={s} value={s}>Move to {s}</option>
                        ))}
                      </select>

                      {/* Convert to Employee Button when HIRED or OFFERED */}
                      {(cand.stage === 'HIRED' || cand.stage === 'OFFERED') && (
                        <button
                          type="button"
                          disabled={convertingId === cand.id}
                          onClick={() => handleConvertToEmployee(cand.id, cand.name)}
                          className="mt-2 w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[10px] py-1 px-2 rounded transition cursor-pointer shadow-xs"
                        >
                          <UserCheck size={12} />
                          {convertingId === cand.id ? 'Converting...' : 'Convert to Employee'}
                        </button>
                      )}
                    </motion.div>
                  ))}
                  {stageCandidates.length === 0 && (
                    <div className="p-4 text-center text-muted text-[11px] border border-dashed border-hairline rounded-xl">
                      No candidates
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 2: Job Requisitions */}
      {activeTab === 'jobs' && (
        <div className="bg-white rounded-xl border border-hairline shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-wash border-b border-hairline text-muted font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">Job Title</th>
                <th className="p-3">Department</th>
                <th className="p-3">Location</th>
                <th className="p-3">Headcount</th>
                <th className="p-3">Applicants</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-wash/30 transition">
                  <td className="p-3 font-semibold text-ink">{job.title}</td>
                  <td className="p-3 text-muted">{job.department}</td>
                  <td className="p-3 text-muted">{job.location}</td>
                  <td className="p-3 font-semibold text-ink">{job.headcount} position(s)</td>
                  <td className="p-3 text-emerald-600 font-bold">{job.applicantsCount} candidates</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteJob(job.id, job.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Requisition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-hairline">
            <h3 className="text-lg font-bold text-ink mb-4">Create Job Requisition</h3>
            <form onSubmit={handleAddJob} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={newJobTitle}
                  onChange={e => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Department</label>
                  <select
                    value={newJobDept}
                    onChange={e => setNewJobDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Product">Product</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Headcount</label>
                  <input
                    type="number"
                    min="1"
                    value={newJobHeadcount}
                    onChange={e => setNewJobHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={newJobLocation}
                    onChange={e => setNewJobLocation(e.target.value)}
                    placeholder="e.g. Remote / Bengaluru"
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-muted font-semibold mb-1">Employment Type</label>
                  <select
                    value={newJobType}
                    onChange={e => setNewJobType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-hairline focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 rounded-lg border border-hairline text-muted hover:bg-wash font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-sm"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
