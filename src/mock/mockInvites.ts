import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type InvitableRole = 'HR' | 'MANAGER'
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REVOKED'

export type Invite = {
  id: string
  organizationId: string
  email: string
  role: InvitableRole
  status: InviteStatus
  invitedBy: string
  createdAt: string
  expiresAt: string
}

const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

export const mockInvites: Invite[] = [
  {
    id: 'inv-1',
    organizationId: MOCK_ORGANIZATION_ID,
    email: 'dan.whitfield@alderway.com',
    role: 'MANAGER',
    status: 'PENDING',
    invitedBy: 'usr-1',
    createdAt: daysAgo(2),
    expiresAt: daysFromNow(5),
  },
  {
    id: 'inv-2',
    organizationId: MOCK_ORGANIZATION_ID,
    email: 'aisha.rahman@alderway.com',
    role: 'HR',
    status: 'PENDING',
    invitedBy: 'usr-1',
    createdAt: daysAgo(6),
    expiresAt: daysFromNow(1),
  },
]
