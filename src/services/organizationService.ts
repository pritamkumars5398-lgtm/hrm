import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import { INDUSTRIES, mockOrganization, type Organization } from '@/mock/mockOrganization'

export type { Organization }
export { INDUSTRIES }

export type CreateOrganizationPayload = {
  name: string
  address: string
  industry: string
  jobTitle?: string
  /** Only used by the mock path — the API takes the owner from the JWT, not the body. */
  ownerId: string
}

/** Thrown for expected, displayable failures. */
export class OrganizationError extends Error {}

const LATENCY_MS = 800
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

const runtimeOrgs: Organization[] = []

/**
 * Organisation + membership is **access-control**, not HR business data, so it is
 * inside this phase's backend scope (§11.4). Hits NestJS when the API is
 * configured; falls back to mock so the Vercel demo runs without a backend.
 */
export const organizationService = {
  async create(payload: CreateOrganizationPayload): Promise<Organization> {
    if (hasBackend) {
      try {
        // ownerId is deliberately not sent — the server takes it from the verified
        // JWT. Trusting a client-supplied owner would let anyone create a company
        // owned by someone else.
        const { data } = await apiClient.post<{ organization: Organization }>('/organizations', {
          name: payload.name,
          address: payload.address,
          industry: payload.industry,
          jobTitle: payload.jobTitle,
        })
        return data.organization
      } catch (error) {
        throw new OrganizationError(
          apiErrorMessage(error, 'We could not create your workspace. Please try again.'),
        )
      }
    }

    await delay()

    const org: Organization = {
      id: `org-${crypto.randomUUID().slice(0, 8)}`,
      name: payload.name.trim(),
      address: payload.address.trim(),
      industry: payload.industry,
      ownerId: payload.ownerId,
      createdAt: new Date().toISOString(),
      // A brand-new company starts with exactly one person in it: its owner.
      employeeCount: 1,
    }

    runtimeOrgs.push(org)
    return org
  },

  /** Company profile edits from Settings. Owner-only — the server enforces it too. */
  async update(patch: {
    name?: string
    address?: string
    industry?: string
    /** '' clears it. */
    leaveNotificationEmail?: string
  }): Promise<Organization> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.patch<Organization>('/organizations/me', patch)
        return data
      } catch (error) {
        throw new OrganizationError(
          apiErrorMessage(error, 'We could not save your company details.'),
        )
      }
    }

    await delay()
    Object.assign(mockOrganization, patch)
    return mockOrganization
  },

  async getMine(): Promise<Organization | null> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<Organization>('/organizations/me')
        return data
      } catch {
        return null
      }
    }

    await delay()
    return mockOrganization
  },

  async getById(id: string): Promise<Organization | null> {
    await delay()
    return [mockOrganization, ...runtimeOrgs].find((o) => o.id === id) ?? null
  },

  getIndustryOptions() {
    return INDUSTRIES.map((i) => ({ value: i, label: i }))
  },
}
