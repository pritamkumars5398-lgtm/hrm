import { hasBackend } from '@/config/env';
import { apiClient, apiErrorMessage } from './apiClient';

export type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  headcount: number;
  status: 'OPEN' | 'DRAFT' | 'CLOSED';
  description?: string | null;
};

export type Candidate = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  stage: 'APPLIED' | 'SCREENED' | 'INTERVIEW' | 'OFFERED' | 'HIRED' | 'REJECTED';
  resumeUrl?: string | null;
  requisitionId: string;
};

export class RecruitmentError extends Error {}

export const recruitmentService = {
  async listJobs(): Promise<Job[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Job[]>('/recruitment/jobs');
        return data;
      } catch (error) {
        throw new RecruitmentError(apiErrorMessage(error, 'Could not load job requisitions.'));
      }
    }
    return [];
  },

  async createJob(payload: { title: string; department: string; location: string; headcount: number; description?: string }): Promise<Job> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Job>('/recruitment/jobs', payload);
        return data;
      } catch (error) {
        throw new RecruitmentError(apiErrorMessage(error, 'Could not create job requisition.'));
      }
    }
    return {
      id: `job-${Date.now()}`,
      title: payload.title,
      department: payload.department,
      location: payload.location,
      headcount: payload.headcount,
      status: 'OPEN',
      description: payload.description,
    };
  },

  async listCandidates(): Promise<Candidate[]> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Candidate[]>('/recruitment/candidates');
        return data;
      } catch (error) {
        throw new RecruitmentError(apiErrorMessage(error, 'Could not load candidates.'));
      }
    }
    return [];
  },

  async createCandidate(payload: { name: string; email: string; phone?: string; requisitionId: string }): Promise<Candidate> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<Candidate>('/recruitment/candidates', payload);
        return data;
      } catch (error) {
        throw new RecruitmentError(apiErrorMessage(error, 'Could not add candidate.'));
      }
    }
    return {
      id: `cand-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      stage: 'APPLIED',
      requisitionId: payload.requisitionId,
    };
  },

  async updateStage(candidateId: string, stage: Candidate['stage']): Promise<Candidate> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<Candidate>(`/recruitment/candidates/${candidateId}/stage`, { stage });
        return data;
      } catch (error) {
        throw new RecruitmentError(apiErrorMessage(error, 'Could not update candidate stage.'));
      }
    }
    return {
      id: candidateId,
      name: 'Mock Candidate',
      email: 'mock@example.com',
      stage,
      requisitionId: '',
    };
  },
};
