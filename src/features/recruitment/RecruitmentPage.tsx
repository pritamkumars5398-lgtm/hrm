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
} from 'lucide-react'
import { hasBackend } from '@/config/env'
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

const INITIAL_JOBS: Job[] = [
  { id: 'job-1', title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'Remote / Bengaluru', headcount: 3, applicantsCount: 42, status: 'OPEN', type: 'Full-time' },
  { id: 'job-2', title: 'HR Business Partner', department: 'Human Resources', location: 'Mumbai', headcount: 1, applicantsCount: 18, status: 'OPEN', type: 'Full-time' },
  { id: 'job-3', title: 'Product Manager - SaaS', department: 'Product', location: 'Hybrid / Delhi NCR', headcount: 2, applicantsCount: 29, status: 'OPEN', type: 'Full-time' },
  { id: 'job-4', title: 'Talent Acquisition Lead', department: 'Human Resources', location: 'Bengaluru', headcount: 1, applicantsCount: 12, status: 'DRAFT', type: 'Full-time' },
]

const INITIAL_CANDIDATES: Candidate[] = [
  { id: 'cand-1', name: 'Rahul Sharma', email: 'rahul.s@example.com', jobTitle: 'Senior Full Stack Engineer', stage: 'INTERVIEW', aiScore: 94, experience: '6 yrs', appliedDate: '2026-08-01' },
  { id: 'cand-2', name: 'Ananya Verma', email: 'ananya.v@example.com', jobTitle: 'HR Business Partner', stage: 'OFFERED', aiScore: 98, experience: '5 yrs', appliedDate: '2026-07-28' },
  { id: 'cand-3', name: 'Vikram Mehta', email: 'vikram.m@example.com', jobTitle: 'Product Manager - SaaS', stage: 'SCREENED', aiScore: 88, experience: '7 yrs', appliedDate: '2026-08-03' },
  { id: 'cand-4', name: 'Sneha Patel', email: 'sneha.p@example.com', jobTitle: 'Senior Full Stack Engineer', stage: 'APPLIED', aiScore: 79, experience: '4 yrs', appliedDate: '2026-08-05' },
  { id: 'cand-5', name: 'Karan Kapoor', email: 'karan.k@example.com', jobTitle: 'Product Manager - SaaS', stage: 'HIRED', aiScore: 96, experience: '8 yrs', appliedDate: '2026-07-20' },
]

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'jobs' | 'ai-match'>('pipeline')
  const [search, setSearch] = useState('')
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS)
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES)
  const [showNewJobModal, setShowNewJobModal] = useState(false)
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newJobDept, setNewJobDept] = useState('Engineering')

  useEffect(() => {
    async function loadData() {
      if (hasBackend) {
        try {
          const fetchedJobs = await recruitmentService.listJobs()
          const fetchedCandidates = await recruitmentService.listCandidates()
          const uiJobs = fetchedJobs.length > 0 ? fetchedJobs.map(j => ({
            id: j.id,
            title: j.title,
            department: j.department,
            location: j.location,
            headcount: j.headcount,
            applicantsCount: fetchedCandidates.filter(c => c.requisitionId === j.id).length,
            status: j.status,
            type: 'Full-time'
          })) : INITIAL_JOBS;

          const uiCandidates = fetchedCandidates.map(c => {
            const job = uiJobs.find(j => j.id === c.requisitionId);
            return {
              id: c.id,
              name: c.name,
              email: c.email,
              jobTitle: job ? job.title : 'Position',
              stage: c.stage,
              aiScore: 85,
              experience: '3 yrs',
              appliedDate: '2026-08-12',
            };
          });
          setJobs(uiJobs);
          setCandidates(uiCandidates.length > 0 ? uiCandidates : INITIAL_CANDIDATES);
        } catch (err) {
          console.error(err);
        }
      }
    }
    loadData()
  }, [])

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newJobTitle.trim()) return
    try {
      let newJ: any;
      if (hasBackend) {
        const created = await recruitmentService.createJob({
          title: newJobTitle,
          department: newJobDept,
          location: 'Hybrid',
          headcount: 1,
        })
        newJ = {
          id: created.id,
          title: created.title,
          department: created.department,
          location: created.location,
          headcount: created.headcount,
          applicantsCount: 0,
          status: created.status,
          type: 'Full-time'
        }
      } else {
        newJ = {
          id: `job-${Date.now()}`,
          title: newJobTitle,
          department: newJobDept,
          location: 'Hybrid',
          headcount: 1,
          applicantsCount: 0,
          status: 'OPEN',
          type: 'Full-time'
        }
      }
      setJobs([newJ, ...jobs])
      setNewJobTitle('')
      setShowNewJobModal(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err))
    }
  }

  const handleStageChange = async (candId: string, newStage: Candidate['stage']) => {
    setCandidates(prev => prev.map(c => c.id === candId ? { ...c, stage: newStage } : c))
    if (hasBackend) {
      try {
        await recruitmentService.updateStage(candId, newStage)
      } catch (err) {
        alert(err instanceof Error ? err.message : String(err))
      }
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
