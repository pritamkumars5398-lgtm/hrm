import { create } from 'zustand'
import { apiClient } from '@/services/apiClient'

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


export const useFormStore = create<FormStore>((set, get) => ({
  forms: [],
  loading: false,

  fetchForms: async () => {
    try {
      set({ loading: true })
      const res = await apiClient.get<FormDefinition[]>('/forms')
      set({ forms: res.data ?? [] })
    } catch (err) {
      console.error('Could not load forms', err)
    } finally {
      set({ loading: false })
    }
  },

  addForm: async (data) => {
    const res = await apiClient.post<FormDefinition>('/forms', {
      title: data.title,
      description: data.description,
      category: data.category,
      fields: data.fields,
      status: 'PUBLISHED',
    })
    const saved = res.data
    set({ forms: [saved, ...get().forms.filter((f) => f.id !== saved.id)] })
    return saved
  },

  deleteForm: async (id: string) => {
    await apiClient.delete(`/forms/${id}`)
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

    const res = await apiClient.post<FormResponse>(`/forms/${formId}/submit`, {
      respondentName,
      answers,
    })
    const newResp = res.data
    set({
      forms: get().forms.map((f) =>
        f.id === formId ? { ...f, responses: [newResp, ...f.responses] } : f
      ),
    })
  },
}))
