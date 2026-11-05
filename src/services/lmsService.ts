import { apiClient } from './apiClient'

export type Course = {
  id: string
  title: string
  category: 'Compliance' | 'Engineering' | 'Management' | 'Security'
  durationMins: number
  progressPercent: number
  isMandatory: boolean
  instructor: string
  description?: string
  createdAt?: string
}

export type CreateCoursePayload = {
  title: string
  category: 'Compliance' | 'Engineering' | 'Management' | 'Security'
  durationMins: number
  isMandatory?: boolean
  instructor?: string
  description?: string
}

export const lmsService = {
  getCourses: async (): Promise<Course[]> => {
    const res = await apiClient.get<Course[]>('/lms/courses')
    return res.data
  },

  updateProgress: async (courseId: string, progressDelta: number = 25): Promise<Course> => {
    const res = await apiClient.patch<Course>(`/lms/courses/${courseId}/progress`, {
      progressDelta,
    })
    return res.data
  },

  createCourse: async (payload: CreateCoursePayload): Promise<Course> => {
    const res = await apiClient.post<Course>('/lms/courses', payload)
    return res.data
  },

  deleteCourse: async (id: string): Promise<void> => {
    await apiClient.delete(`/lms/courses/${id}`)
  },
}
