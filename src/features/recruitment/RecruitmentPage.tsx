import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Users,
  Plus,
  Search,
  FileText,
  UserCheck,
  ExternalLink,
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import Button from '@/shared/components/Button'
import { recruitmentService, type JobPosting, type JobApplication } from '@/services/recruitmentService'
import { apiErrorMessage } from '@/services/apiClient'

const STAGES: Array<{ key: JobApplication['status']; label: string; color: string; bg: string; border: string }> = [
  { key: 'APPLIED', label: 'Applied', color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
  { key: 'SCREENING', label: 'Screening', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { key: 'INTERVIEW', label: 'Interview', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'OFFERED', label: 'Offered', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'HIRED', label: 'Hired', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'REJECTED', label: 'Rejected', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
]

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'jobs'>('pipeline')
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])

  // Filters
  const [selectedJobId, setSelectedJobId] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Create / Edit Job Modal
  const [showJobModal, setShowJobModal] = useState(false)
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null)
  const [jobTitle, setJobTitle] = useState('')
  const [department, setDepartment] = useState('Engineering')
  const [location, setLocation] = useState('Remote')
  const [jobType, setJobType] = useState('FULL_TIME')
  const [experienceLevel, setExperienceLevel] = useState('SENIOR')
  const [salaryRange, setSalaryRange] = useState('')
  const [description, setDescription] = useState('')
  const [requirementsText, setRequirementsText] = useState('')
  const [benefitsText, setBenefitsText] = useState('')
  const [savingJob, setSavingJob] = useState(false)

  // Application Detail Modal / Drawer
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null)
  const [updatingApp, setUpdatingApp] = useState(false)
  const [convertingEmp, setConvertingEmp] = useState(false)
  const [interviewDate, setInterviewDate] = useState('')
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [jobsData, appsData] = await Promise.all([
        recruitmentService.getJobs(),
        recruitmentService.getApplications(),
      ])
      setJobs(jobsData || [])
      setApplications(appsData || [])
    } catch {
      // Fallback state if server has no seed data yet
      setJobs([
        {
          id: 'job-1',
          organizationId: 'org-1',
          title: 'Senior Full Stack Software Engineer',
          department: 'Engineering',
          location: 'Remote',
          type: 'FULL_TIME',
          experienceLevel: 'SENIOR',
          salaryRange: '₹18 LPA - ₹26 LPA',
          description: 'Lead engineering effort for Keystone backend & frontend components.',
          requirements: ['TypeScript', 'React', 'NestJS'],
          benefits: ['Health Insurance', 'Tech budget'],
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          applicantCount: 3,
        },
      ])
      setApplications([
        {
          id: 'app-1',
          jobPostingId: 'job-1',
          organizationId: 'org-1',
          candidateName: 'Aarav Sharma',
          email: 'aarav.sharma@example.com',
          phone: '+91 9876543210',
          resumeUrl: 'https://example.com/resume.pdf',
          coverLetter: 'Experienced full stack developer eager to build next-gen HR tech.',
          experienceYears: 5,
          expectedSalary: '₹22 LPA',
          status: 'INTERVIEW',
          interviewDate: '2026-08-05 14:00',
          notes: 'Strong technical knowledge in React & NestJS architecture.',
          rating: 4,
          appliedAt: new Date().toISOString(),
          jobTitle: 'Senior Full Stack Software Engineer',
          department: 'Engineering',
        },
        {
          id: 'app-2',
          jobPostingId: 'job-1',
          organizationId: 'org-1',
          candidateName: 'Pooja Verma',
          email: 'pooja.verma@example.com',
          phone: '+91 9812345678',
          resumeUrl: 'https://example.com/pooja-cv.pdf',
          coverLetter: 'Frontend specialist with 4 years experience.',
          experienceYears: 4,
          expectedSalary: '₹19 LPA',
          status: 'APPLIED',
          rating: 3,
          appliedAt: new Date().toISOString(),
          jobTitle: 'Senior Full Stack Software Engineer',
          department: 'Engineering',
        },
      ])
    }
  }

  const handleOpenCreateJob = () => {
    setEditingJob(null)
    setJobTitle('')
    setDepartment('Engineering')
    setLocation('Remote')
    setJobType('FULL_TIME')
    setExperienceLevel('SENIOR')
    setSalaryRange('')
    setDescription('')
    setRequirementsText('')
    setBenefitsText('')
    setShowJobModal(true)
  }

  const handleOpenEditJob = (job: JobPosting) => {
    setEditingJob(job)
    setJobTitle(job.title)
    setDepartment(job.department)
    setLocation(job.location)
    setJobType(job.type)
    setExperienceLevel(job.experienceLevel)
    setSalaryRange(job.salaryRange || '')
    setDescription(job.description)
    setRequirementsText((job.requirements || []).join('\n'))
    setBenefitsText((job.benefits || []).join('\n'))
    setShowJobModal(true)
  }

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingJob(true)
    const payload = {
      title: jobTitle,
      department,
      location,
      type: jobType,
      experienceLevel,
      salaryRange,
      description,
      requirements: requirementsText.split('\n').filter(Boolean),
      benefits: benefitsText.split('\n').filter(Boolean),
      status: 'OPEN' as const,
    }

    try {
      if (editingJob) {
        await recruitmentService.updateJob(editingJob.id, payload)
      } else {
        await recruitmentService.createJob(payload)
      }
      setShowJobModal(false)
      fetchData()
    } catch (err) {
      alert(apiErrorMessage(err, 'Failed to save job posting'))
    } finally {
      setSavingJob(false)
    }
  }

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting and its applications?')) return
    try {
      await recruitmentService.deleteJob(id)
      fetchData()
    } catch (err) {
      alert(apiErrorMessage(err, 'Failed to delete job posting'))
    }
  }

  const handleOpenAppDetail = (app: JobApplication) => {
    setSelectedApp(app)
    setInterviewDate(app.interviewDate || '')
    setNotes(app.notes || '')
    setRating(app.rating || 0)
  }

  const handleUpdateAppStatus = async (status: JobApplication['status']) => {
    if (!selectedApp) return
    setUpdatingApp(true)
    try {
      const updated = await recruitmentService.updateApplication(selectedApp.id, {
        status,
        interviewDate,
        notes,
        rating,
      })
      setSelectedApp(updated)
      fetchData()
    } catch {
      // Local fallback state update
      setSelectedApp({ ...selectedApp, status, interviewDate, notes, rating })
      setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, status, interviewDate, notes, rating } : a))
    } finally {
      setUpdatingApp(false)
    }
  }

  const handleConvertToEmployee = async () => {
    if (!selectedApp) return
    if (!confirm(`Convert ${selectedApp.candidateName} directly to active Employee record?`)) return

    setConvertingEmp(true)
    try {
      await recruitmentService.convertToEmployee(selectedApp.id)
      alert(`Success! ${selectedApp.candidateName} has been added to Employees directory!`)
      setSelectedApp(null)
      fetchData()
    } catch (err) {
      alert(apiErrorMessage(err, 'Failed to convert candidate to employee'))
    } finally {
      setConvertingEmp(false)
    }
  }

  const filteredApps = applications.filter((app) => {
    const matchesJob = selectedJobId === 'ALL' || app.jobPostingId === selectedJobId
    const matchesQuery =
      searchQuery === '' ||
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.jobTitle && app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesJob && matchesQuery
  })

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-hairline shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink">Recruitment & Hiring ATS</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Operational Panel
            </span>
          </div>
          <p className="text-xs font-semibold text-muted mt-1">
            Manage active job openings, candidate evaluation pipeline, and convert hires into employees.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreateJob}
            variant="primary"
            size="md"
            className="rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md"
          >
            <Plus size={16} className="mr-1.5" /> Post New Job
          </Button>
        </div>
      </div>

      {/* TABS & FILTERS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-wash border border-hairline w-fit">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Users size={14} className="inline mr-1.5" /> Candidate Pipeline ({filteredApps.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-surface text-ink shadow-xs'
                : 'text-muted hover:text-ink'
            }`}
          >
            <Briefcase size={14} className="inline mr-1.5" /> Job Postings ({jobs.length})
          </button>
        </div>

        {/* Filter inputs */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-hairline bg-surface text-xs font-semibold text-ink placeholder:text-muted focus:outline-none focus:border-emerald-500 w-48"
            />
          </div>

          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-hairline bg-surface text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Active Openings</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- PIPELINE KANBAN / BOARD VIEW --- */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.status === stage.key)
            return (
              <div key={stage.key} className="flex flex-col min-w-[220px] rounded-2xl bg-surface border border-hairline p-3">
                <div className={`flex items-center justify-between p-2 rounded-xl border mb-3 ${stage.bg} ${stage.border}`}>
                  <span className={`text-xs font-extrabold ${stage.color}`}>{stage.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-surface ${stage.color}`}>
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto max-h-[600px]">
                  {stageApps.length === 0 ? (
                    <div className="py-6 text-center text-[11px] font-semibold text-muted/60 border border-dashed border-hairline/60 rounded-xl">
                      No candidates
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <motion.div
                        key={app.id}
                        onClick={() => handleOpenAppDetail(app)}
                        whileHover={{ y: -2 }}
                        className="p-3 rounded-xl border border-hairline bg-wash/40 hover:bg-surface hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-bold text-ink truncate">{app.candidateName}</p>
                          {app.rating ? (
                            <span className="text-[10px] font-extrabold text-amber-600 flex items-center">
                              ★ {app.rating}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-[10.5px] font-medium text-muted truncate">{app.jobTitle}</p>

                        <div className="flex items-center justify-between text-[9.5px] text-muted font-medium pt-1 border-t border-hairline/40">
                          <span>{app.experienceYears ? `${app.experienceYears} yrs exp` : 'Fresh'}</span>
                          <span className="text-emerald-700 font-bold">{app.expectedSalary || 'N/A'}</span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* --- JOB POSTINGS LIST VIEW --- */}
      {activeTab === 'jobs' && (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-hairline rounded-2xl">
              <Briefcase size={32} className="mx-auto text-muted/50 mb-2" />
              <p className="text-sm font-bold text-ink">No Job Postings Created Yet</p>
              <p className="text-xs text-muted mt-1">Click "Post New Job" above to create your first active opening.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-surface border border-hairline shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-ink">{job.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase ${
                      job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-wash text-muted'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted flex items-center gap-3">
                    <span>🏢 {job.department}</span>
                    <span>📍 {job.location}</span>
                    <span>💰 {job.salaryRange || 'Undisclosed'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center px-4 py-1.5 rounded-xl bg-wash border border-hairline">
                    <p className="text-sm font-extrabold text-ink">{job.applicantCount || 0}</p>
                    <p className="text-[9.5px] font-bold text-muted uppercase tracking-wider">Applicants</p>
                  </div>

                  <button
                    onClick={() => handleOpenEditJob(job)}
                    className="p-2 rounded-xl text-muted hover:text-ink hover:bg-wash border border-hairline cursor-pointer"
                    title="Edit Job"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/50 cursor-pointer"
                    title="Delete Job"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- CREATE / EDIT JOB MODAL --- */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-3xl bg-surface border border-hairline shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowJobModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-wash text-muted cursor-pointer"
              >
                <X size={16} />
              </button>

              <h2 className="text-xl font-bold text-ink">{editingJob ? 'Edit Job Posting' : 'Create Job Opening'}</h2>
              <p className="text-xs text-muted mt-0.5">Publish positions directly to the public Careers page.</p>

              <form onSubmit={handleSaveJob} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="Sales">Sales</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote / Mumbai"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none"
                    >
                      <option value="FULL_TIME">Full-time</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="REMOTE">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Experience Level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none"
                    >
                      <option value="ENTRY">Entry</option>
                      <option value="MID">Mid Level</option>
                      <option value="SENIOR">Senior</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      placeholder="e.g. ₹15 LPA - ₹20 LPA"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Role responsibilities..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Requirements (One per line)</label>
                  <textarea
                    rows={3}
                    value={requirementsText}
                    onChange={(e) => setRequirementsText(e.target.value)}
                    placeholder="3+ years React experience..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-bold text-muted hover:text-ink"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    disabled={savingJob}
                    variant="primary"
                    size="md"
                    className="rounded-full font-bold px-6 bg-emerald-600"
                  >
                    {savingJob ? 'Saving...' : editingJob ? 'Update Job' : 'Publish Job'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CANDIDATE DETAIL DRAWER / EVALUATION MODAL --- */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-3xl bg-surface border border-hairline shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5"
            >
              <button
                onClick={() => setSelectedApp(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-wash text-muted cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold flex items-center justify-center text-lg shrink-0">
                  {selectedApp.candidateName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink">{selectedApp.candidateName}</h2>
                  <p className="text-xs font-semibold text-muted flex items-center gap-2">
                    <span>{selectedApp.jobTitle}</span>
                    <span>• {selectedApp.email}</span>
                  </p>
                </div>
              </div>

              {/* Stage Transition Selector */}
              <div className="p-3.5 rounded-2xl bg-wash/50 border border-hairline space-y-2">
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Candidate Stage Pipeline</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STAGES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => handleUpdateAppStatus(s.key)}
                      disabled={updatingApp}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedApp.status === s.key
                          ? `${s.bg} ${s.color} border ${s.border} shadow-xs`
                          : 'bg-surface text-muted hover:text-ink border border-hairline'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Letter & Resume Link */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Application Documents</p>
                <div className="flex items-center justify-between p-3 rounded-xl border border-hairline bg-surface">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-emerald-600" />
                    <span className="text-xs font-bold text-ink">Candidate Resume / CV</span>
                  </div>
                  {selectedApp.resumeUrl ? (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      Open Link <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-xs text-muted">No link attached</span>
                  )}
                </div>

                {selectedApp.coverLetter && (
                  <div className="p-3 rounded-xl border border-hairline bg-surface text-xs text-muted-deep leading-relaxed">
                    <p className="font-bold text-ink mb-1">Cover Letter:</p>
                    {selectedApp.coverLetter}
                  </div>
                )}
              </div>

              {/* Rating & Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted uppercase tracking-wider">Evaluation Rating</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          setRating(star)
                          handleUpdateAppStatus(selectedApp.status)
                        }}
                        className={`text-lg transition-transform ${star <= rating ? 'text-amber-500 scale-110' : 'text-wash'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Scheduled Interview Date & Time</label>
                  <input
                    type="text"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    placeholder="e.g. 2026-08-05 14:00 IST"
                    className="w-full px-3.5 py-2 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Interviewer Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add interview feedback or candidate strengths..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink resize-none"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-4 border-t border-hairline flex items-center justify-between gap-3">
                <Button
                  onClick={handleConvertToEmployee}
                  disabled={convertingEmp}
                  variant="primary"
                  size="md"
                  className="rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  <UserCheck size={16} className="mr-1.5" /> Convert to Active Employee
                </Button>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:text-ink"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
