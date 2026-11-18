import { apiClient } from '@/services/apiClient'
import { hasBackend } from '@/config/env'

export type JobPosting = {
  id: string
  organizationId: string
  title: string
  department: string
  location: string
  type: string
  experienceLevel: string
  salaryRange?: string
  description: string
  requirements: string[]
  benefits: string[]
  headcount?: number
  status: 'OPEN' | 'CLOSED' | 'DRAFT'
  createdAt: string
  applicantCount?: number
}

export type JobApplication = {
  id: string
  jobPostingId: string
  organizationId: string
  candidateName: string
  email: string
  phone: string
  resumeUrl?: string
  coverLetter?: string
  experienceYears?: number
  expectedSalary?: string
  status: 'APPLIED' | 'SCREENED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED'
  interviewDate?: string
  notes?: string
  rating?: number
  appliedAt: string
  jobTitle?: string
  department?: string
}

const SEED_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    organizationId: 'org-alderway',
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote / London',
    type: 'Full-time',
    experienceLevel: 'Senior (5+ yrs)',
    salaryRange: '£85,000 - £100,000',
    description: 'We are seeking an experienced full-stack engineer proficient in React, TypeScript, and NestJS.',
    requirements: ['5+ years modern web dev', 'React, TypeScript, Node.js', 'PostgreSQL or Prisma experience'],
    benefits: ['Flexible remote work', 'Health insurance', '£2,000 learning budget'],
    headcount: 2,
    status: 'OPEN',
    createdAt: '2026-03-01',
    applicantCount: 8,
  },
  {
    id: 'job-2',
    organizationId: 'org-alderway',
    title: 'Product Designer (UI/UX)',
    department: 'Design',
    location: 'London HQ',
    type: 'Full-time',
    experienceLevel: 'Mid-Senior (3+ yrs)',
    salaryRange: '£65,000 - £78,000',
    description: 'Lead visual design and user experience across Keystone desktop and mobile applications.',
    requirements: ['Figma mastery', 'Design system architecture', 'Strong micro-interaction portfolio'],
    benefits: ['Top-spec MacBook Pro', 'Gym membership', '28 days annual leave'],
    headcount: 1,
    status: 'OPEN',
    createdAt: '2026-03-05',
    applicantCount: 5,
  },
  {
    id: 'job-3',
    organizationId: 'org-alderway',
    title: 'HR Operations Specialist',
    department: 'People',
    location: 'London HQ',
    type: 'Full-time',
    experienceLevel: 'Mid (2+ yrs)',
    salaryRange: '£45,000 - £55,000',
    description: 'Support employee onboarding, leave management, compliance reporting, and internal culture.',
    requirements: ['HR operations experience', 'Familiar with UK employment standards', 'Great empathy and communication'],
    benefits: ['Subsidized lunches', 'Hybrid work policy', 'Pension match'],
    headcount: 1,
    status: 'OPEN',
    createdAt: '2026-03-10',
    applicantCount: 12,
  },
]

const SEED_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-1',
    jobPostingId: 'job-1',
    organizationId: 'org-alderway',
    candidateName: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '+44 7700 900123',
    experienceYears: 6,
    expectedSalary: '£90,000',
    status: 'INTERVIEW',
    interviewDate: '2026-03-22',
    notes: 'Strong React & Node performance. Passed initial technical screening.',
    rating: 5,
    appliedAt: '2026-03-12',
    jobTitle: 'Senior Full-Stack Engineer',
    department: 'Engineering',
  },
  {
    id: 'app-2',
    jobPostingId: 'job-1',
    organizationId: 'org-alderway',
    candidateName: 'Clara Oswald',
    email: 'clara.oswald@example.com',
    phone: '+44 7700 900456',
    experienceYears: 4,
    expectedSalary: '£85,000',
    status: 'SCREENED',
    rating: 4,
    appliedAt: '2026-03-14',
    jobTitle: 'Senior Full-Stack Engineer',
    department: 'Engineering',
  },
  {
    id: 'app-3',
    jobPostingId: 'job-2',
    organizationId: 'org-alderway',
    candidateName: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '+44 7700 900789',
    experienceYears: 5,
    expectedSalary: '£72,000',
    status: 'OFFERED',
    notes: 'Outstanding portfolio, culture fit verified with design team.',
    rating: 5,
    appliedAt: '2026-03-08',
    jobTitle: 'Product Designer (UI/UX)',
    department: 'Design',
  },
]

let mockJobs: JobPosting[] = [...SEED_JOBS]
let mockApps: JobApplication[] = [...SEED_APPLICATIONS]

export const recruitmentService = {
  // Public APIs
  getPublicJobs: async (search?: string, department?: string): Promise<JobPosting[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get('/recruitment/public/jobs', { params: { search, department } })
        return res.data
      } catch {}
    }
    return mockJobs.filter(
      (j) =>
        j.status === 'OPEN' &&
        (!department || j.department === department) &&
        (!search || j.title.toLowerCase().includes(search.toLowerCase())),
    )
  },

  getPublicJobById: async (id: string): Promise<JobPosting> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get(`/recruitment/public/jobs/${id}`)
        return res.data
      } catch {}
    }
    const found = mockJobs.find((j) => j.id === id)
    if (!found) throw new Error('Job posting not found')
    return found
  },

  submitApplication: async (payload: {
    jobPostingId: string
    candidateName: string
    email: string
    phone: string
    resumeUrl?: string
    coverLetter?: string
    experienceYears?: number
    expectedSalary?: string
  }): Promise<JobApplication> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post('/recruitment/public/apply', payload)
        return res.data
      } catch {}
    }
    const job = mockJobs.find((j) => j.id === payload.jobPostingId)
    const newApp: JobApplication = {
      id: `app-${crypto.randomUUID().slice(0, 8)}`,
      jobPostingId: payload.jobPostingId,
      organizationId: 'org-alderway',
      candidateName: payload.candidateName,
      email: payload.email,
      phone: payload.phone,
      resumeUrl: payload.resumeUrl,
      coverLetter: payload.coverLetter,
      experienceYears: payload.experienceYears,
      expectedSalary: payload.expectedSalary,
      status: 'APPLIED',
      appliedAt: new Date().toISOString().slice(0, 10),
      jobTitle: job?.title,
      department: job?.department,
    }
    mockApps = [newApp, ...mockApps]
    if (job) {
      job.applicantCount = (job.applicantCount || 0) + 1
    }
    return newApp
  },

  // Admin ATS Dashboard APIs
  getJobs: async (): Promise<JobPosting[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get('/recruitment/jobs')
        return res.data
      } catch {}
    }
    return mockJobs
  },

  createJob: async (payload: Partial<JobPosting>): Promise<JobPosting> => {
    if (hasBackend) {
      try {
        const res = await apiClient.post('/recruitment/jobs', payload)
        return res.data
      } catch {}
    }
    const newJob: JobPosting = {
      id: `job-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: 'org-alderway',
      title: payload.title || 'Untitled Role',
      department: payload.department || 'Engineering',
      location: payload.location || 'London',
      type: payload.type || 'Full-time',
      experienceLevel: payload.experienceLevel || 'Mid',
      salaryRange: payload.salaryRange,
      description: payload.description || '',
      requirements: payload.requirements || [],
      benefits: payload.benefits || [],
      headcount: payload.headcount || 1,
      status: payload.status || 'OPEN',
      createdAt: new Date().toISOString().slice(0, 10),
      applicantCount: 0,
    }
    mockJobs = [newJob, ...mockJobs]
    return newJob
  },

  updateJob: async (id: string, payload: Partial<JobPosting>): Promise<JobPosting> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch(`/recruitment/jobs/${id}`, payload)
        return res.data
      } catch {}
    }
    const idx = mockJobs.findIndex((j) => j.id === id)
    if (idx === -1) throw new Error('Job not found')
    mockJobs[idx] = { ...mockJobs[idx]!, ...payload }
    return mockJobs[idx]!
  },

  deleteJob: async (id: string): Promise<void> => {
    if (hasBackend) {
      try {
        await apiClient.delete(`/recruitment/jobs/${id}`)
        return
      } catch {}
    }
    mockJobs = mockJobs.filter((j) => j.id !== id)
  },

  getApplications: async (jobPostingId?: string, status?: string): Promise<JobApplication[]> => {
    if (hasBackend) {
      try {
        const res = await apiClient.get('/recruitment/applications', {
          params: { jobPostingId, status },
        })
        return res.data
      } catch {}
    }
    return mockApps.filter(
      (a) =>
        (!jobPostingId || a.jobPostingId === jobPostingId) &&
        (!status || a.status === status),
    )
  },

  updateApplication: async (id: string, payload: Partial<JobApplication>): Promise<JobApplication> => {
    if (hasBackend) {
      try {
        const res = await apiClient.patch(`/recruitment/applications/${id}`, payload)
        return res.data
      } catch {}
    }
    const idx = mockApps.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Application not found')
    mockApps[idx] = { ...mockApps[idx]!, ...payload }
    return mockApps[idx]!
  },

  convertToEmployee: async (applicationId: string) => {
    if (hasBackend) {
      try {
        const res = await apiClient.post(`/recruitment/applications/${applicationId}/convert`)
        return res.data
      } catch {}
    }
    const app = mockApps.find((a) => a.id === applicationId)
    if (app) app.status = 'HIRED'
    return { success: true, message: 'Candidate converted to employee successfully.' }
  },
}
