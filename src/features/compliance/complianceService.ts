import { apiClient } from '@/services/apiClient';

export interface ComplianceDashboardData {
  healthScore: number;
  totalCount: number;
  compliantCount: number;
  nonCompliantCount: number;
  pendingCount: number;
  overdueCount: number;
  activeViolations: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  obligations: Array<{ id: string; status: string; dueDate?: string; score: number }>;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  code: string;
  description?: string;
  jurisdiction: string;
  version: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  status: string;
}

export interface ComplianceRequirement {
  id: string;
  frameworkId?: string;
  code: string;
  name: string;
  description?: string;
  category: 'DOCUMENT' | 'POLICY' | 'TRAINING' | 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'ONBOARDING';
  mandatory: boolean;
  frequency: 'ONCE' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidenceRequired: boolean;
  verificationRequired: boolean;
  approvalRequired: boolean;
  responsibleOwnerId?: string;
  applicabilityRules: string;
  status: string;
}

export interface ComplianceObligation {
  id: string;
  requirementId: string;
  targetType: 'EMPLOYEE' | 'ORGANIZATION';
  targetId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLIANT' | 'EXPIRING_SOON' | 'EXPIRED' | 'NON_COMPLIANT' | 'WAIVED' | 'UNDER_REVIEW' | 'OVERDUE';
  dueDate?: string;
  complianceScore: number;
  lastEvaluatedAt: string;
}

export interface ComplianceTask {
  id: string;
  obligationId?: string;
  assignedToId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'OVERDUE' | 'BLOCKED' | 'REJECTED' | 'CANCELLED';
  evidenceUrl?: string;
  commentsJson: string;
  createdAt: string;
}

export interface ComplianceViolation {
  id: string;
  obligationId?: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetType: 'EMPLOYEE' | 'ORGANIZATION';
  targetId: string;
  description: string;
  detectedDate: string;
  ownerId?: string;
  correctiveAction?: string;
  dueDate?: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ACTION_REQUIRED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';
  historyJson: string;
}

export interface ComplianceException {
  id: string;
  obligationId: string;
  requestedById: string;
  reason: string;
  scope: 'FULL' | 'PARTIAL';
  startDate: string;
  endDate: string;
  approverId?: string;
  approvalDate?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
}

export interface ComplianceRisk {
  id: string;
  category: string;
  likelihood: number;
  impact: number;
  riskScore: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  ownerId?: string;
  mitigation?: string;
  status: string;
}

export interface MyCourse {
  id: string;
  courseId: string;
  progress: number;
  status: 'ASSIGNED' | 'STARTED' | 'COMPLETED' | 'EXPIRED';
  assignedAt: string;
  completedAt?: string;
  title: string;
  category: string;
  durationMins: number;
  description: string;
}

export const complianceService = {
  async getDashboard(): Promise<ComplianceDashboardData> {
    const res = await apiClient.get<ComplianceDashboardData>('/compliance/dashboard');
    return res.data;
  },

  async getFrameworks(): Promise<ComplianceFramework[]> {
    const res = await apiClient.get<ComplianceFramework[]>('/compliance/frameworks');
    return res.data;
  },

  async createFramework(data: Partial<ComplianceFramework>): Promise<ComplianceFramework> {
    const res = await apiClient.post<ComplianceFramework>('/compliance/frameworks', data);
    return res.data;
  },

  async getRequirements(): Promise<ComplianceRequirement[]> {
    const res = await apiClient.get<ComplianceRequirement[]>('/compliance/requirements');
    return res.data;
  },

  async createRequirement(data: Partial<ComplianceRequirement>): Promise<ComplianceRequirement> {
    const res = await apiClient.post<ComplianceRequirement>('/compliance/requirements', data);
    return res.data;
  },

  async getObligations(): Promise<ComplianceObligation[]> {
    const res = await apiClient.get<ComplianceObligation[]>('/compliance/obligations');
    return res.data;
  },

  async getMyObligations(): Promise<ComplianceObligation[]> {
    const res = await apiClient.get<ComplianceObligation[]>('/compliance/obligations/my-obligations');
    return res.data;
  },

  async getViolations(): Promise<ComplianceViolation[]> {
    const res = await apiClient.get<ComplianceViolation[]>('/compliance/violations');
    return res.data;
  },

  async updateViolation(id: string, data: Partial<ComplianceViolation>): Promise<ComplianceViolation> {
    const res = await apiClient.patch<ComplianceViolation>(`/compliance/violations/${id}`, data);
    return res.data;
  },

  async getExceptions(): Promise<ComplianceException[]> {
    const res = await apiClient.get<ComplianceException[]>('/compliance/exceptions');
    return res.data;
  },

  async requestException(data: Partial<ComplianceException>): Promise<ComplianceException> {
    const res = await apiClient.post<ComplianceException>('/compliance/exceptions', data);
    return res.data;
  },

  async getTasks(): Promise<ComplianceTask[]> {
    const res = await apiClient.get<ComplianceTask[]>('/compliance/tasks');
    return res.data;
  },

  async createTask(data: Partial<ComplianceTask>): Promise<ComplianceTask> {
    const res = await apiClient.post<ComplianceTask>('/compliance/tasks', data);
    return res.data;
  },

  async updateTaskStatus(id: string, status: string, evidenceUrl?: string): Promise<ComplianceTask> {
    const res = await apiClient.patch<ComplianceTask>(`/compliance/tasks/${id}`, { status, evidenceUrl });
    return res.data;
  },

  async getRisks(): Promise<ComplianceRisk[]> {
    const res = await apiClient.get<ComplianceRisk[]>('/compliance/risks');
    return res.data;
  },

  async createRisk(data: Partial<ComplianceRisk>): Promise<ComplianceRisk> {
    const res = await apiClient.post<ComplianceRisk>('/compliance/risks', data);
    return res.data;
  },

  async getMyCourses(): Promise<MyCourse[]> {
    const res = await apiClient.get<MyCourse[]>('/compliance/courses/my-courses');
    return res.data;
  },

  async updateCourseProgress(courseId: string, progress: number): Promise<any> {
    const res = await apiClient.post(`/compliance/courses/${courseId}/progress`, { progress });
    return res.data;
  },

  async acknowledgePolicy(policyId: string, version: string): Promise<any> {
    const res = await apiClient.post('/compliance/policies/acknowledge', { policyId, version });
    return res.data;
  },
};
