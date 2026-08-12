import { create } from 'zustand'
import { hasBackend } from '@/config/env'
import { formsService } from '@/services/formsService'

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
  answers: Record<string, string | number | boolean>
}

export type FormDefinition = {
  id: string
  title: string
  description: string
  category: 'Appraisal' | 'Survey' | 'Feedback' | 'Onboarding'
  fields: FormField[]
  responses: FormResponse[]
  createdAt: string
}

type FormStore = {
  forms: FormDefinition[]
  loading: boolean
  fetchForms: () => Promise<void>
  addForm: (form: Omit<FormDefinition, 'id' | 'responses' | 'createdAt'>) => Promise<FormDefinition>
  deleteForm: (id: string) => Promise<void>
  submitResponse: (formId: string, respondentName: string, answers: Record<string, string | number>) => Promise<void>
  hasUserSubmitted: (formId: string, respondentName: string) => FormResponse | undefined
}

const INITIAL_FORMS: FormDefinition[] = [
  {
    id: 'form-1',
    title: 'Q3 2026 360-Degree Performance Appraisal',
    description: 'Quarterly review evaluating leadership, key deliverables, and team collaboration.',
    category: 'Appraisal',
    createdAt: '2026-08-01',
    fields: [
      { id: 'f-1', label: 'Overall Quarterly Performance Self-Rating (1-5 Stars)', type: 'RATING', required: true },
      { id: 'f-2', label: 'Key Achievements & Delivered Milestones', type: 'TEXTAREA', required: true },
      { id: 'f-3', label: 'Department / Team Name', type: 'TEXT', required: true },
    ],
    responses: [
      { id: 'r-1', formId: 'form-1', respondentName: 'Simran Sharma', submittedAt: '2026-08-02 14:30', answers: { 'f-1': 5, 'f-2': 'Completed HRMS module refactoring and multi-role dashboard rollout ahead of schedule.', 'f-3': 'Engineering' } },
      { id: 'r-2', formId: 'form-1', respondentName: 'Rahul Verma', submittedAt: '2026-08-03 11:15', answers: { 'f-1': 4, 'f-2': 'Finalized enterprise feature spec alignment with Emgage and Keka benchmarks.', 'f-3': 'Product' } },
    ],
  },
  {
    id: 'form-2',
    title: 'Employee Workplace Engagement & Pulse Survey',
    description: 'Anonymous pulse check on work-life balance, culture, and management support.',
    category: 'Survey',
    createdAt: '2026-08-03',
    fields: [
      { id: 'f-1', label: 'How satisfied are you with work flexibility and culture?', type: 'RATING', required: true },
      { id: 'f-2', label: 'Suggestions for workplace improvement', type: 'TEXTAREA', required: false },
    ],
    responses: [
      { id: 'r-4', formId: 'form-2', respondentName: 'Anil Kumar', submittedAt: '2026-08-04 09:20', answers: { 'f-1': 5, 'f-2': 'Great work culture and supportive leadership!' } },
    ],
  },
  {
    id: 'form-3',
    title: 'New Joiner 30-Day Onboarding Feedback',
    description: 'Feedback survey for new joiners completing their first 30 days.',
    category: 'Onboarding',
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
  loading: false,

  fetchForms: async () => {
    if (!hasBackend) return
    set({ loading: true })
    try {
      const backendForms = await formsService.listForms()
      set({ forms: backendForms.length > 0 ? backendForms : INITIAL_FORMS })
    } catch (err) {
      console.error('Failed to fetch forms:', err)
    } finally {
      set({ loading: false })
    }
  },

  addForm: async (data) => {
    if (hasBackend) {
      try {
        const created = await formsService.createForm(data)
        set({ forms: [created, ...get().forms] })
        return created
      } catch (err) {
        console.error('Failed to create form:', err)
      }
    }
    const newForm: FormDefinition = {
      ...data,
      id: `form-${Date.now()}`,
      responses: [],
      createdAt: new Date().toISOString().slice(0, 10),
    }
    set({ forms: [newForm, ...get().forms] })
    return newForm
  },

  deleteForm: async (id) => {
    if (hasBackend) {
      try {
        await formsService.deleteForm(id)
      } catch (err) {
        console.error('Failed to delete form:', err)
      }
    }
    set({ forms: get().forms.filter((f) => f.id !== id) })
  },

  hasUserSubmitted: (formId, respondentName) => {
    const form = get().forms.find((f) => f.id === formId)
    if (!form) return undefined
    return form.responses.find(
      (r) => r.respondentName.trim().toLowerCase() === respondentName.trim().toLowerCase()
    )
  },

  submitResponse: async (formId, respondentName, answers) => {
    const existing = get().hasUserSubmitted(formId, respondentName)
    if (existing) return

    let newResp: FormResponse
    if (hasBackend) {
      try {
        newResp = await formsService.submitResponse(formId, respondentName, answers)
      } catch (err) {
        console.error('Failed to submit response:', err)
        return
      }
    } else {
      newResp = {
        id: `resp-${Date.now()}`,
        formId,
        respondentName: respondentName.trim(),
        submittedAt: new Date().toLocaleString(),
        answers,
      }
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
