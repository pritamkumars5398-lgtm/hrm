export type Role = 'OWNER' | 'HR' | 'MANAGER'

export type User = {
  id: string
  /** null between signup and completing the Company Details step, which creates the org (§11.2). */
  organizationId: string | null
  email: string
  /** Mock only. A real password never reaches the client — this disappears in Phase 2. */
  password: string
  name: string
  jobTitle: string
  role: Role
  avatarInitials: string
  /** Mock only. Tracks if the user must reset their temp password. */
  requiresPasswordReset?: boolean
  /** Real backend only. Populated after login when the user belongs to at least one org. */
  memberships?: Array<{
    id: string
    userId: string
    organizationId: string
    jobTitle: string
    permissions: string[]
  }>
}

export const MOCK_ORGANIZATION_ID = 'org-alderway'

/**
 * Three accounts across three roles in the same company (§9) — this is what
 * lets us demo that an invited HR or Manager only sees their own modules.
 * Shared password so the demo is one thing to remember.
 */
export const DEMO_PASSWORD = 'demo1234'

export const mockUsers: User[] = [
  {
    id: 'usr-1',
    organizationId: MOCK_ORGANIZATION_ID,
    email: 'owner@demo.com',
    password: DEMO_PASSWORD,
    name: 'Priya Nair',
    jobTitle: 'Founder & CEO',
    role: 'OWNER',
    avatarInitials: 'PN',
  },
  {
    id: 'usr-2',
    organizationId: MOCK_ORGANIZATION_ID,
    email: 'hr@demo.com',
    password: DEMO_PASSWORD,
    name: 'Marta Lindqvist',
    jobTitle: 'HR Manager',
    role: 'HR',
    avatarInitials: 'ML',
  },
  {
    id: 'usr-3',
    organizationId: MOCK_ORGANIZATION_ID,
    email: 'manager@demo.com',
    password: DEMO_PASSWORD,
    name: 'Samuel Okafor',
    jobTitle: 'Engineering Manager',
    role: 'MANAGER',
    avatarInitials: 'SO',
  },
]
