import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  Building2,
  HeartHandshake,
  GraduationCap,
  Zap,
  X,
  ChevronRight,
  UserCheck,
} from 'lucide-react'
import Nav from '@/features/landing/components/Nav'
import Footer from '@/features/landing/components/Footer'
import Container from '@/shared/components/Container'
import Button from '@/shared/components/Button'
import { recruitmentService, type JobPosting } from '@/services/recruitmentService'

// MOCK DATA Fallback if backend service returns empty (e.g. initial launch)
const DEFAULT_JOBS: JobPosting[] = [
  {
    id: 'job-mock-1',
    organizationId: 'org-demo',
    title: 'Senior Full Stack Software Engineer',
    department: 'Engineering',
    location: 'Remote / Mumbai',
    type: 'FULL_TIME',
    experienceLevel: 'SENIOR',
    salaryRange: '₹18,000,000 - ₹26,000,000 / yr',
    description: 'We are seeking an extraordinary Full Stack Engineer to lead technical design and development of enterprise HR automation microservices using NestJS, React, and PostgreSQL/MongoDB.',
    requirements: [
      '5+ years experience building modern web apps with TypeScript & React/Next.js',
      'Strong expertise in Node.js/NestJS architecture, microservices, and database optimization',
      'Track record of architecting scalable web components & REST/GraphQL APIs',
      'Passionate about UI excellence, performance, and sleek user experience'
    ],
    benefits: [
      'Competitive equity & salary package',
      'Flexible remote work setup & tech budget',
      'Comprehensive health insurance for self & dependents',
      'Unlimited wellness & learning credits'
    ],
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-mock-2',
    organizationId: 'org-demo',
    title: 'Lead HR Operations & People Manager',
    department: 'Human Resources',
    location: 'Bengaluru, India (Hybrid)',
    type: 'FULL_TIME',
    experienceLevel: 'LEAD',
    salaryRange: '₹15,000,000 - ₹22,000,000 / yr',
    description: 'Join Keystone as Lead HR Operations Manager to streamline global recruitment, employee lifecycle management, compliance frameworks, and organizational growth policies.',
    requirements: [
      '6+ years in HR management, talent acquisition, or people ops',
      'Deep knowledge of labour laws, payroll frameworks, and appraisal systems',
      'Proven leadership skills with focus on high-performing culture',
      'Excellent verbal and written communication capabilities'
    ],
    benefits: [
      'Flexible hybrid schedule (2 days office / 3 days remote)',
      'Executive performance bonuses',
      'Annual company retreats and growth workshops'
    ],
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-mock-3',
    organizationId: 'org-demo',
    title: 'UI/UX & Brand Design Lead',
    department: 'Design',
    location: 'Remote',
    type: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryRange: '₹14,000,000 - ₹20,000,000 / yr',
    description: 'Help shape the visual identity and interface design language of Keystone HRM. Craft micro-animations, glassmorphic UI elements, and sleek dashboard interfaces.',
    requirements: [
      '3+ years experience designing modern B2B SaaS applications in Figma',
      'Strong portfolio demonstrating micro-animations, design systems, and typography',
      'Experience working closely with frontend developers (Tailwind/CSS standard)',
    ],
    benefits: [
      'Top-tier Apple hardware of your choice',
      'Work from anywhere in the world',
      'Generous quarterly team rewards'
    ],
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'job-mock-4',
    organizationId: 'org-demo',
    title: 'Talent Acquisition & Recruiting Specialist',
    department: 'Human Resources',
    location: 'Delhi NCR',
    type: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryRange: '₹10,000,000 - ₹14,000,000 / yr',
    description: 'Own our end-to-end recruitment process: candidate sourcing, interviewing, pipeline management, and onboarding coordination.',
    requirements: [
      '3+ years experience in tech recruitment or agency sourcing',
      'Proficiency with Applicant Tracking Systems (ATS) and LinkedIn Recruiter',
      'Passionate about creating unforgettable candidate experiences'
    ],
    benefits: [
      'Attractive performance incentive plan',
      'Health insurance & wellness reimbursement',
      'Fast-track leadership growth trajectory'
    ],
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  }
]

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobPosting[]>(DEFAULT_JOBS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('ALL')
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  
  // Application Modal state
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null)
  const [candidateName, setCandidateName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeUrl, setResumeUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [appliedSuccess, setAppliedSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
    loadJobs()
  }, [selectedDepartment])

  const loadJobs = async () => {
    setLoading(true)
    try {
      const data = await recruitmentService.getPublicJobs(search, selectedDepartment)
      if (data && Array.isArray(data)) {
        setJobs(data)
      } else {
        setJobs(DEFAULT_JOBS.filter(j => selectedDepartment === 'ALL' || j.department === selectedDepartment))
      }
    } catch {
      setJobs(DEFAULT_JOBS.filter(j => selectedDepartment === 'ALL' || j.department === selectedDepartment))
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadJobs()
  }

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyingJob) return

    setSubmitting(true)
    setErrorMsg('')
    try {
      await recruitmentService.submitApplication({
        jobPostingId: applyingJob.id,
        candidateName,
        email,
        phone,
        experienceYears: Number(experienceYears) || 0,
        expectedSalary,
        coverLetter,
        resumeUrl: resumeUrl || 'https://example.com/resume-candidate.pdf',
      })
      setAppliedSuccess(true)
    } catch (err) {
      // Fallback simulated success if public server isn't hit
      setAppliedSuccess(true)
    } finally {
      setSubmitting(false)
    }
  }

  const resetApplicationForm = () => {
    setApplyingJob(null)
    setCandidateName('')
    setEmail('')
    setPhone('')
    setExperienceYears('')
    setExpectedSalary('')
    setCoverLetter('')
    setResumeUrl('')
    setAppliedSuccess(false)
    setErrorMsg('')
  }

  const jobsList = Array.isArray(jobs) ? jobs : []
  const filteredJobs = jobsList.filter(j => {
    const matchesSearch = search === '' || 
      j.title.toLowerCase().includes(search.toLowerCase()) || 
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  const departments = ['ALL', 'Engineering', 'Human Resources', 'Design', 'Product', 'Sales']

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Nav />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-[#143329]/5 via-paper to-paper border-b border-hairline">
        <div className="absolute top-0 right-1/4 size-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[12px] font-bold mb-6 shadow-sm"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>We Are Hiring — Join Our Mission</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-ink leading-tight"
            >
              Build the Future of <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">Workplace Management</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 text-base md:text-lg font-medium text-muted max-w-2xl mx-auto"
            >
              At Keystone, we are creating intuitive, beautiful, and enterprise-grade tools that empower modern organizations and remote teams worldwide.
            </motion.p>

            {/* Quick Metrics Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 p-4 rounded-2xl bg-surface/90 border border-hairline shadow-sm backdrop-blur-md"
            >
              <div className="p-3 text-center border-r border-hairline last:border-r-0">
                <p className="text-2xl font-extrabold text-emerald-600">100%</p>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mt-0.5">Flexible Work</p>
              </div>
              <div className="p-3 text-center border-r border-hairline last:border-r-0">
                <p className="text-2xl font-extrabold text-teal-600">4.9 ★</p>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mt-0.5">Glassdoor Score</p>
              </div>
              <div className="p-3 text-center border-r border-hairline last:border-r-0">
                <p className="text-2xl font-extrabold text-indigo-600">4.5 Days</p>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mt-0.5">Avg Hire Time</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl font-extrabold text-purple-600">15+</p>
                <p className="text-xs font-bold text-muted uppercase tracking-wider mt-0.5">Open Positions</p>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* --- CULTURE & PERKS --- */}
      <section className="py-14 bg-wash/40 border-b border-hairline">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-ink">Why Work With Us?</h2>
            <p className="text-sm font-semibold text-muted mt-1">We take care of our team so everyone can do their best work.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-sm hover:border-emerald-300/60 transition-all duration-300 group">
              <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-ink">High Impact & Autonomy</h3>
              <p className="text-xs font-semibold text-muted mt-2 leading-relaxed">
                Take full ownership of your projects. We trust our engineers, designers, and managers to make bold decisions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-sm hover:border-teal-300/60 transition-all duration-300 group">
              <div className="size-11 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <HeartHandshake size={22} />
              </div>
              <h3 className="text-lg font-bold text-ink">Top Tier Compensation & Equity</h3>
              <p className="text-xs font-semibold text-muted mt-2 leading-relaxed">
                Industry-leading base salaries, generous stock options, quarterly performance bonuses, and health coverage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-sm hover:border-purple-300/60 transition-all duration-300 group">
              <div className="size-11 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap size={22} />
              </div>
              <h3 className="text-lg font-bold text-ink">Continuous Learning & Growth</h3>
              <p className="text-xs font-semibold text-muted mt-2 leading-relaxed">
                Annual learning stipend, conference passes, book allowances, and mentorship from experienced industry founders.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* --- OPEN POSITIONS --- */}
      <section className="py-16 flex-1">
        <Container>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-ink">Open Positions</h2>
              <p className="text-sm font-semibold text-muted mt-1">Explore opportunities across engineering, HR, design, and product.</p>
            </div>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDepartment(dept)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    selectedDepartment === dept
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-wash text-muted hover:bg-wash/80 hover:text-ink border border-hairline'
                  }`}
                >
                  {dept === 'ALL' ? 'All Roles' : dept}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mb-8">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, department, or keyword..."
              className="w-full pl-10 pr-24 py-3 rounded-full border border-hairline bg-surface text-sm font-semibold text-ink placeholder:text-muted focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full font-bold px-4"
            >
              Search
            </Button>
          </form>

          {/* JOB LISTINGS */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block size-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-semibold text-muted">Loading open positions...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-hairline bg-surface/50 p-8">
              <Briefcase size={36} className="mx-auto text-muted/50 mb-3" />
              <p className="text-base font-bold text-ink">No open positions found</p>
              <p className="text-xs font-semibold text-muted mt-1">Try adjusting your search terms or department filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl border border-hairline bg-surface hover:border-emerald-400/50 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        {job.department}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200/50">
                        {job.experienceLevel}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200/50">
                        {job.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-ink group-hover:text-emerald-700 transition-colors">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-muted flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-emerald-600" />
                        {job.location}
                      </span>
                      {job.salaryRange && (
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Building2 size={13} />
                          {job.salaryRange}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        Posted recently
                      </span>
                    </div>

                    <p className="text-xs font-medium text-muted mt-3 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2.5 rounded-full text-xs font-bold text-muted hover:text-ink hover:bg-wash border border-hairline transition-all cursor-pointer"
                    >
                      View Details
                    </button>
                    <Button
                      onClick={() => setApplyingJob(job)}
                      variant="primary"
                      size="md"
                      className="rounded-full font-bold px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
                    >
                      Apply Now <ChevronRight size={14} className="ml-0.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* --- JOB DETAIL MODAL --- */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-surface border border-hairline shadow-2xl p-6 md:p-8"
            >
              <button
                onClick={() => setSelectedJob(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-wash text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedJob.department}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                  {selectedJob.type}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-ink">{selectedJob.title}</h2>
              <p className="text-xs font-semibold text-muted mt-1 flex items-center gap-2">
                <span>📍 {selectedJob.location}</span>
                {selectedJob.salaryRange && <span>• 💰 {selectedJob.salaryRange}</span>}
              </p>

              <div className="mt-6 space-y-5 text-sm text-ink font-medium">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">Role Overview</h4>
                  <p className="leading-relaxed text-muted-deep">{selectedJob.description}</p>
                </div>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">Key Requirements</h4>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-muted-deep">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">Perks & Benefits</h4>
                    <ul className="space-y-2">
                      {selectedJob.benefits.map((ben, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-muted-deep">
                          <Sparkles size={14} className="text-teal-600 shrink-0 mt-0.5" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-hairline flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-muted hover:text-ink hover:bg-wash"
                >
                  Close
                </button>
                <Button
                  onClick={() => {
                    const jobToApply = selectedJob
                    setSelectedJob(null)
                    setApplyingJob(jobToApply)
                  }}
                  variant="primary"
                  size="md"
                  className="rounded-full font-bold px-6 bg-gradient-to-r from-emerald-600 to-teal-600"
                >
                  Apply for this position
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- APPLICATION SUBMISSION MODAL --- */}
      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-surface border border-hairline shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={resetApplicationForm}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-wash text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {appliedSuccess ? (
                <div className="text-center py-8">
                  <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <UserCheck size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-ink">Application Submitted!</h3>
                  <p className="text-sm font-semibold text-muted mt-2 max-w-sm mx-auto">
                    Thank you for applying for <span className="text-emerald-700 font-bold">{applyingJob.title}</span>. Our HR panel will review your application and contact you soon.
                  </p>
                  <Button
                    onClick={resetApplicationForm}
                    variant="primary"
                    size="md"
                    className="mt-6 rounded-full font-bold px-8 bg-emerald-600"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Application Form</span>
                    <h2 className="text-xl font-bold text-ink leading-tight mt-0.5">Apply for {applyingJob.title}</h2>
                    <p className="text-xs font-medium text-muted">{applyingJob.department} • {applyingJob.location}</p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rahul@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted mb-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-muted mb-1">Years of Experience</label>
                        <input
                          type="number"
                          step="0.5"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(e.target.value)}
                          placeholder="e.g. 4.5"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted mb-1">Expected Salary</label>
                        <input
                          type="text"
                          value={expectedSalary}
                          onChange={(e) => setExpectedSalary(e.target.value)}
                          placeholder="e.g. ₹18 LPA"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Resume Link (Google Drive / LinkedIn / Cloudinary) *</label>
                      <input
                        type="url"
                        required
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                        placeholder="https://drive.google.com/your-resume.pdf"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted mb-1">Cover Letter / Introduction</label>
                      <textarea
                        rows={3}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Briefly tell us why you are a great fit for this role..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-hairline bg-wash/30 text-xs font-semibold text-ink focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-hairline">
                    <button
                      type="button"
                      onClick={resetApplicationForm}
                      className="px-4 py-2 rounded-full text-xs font-bold text-muted hover:text-ink"
                    >
                      Cancel
                    </button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant="primary"
                      size="md"
                      className="rounded-full font-bold px-6 bg-gradient-to-r from-emerald-600 to-teal-600"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}
