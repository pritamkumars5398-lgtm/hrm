import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type Organization = {
  id: string
  name: string
  address: string
  industry: string
  /** The user who created it — its Owner (§11.2). */
  ownerId: string
  createdAt: string
  /** Absent from the API response — headcount is HR business data, which is mock-only (§11.4). */
  employeeCount?: number
  /** Where a "someone applied for leave" notification email goes. */
  leaveNotificationEmail?: string | null
}

export const INDUSTRIES = [
  'Software & Technology',
  'Financial Services',
  'Healthcare',
  'Manufacturing',
  'Retail & E-commerce',
  'Professional Services',
  'Education',
  'Hospitality',
  'Construction',
  'Logistics & Transport',
  'Non-profit',
  'Other',
] as const

/** The company the three seeded demo accounts belong to (§9). */
export const mockOrganization: Organization = {
  id: MOCK_ORGANIZATION_ID,
  name: 'Alderway Labs',
  address: '4 Wharf Road, London, E15 2QR, United Kingdom',
  industry: 'Software & Technology',
  ownerId: 'usr-1',
  createdAt: '2024-02-11T09:00:00.000Z',
  employeeCount: 248,
  leaveNotificationEmail: null,
}
