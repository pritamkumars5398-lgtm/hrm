import { hasBackend } from '@/config/env'
import { apiClient, apiErrorMessage } from './apiClient'
import {
  DOCUMENT_CATEGORIES,
  mockDocuments,
  type CompanyDocument,
  type DocumentCategory,
} from '@/mock/mockDocuments'

export type { CompanyDocument, DocumentCategory }
export { DOCUMENT_CATEGORIES }

export class DocumentsError extends Error {}

const LATENCY_MS = 500
const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS))

export type DocumentsQuery = {
  search?: string
  category?: DocumentCategory | 'ALL'
}

export type DocumentsData = {
  documents: CompanyDocument[]
  counts: Record<string, number>
}

export type UploadDocumentPayload = {
  name: string
  description: string
  category: DocumentCategory
}

/** Local mutable copy so uploads persist (mock path only). */
let companyDocuments: CompanyDocument[] = [...mockDocuments]

function fileTypeFor(file: File): CompanyDocument['fileType'] {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'doc' || ext === 'docx') return 'DOCX'
  if (ext === 'xls' || ext === 'xlsx') return 'XLSX'
  return 'PDF'
}

/**
 * Real backend once configured — a real Cloudinary-backed file, not a
 * fabricated size/type (§ Phase 3 §4.5). The mock path exists for the
 * offline/no-backend demo and has no real file behind each row.
 */
export const documentsService = {
  async get(query: DocumentsQuery = {}): Promise<DocumentsData> {
    if (hasBackend) {
      try {
        const { data } = await apiClient.get<DocumentsData>('/documents', {
          params: {
            search: query.search || undefined,
            category: query.category && query.category !== 'ALL' ? query.category : undefined,
          },
        })
        return data
      } catch (error) {
        throw new DocumentsError(apiErrorMessage(error, 'We could not load your documents.'))
      }
    }

    await delay()

    const { search = '', category = 'ALL' } = query
    const term = search.trim().toLowerCase()

    const documents = companyDocuments
      .filter((doc) => {
        const matchesTerm =
          !term ||
          doc.name.toLowerCase().includes(term) ||
          doc.description.toLowerCase().includes(term)

        const matchesCategory = category === 'ALL' || doc.category === category
        return matchesTerm && matchesCategory
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

    const counts: Record<string, number> = { ALL: companyDocuments.length }
    for (const c of DOCUMENT_CATEGORIES) {
      counts[c] = companyDocuments.filter((d) => d.category === c).length
    }

    return { documents, counts }
  },

  async upload(file: File, payload: UploadDocumentPayload): Promise<CompanyDocument> {
    if (hasBackend) {
      try {
        const form = new FormData()
        form.append('file', file)
        form.append('name', payload.name)
        form.append('description', payload.description)
        form.append('category', payload.category)
        // Let axios/the browser set the multipart boundary itself.
        const { data } = await apiClient.post<CompanyDocument>('/documents', form, {
          headers: { 'Content-Type': undefined },
        })
        return data
      } catch (error) {
        throw new DocumentsError(apiErrorMessage(error, 'We could not upload that document.'))
      }
    }

    await delay()

    const doc: CompanyDocument = {
      id: `doc-${String(companyDocuments.length + 1).padStart(3, '0')}`,
      organizationId: companyDocuments[0]?.organizationId ?? 'org-alderway',
      name: payload.name.trim(),
      description: payload.description.trim(),
      category: payload.category,
      fileType: fileTypeFor(file),
      sizeKb: Math.round(file.size / 1024),
      updatedAt: new Date().toISOString().slice(0, 10),
      updatedBy: 'Priya Nair',
    }

    companyDocuments = [doc, ...companyDocuments]
    return doc
  },

  async remove(id: string): Promise<void> {
    if (hasBackend) {
      try {
        await apiClient.delete(`/documents/${id}`)
        return
      } catch (error) {
        throw new DocumentsError(apiErrorMessage(error, 'We could not delete that document.'))
      }
    }

    await delay()
    companyDocuments = companyDocuments.filter((d) => d.id !== id)
  },
}
