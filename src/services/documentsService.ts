import {
  DOCUMENT_CATEGORIES,
  mockDocuments,
  type CompanyDocument,
  type DocumentCategory,
} from '@/mock/mockDocuments'
import type { Role } from './authService'

export type { CompanyDocument, DocumentCategory }
export { DOCUMENT_CATEGORIES }

const LATENCY_MS = 500
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

export type DocumentsQuery = {
  search?: string
  category?: DocumentCategory | 'ALL'
}

export type DocumentsData = {
  documents: CompanyDocument[]
  counts: Record<string, number>
  /** §10: a Manager gets Documents **view-only** — no upload, no delete. */
  canManage: boolean
}

export const documentsService = {
  /** Mock-only (§11.4). Cloudinary uploads land here in Phase 2. */
  async get(role: Role, query: DocumentsQuery = {}): Promise<DocumentsData> {
    await delay()

    const { search = '', category = 'ALL' } = query
    const term = search.trim().toLowerCase()

    const documents = mockDocuments
      .filter((doc) => {
        const matchesTerm =
          !term ||
          doc.name.toLowerCase().includes(term) ||
          doc.description.toLowerCase().includes(term)

        const matchesCategory = category === 'ALL' || doc.category === category
        return matchesTerm && matchesCategory
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    const counts: Record<string, number> = { ALL: mockDocuments.length }
    for (const c of DOCUMENT_CATEGORIES) {
      counts[c] = mockDocuments.filter((d) => d.category === c).length
    }

    return {
      documents,
      counts,
      canManage: role === 'OWNER' || role === 'HR',
    }
  },
}
