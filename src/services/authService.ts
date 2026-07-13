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

/** Thrown for expected, displayable failures — a wrong password, a taken email. */
export class AuthError extends Error {}

const LATENCY_MS = 700
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

/** Session users the demo creates at runtime, alongside the seeded ones. */
const runtimeUsers: User[] = []

const findByEmail = (email: string) =>
  [...mockUsers, ...runtimeUsers].find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

/**
 * Mock implementation. In Phase 2 each method becomes an axios call to the
 * NestJS auth module — the signatures and thrown AuthError stay identical, so
 * no component changes (§9).
 */
export const authService = {
  async login({ email, password }: LoginPayload): Promise<User> {
    await delay()

    const user = findByEmail(email)
    // Deliberately identical message for unknown-email and wrong-password —
    // telling an attacker which one was wrong is an account-enumeration leak.
    if (!user || user.password !== password) {
      throw new AuthError('That email and password combination does not match an account.')
    }

    return user
  },

  async signup({ fullName, email, password }: SignupPayload): Promise<User> {
    await delay()

    if (findByEmail(email)) {
      throw new AuthError('An account with this email already exists. Try signing in instead.')
    }

    // The person who signs up owns the company they are about to create (§11.2).
    // organizationId stays null until the Company Details step.
    const user: User = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      organizationId: null,
      email: email.trim().toLowerCase(),
      password,
      name: fullName.trim(),
      jobTitle: '',
      role: 'OWNER',
      avatarInitials: initialsOf(fullName),
    }

    runtimeUsers.push(user)
    return user
  },

  /** Placeholder — real OAuth lands with the Google Sign-In item (§4). */
  async loginWithGoogle(): Promise<User> {
    await delay()
    throw new AuthError('Google Sign-In is not wired up yet — use a demo account below.')
  },

  /**
   * Resolves whether or not the email exists. Confirming which addresses have
   * accounts would be the same enumeration leak that `login` avoids, so the
   * caller always shows the same "check your inbox" screen.
   *
   * No email is actually sent in this phase (§11.3 — no SMTP). When an account
   * does match, we hand back a mock reset link so the flow is demoable.
   */
  async requestPasswordReset({ email }: { email: string }): Promise<{ resetLink: string | null }> {
    await delay()

    const user = findByEmail(email)
    if (!user) return { resetLink: null }

    const token = crypto.randomUUID()
    return { resetLink: `${window.location.origin}/reset-password?token=${token}` }
  },

  getDemoCredentials() {
    return {
      password: DEMO_PASSWORD,
      accounts: mockUsers.map((u) => ({ email: u.email, role: u.role, name: u.name })),
    }
  },
}

function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0]![0]!
  const last = parts.length > 1 ? parts[parts.length - 1]![0]! : ''
  return (first + last).toUpperCase()
}
