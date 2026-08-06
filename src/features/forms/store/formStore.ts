import { create } from 'zustand'

export type FormFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'RATING'
  | 'SELECT'
  | 'FILE'
  | 'DATE'
  | 'TOGGLE'

export type FormField = {
  id: string
  label: string
  type: FormFieldType
  required: boolean
  options?: string[]
}

export type FormResponse = {
  id: string
  formId: string
  respondentName: string
  submittedAt: string
  answers: Record<string, string | number>
}

export type FormDefinition = {
  id: string
  title: string
  description: string
  category: 'Appraisal' | 'Survey' | 'Feedback' | 'Onboarding'
  status: 'PUBLISHED' | 'DRAFT' | 'INACTIVE'
  fields: FormField[]
  responses: FormResponse[]
  createdAt: string
}

type FormStore = {
  forms: FormDefinition[]
  addForm: (form: Omit<FormDefinition, 'id' | 'responses' | 'createdAt'>) => FormDefinition
  toggleStatus: (id: string) => void
  deleteForm: (id: string) => void
  submitResponse: (formId: string, respondentName: string, answers: Record<string, string | number>) => void
}

const INITIAL_FORMS: FormDefinition[] = [
  {
    id: 'form-1',
    title: 'Q3 2026 360-Degree Performance Appraisal',
    description: 'Quarterly review evaluating leadership, key deliverables, and team collaboration.',
    category: 'Appraisal',
    status: 'PUBLISHED',
    createdAt: '2026-08-01',
    fields: [
      { id: 'f-1', label: 'Overall Quarterly Performance Self-Rating (1-5 Stars)', type: 'RATING', required: true },
      { id: 'f-2', label: 'Key Achievements & Delivered Milestones', type: 'TEXTAREA', required: true },
      { id: 'f-3', label: 'Department / Team Name', type: 'TEXT', required: true },
    ],
    responses: [
      { id: 'r-1', formId: 'form-1', respondentName: 'Simran Sharma (Senior Developer)', submittedAt: '2026-08-02 14:30', answers: { 'f-1': 5, 'f-2': 'Completed HRMS module refactoring and multi-role dashboard rollout ahead of schedule.', 'f-3': 'Engineering' } },
      { id: 'r-2', formId: 'form-1', respondentName: 'Rahul Verma (Product Lead)', submittedAt: '2026-08-03 11:15', answers: { 'f-1': 4, 'f-2': 'Finalized enterprise feature spec alignment with Emgage and Keka benchmarks.', 'f-3': 'Product' } },
      { id: 'r-3', formId: 'form-1', respondentName: 'Pooja Gupta (HR Business Partner)', submittedAt: '2026-08-04 16:45', answers: { 'f-1': 5, 'f-2': 'Successfully onboarded 12 new hires and digitized employee verification workflows.', 'f-3': 'Human Resources' } },
    ],
  },
  {
    id: 'form-2',
    title: 'Employee Workplace Engagement & Pulse Survey',
    description: 'Anonymous pulse check on work-life balance, culture, and management support.',
    category: 'Survey',
    status: 'PUBLISHED',
    createdAt: '2026-08-03',
    fields: [
      { id: 'f-1', label: 'How satisfied are you with work flexibility and culture?', type: 'RATING', required: true },
      { id: 'f-2', label: 'Suggestions for workplace improvement', type: 'TEXTAREA', required: false },
    ],
    responses: [
      { id: 'r-4', formId: 'form-2', respondentName: 'Anil Kumar (DevOps Lead)', submittedAt: '2026-08-04 09:20', answers: { 'f-1': 5, 'f-2': 'Great work culture and supportive leadership!' } },
    ],
  },
  {
    id: 'form-3',
    title: 'New Joiner 30-Day Onboarding Feedback',
    description: 'Feedback survey for new joiners completing their first 30 days.',
    category: 'Onboarding',
    status: 'INACTIVE',
    createdAt: '2026-07-15',
    fields: [
      { id: 'f-1', label: 'Was your laptop and IT provisioning completed on Day 1?', type: 'TOGGLE', required: true },
      { id: 'f-2', label: 'Feedback for your assigned buddy', type: 'TEXTAREA', required: false },
    ],
    responses: [],
  },
]

export const useFormStore = create<FormStore>((set, get) => ({
  forms: INITIAL_FORMS,

  addForm: (data) => {
    const newForm: FormDefinition = {
      ...data,
      id: `form-${Date.now()}`,
      responses: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }
    set({ forms: [newForm, ...get().forms] })
    return newForm
  },

  toggleStatus: (id) => {
    set({
      forms: get().forms.map((f) =>
        f.id === id
          ? { ...f, status: f.status === 'PUBLISHED' ? 'INACTIVE' : 'PUBLISHED' }
          : f
      ),
    })
  },

  deleteForm: (id) => {
    set({ forms: get().forms.filter((f) => f.id !== id) })
  },

  submitResponse: (formId, respondentName, answers) => {
    const newResp: FormResponse = {
      id: `resp-${Date.now()}`,
      formId,
      respondentName,
      submittedAt: new Date().toLocaleString(),
      answers,
    }

    set({
      forms: get().forms.map((f) =>
        f.id === formId
          ? { ...f, responses: [newResp, ...f.responses] }
          : f
      ),
    })
  },
}))
