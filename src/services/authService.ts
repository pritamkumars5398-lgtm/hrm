import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { DEMO_PASSWORD, mockUsers, type Role, type User } from '@/mock/mockUsers'

export type { Role, User }

export type SignupPayload = {
  fullName: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

/** Stands in for the profile Google returns after a successful OAuth exchange. */
export type GoogleAccount = {
  email: string
  name: string
  /** Prototype-only hint shown in the simulated chooser. */
  note: string
}

/** Thrown for expected, displayable failures — a wrong password, a taken email. */
export class AuthError extends Error {}

const LATENCY_MS = 700
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Session users the mock demo creates at runtime, alongside the seeded ones. */
const runtimeUsers: User[] = []

const findByEmail = (email: string) =>
  [...mockUsers, ...runtimeUsers].find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0]!
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : ''
  return (first + last).toUpperCase()
}

/**
 * Talks to the NestJS auth module when VITE_API_BASE_URL is set, and falls back
 * to mock data when it is not — so the Vercel demo runs with no backend at all,
 * while local development runs against the real thing. Components never know
 * which path they got (§9).
 */
export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<User>('/auth/login', payload)
        return data
      } catch (error) {
        throw new AuthError(
          apiErrorMessage(error, 'That email and password combination does not match an account.'),
        )
      }
    }

    await delay()
    const user = findByEmail(payload.email)
    // Deliberately identical message for unknown-email and wrong-password —
    // telling an attacker which one was wrong is an account-enumeration leak.
    if (!user || user.password !== payload.password) {
      throw new AuthError('That email and password combination does not match an account.')
    }
    return user
  },

  async signup(payload: SignupPayload): Promise<User> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<User>('/auth/signup', payload)
        return data
      } catch (error) {
        throw new AuthError(apiErrorMessage(error, 'We could not create your account.'))
      }
    }

    await delay()
    if (findByEmail(payload.email)) {
      throw new AuthError('An account with this email already exists. Try signing in instead.')
    }

    // The person who signs up owns the company they are about to create (§11.2).
    // organizationId stays null until the Company Details step.
    const user: User = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: null,
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      name: payload.fullName.trim(),
      jobTitle: '',
      role: 'OWNER',
      avatarInitials: initialsOf(payload.fullName),
    }

    runtimeUsers.push(user)
    return user
  },

  /**
   * Simulated OAuth. The real flow redirects to Google, returns an id_token, and
   * the backend verifies it against Google's certs before trusting the email.
   * This signature is already the final one — only the body changes.
   */
  async loginWithGoogle({ email, name }: GoogleAccount): Promise<User> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.post<User>('/auth/google', { email, name })
        return data
      } catch (error) {
        throw new AuthError(apiErrorMessage(error, 'Google Sign-In failed.'))
      }
    }

    await delay()
    const existing = findByEmail(email)
    if (existing) return existing

    const user: User = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: null,
      email: email.trim().toLowerCase(),
      // A Google-authenticated account has no local password.
      password: '',
      name,
      jobTitle: '',
      role: 'OWNER',
      avatarInitials: initialsOf(name),
    }

    runtimeUsers.push(user)
    return user
  },

  /** Restores the session from the httpOnly cookie on a page refresh. */
  async me(): Promise<User | null> {
    if (!hasBackend) return null

    try {
      const { data } = await apiClient.get<User>('/auth/me')
      return data
    } catch {
      // 401 simply means "not signed in" — not an error worth surfacing.
      return null
    }
  },

  async logout(): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.post('/auth/logout')
      } catch {
        // Even if the call fails, the client clears its own session below.
      }
    }
  },

  /**
   * Resolves whether or not the email exists — confirming which addresses have
   * accounts would be the same enumeration leak `login` avoids.
   *
   * No email is sent in this phase (§11.3 — no SMTP), so a matching account
   * hands back a mock link to keep the flow demoable.
   */
  async requestPasswordReset({ email }: { email: string }): Promise<{ resetLink: string | null }> {
    await delay()

    const user = findByEmail(email)
    if (!user) return { resetLink: null }

    const token = crypto.randomUUID()
    return { resetLink: `${window.location.origin}/reset-password?token=${token}` }
  },

  /** The accounts the simulated chooser offers. Not a real Google session. */
  getSimulatedGoogleAccounts(): GoogleAccount[] {
    return [
      { email: 'owner@demo.com', name: 'Priya Nair', note: 'Existing Owner account' },
      { email: 'hr@demo.com', name: 'Marta Lindqvist', note: 'Existing HR account' },
      { email: 'ada@newco.com', name: 'Ada Lovelace', note: 'New — creates a workspace' },
    ]
  },

  getDemoCredentials() {
    return {
      password: DEMO_PASSWORD,
      accounts: mockUsers.map((u) => ({ email: u.email, role: u.role, name: u.name })),
    }
  },
}
