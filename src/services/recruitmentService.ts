import { apiClient } from '@/services/apiClient'

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

export const recruitmentService = {
  // Public APIs
  getPublicJobs: async (search?: string, department?: string): Promise<JobPosting[]> => {
    const res = await apiClient.get('/recruitment/public/jobs', {
      params: { search, department },
    })
    return res.data
  },

  getPublicJobById: async (id: string): Promise<JobPosting> => {
    const res = await apiClient.get(`/recruitment/public/jobs/${id}`)
    return res.data
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
    const res = await apiClient.post('/recruitment/public/apply', payload)
    return res.data
  },

  // Admin ATS Dashboard APIs
  getJobs: async (): Promise<JobPosting[]> => {
    const res = await apiClient.get('/recruitment/jobs')
    return res.data
  },

  createJob: async (payload: Partial<JobPosting>): Promise<JobPosting> => {
    const res = await apiClient.post('/recruitment/jobs', payload)
    return res.data
  },

  updateJob: async (id: string, payload: Partial<JobPosting>): Promise<JobPosting> => {
    const res = await apiClient.patch(`/recruitment/jobs/${id}`, payload)
    return res.data
  },

  deleteJob: async (id: string): Promise<void> => {
    await apiClient.delete(`/recruitment/jobs/${id}`)
  },

  getApplications: async (jobPostingId?: string, status?: string): Promise<JobApplication[]> => {
    const res = await apiClient.get('/recruitment/applications', {
      params: { jobPostingId, status },
    })
    return res.data
  },

  updateApplication: async (id: string, payload: Partial<JobApplication>): Promise<JobApplication> => {
    const res = await apiClient.patch(`/recruitment/applications/${id}`, payload)
    return res.data
  },

  convertToEmployee: async (applicationId: string) => {
    const res = await apiClient.post(`/recruitment/applications/${applicationId}/convert`)
    return res.data
  },
}
