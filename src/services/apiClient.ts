import axios, { AxiosError } from 'axios'
import { env } from '@/config/env'

/**
 * `withCredentials` is the whole point: the JWT lives in an httpOnly cookie the
 * browser will only attach to credentialed requests. Nothing here ever reads or
 * stores the token — it cannot, and that is by design (§11.1).
 */
export const apiClient = axios.create({
  baseURL: env.apiBaseUrl ?? undefined,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

type ApiErrorBody = {
  message?: string | string[]
  error?: string
}

/**
 * Turns an axios failure into the single, displayable sentence a form can show.
 * NestJS returns validation failures as an array of messages.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const body = error.response?.data as ApiErrorBody | undefined
    const message = body?.message

    if (Array.isArray(message) && message.length > 0) return message[0]!
    if (typeof message === 'string' && message) return message

    if (!error.response) {
      return 'Could not reach the server. Is the backend running?'
    }
  }

  return fallback
}
