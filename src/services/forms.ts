import { apiClient } from '@/services/apiClient';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface FormQuestion {
  id: string;
  label: string;
  description?: string;
  fieldType:
    | 'TEXT'
    | 'LONG_TEXT'
    | 'EMAIL'
    | 'PHONE'
    | 'NUMBER'
    | 'DATE'
    | 'TIME'
    | 'DATETIME'
    | 'DROPDOWN'
    | 'RADIO'
    | 'CHECKBOX'
    | 'FILE'
    | 'IMAGE'
    | 'SIGNATURE';
  required: boolean;
  order: number;
  options?: QuestionOption[];
  settings?: string;
}

export interface Form {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  createdByUserId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  isPublic: boolean;
  allowMultipleSubmissions: boolean;
  allowEditAfterSubmission: boolean;
  questions: FormQuestion[];
  createdAt: string;
  updatedAt?: string;
  _count?: {
    responses: number;
    assignments: number;
  };
}

export interface FormAssignment {
  id: string;
  formId: string;
  organizationId: string;
  employeeId: string;
  assignedByUserId: string;
  dueDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  assignedAt: string;
  form: Form;
}

export interface ResponseAnswer {
  questionId: string;
  fieldType: string;
  value?: string;
  fileUrls?: string[];
}

export interface ApprovalAction {
  id: string;
  responseId: string;
  stepOrder: number;
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  comment?: string;
  actedByUserId: string;
  actedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  organizationId: string;
  employeeId: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  answers: ResponseAnswer[];
  submittedAt: string;
  form: Form;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    jobTitle: string;
    photoUrl?: string;
  };
  approvalActions?: ApprovalAction[];
}

export const formsApi = {
  getForms: async (): Promise<Form[]> => {
    const res = await apiClient.get<Form[]>('/forms');
    return res.data;
  },

  getFormById: async (id: string): Promise<Form> => {
    const res = await apiClient.get<Form>(`/forms/${id}`);
    return res.data;
  },

  createForm: async (data: Partial<Form>): Promise<Form> => {
    const res = await apiClient.post<Form>('/forms', data);
    return res.data;
  },

  updateForm: async (id: string, data: Partial<Form>): Promise<Form> => {
    const res = await apiClient.patch<Form>(`/forms/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<Form> => {
    const res = await apiClient.patch<Form>(`/forms/${id}/status`, { status });
    return res.data;
  },

  assignForm: async (
    id: string,
    payload: { employeeIds?: string[]; department?: string; assignAll?: boolean; dueDate?: string },
  ) => {
    const res = await apiClient.post(`/forms/${id}/assign`, payload);
    return res.data;
  },

  getMyAssignments: async (): Promise<FormAssignment[]> => {
    const res = await apiClient.get<FormAssignment[]>('/forms/my-assignments');
    return res.data;
  },

  submitResponse: async (formId: string, answers: ResponseAnswer[]) => {
    const res = await apiClient.post(`/forms/${formId}/submit`, { answers });
    return res.data;
  },

  getFormResponses: async (formId: string): Promise<FormResponse[]> => {
    const res = await apiClient.get<FormResponse[]>(`/forms/${formId}/responses`);
    return res.data;
  },

  decideApproval: async (responseId: string, action: string, comment?: string) => {
    const res = await apiClient.post(`/forms/responses/${responseId}/decide`, { action, comment });
    return res.data;
  },
};
