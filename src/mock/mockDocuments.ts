import { MOCK_ORGANIZATION_ID } from './mockUsers'

export type DocumentCategory =
  | 'Policies'
  | 'Templates'
  | 'Contracts'
  | 'Compliance'
  | 'Onboarding'

export type CompanyDocument = {
  id: string
  organizationId: string
  name: string
  description: string
  category: DocumentCategory
  fileType: 'PDF' | 'DOCX' | 'XLSX'
  sizeKb: number
  updatedAt: string
  updatedBy: string
  /** Real backend only — the Cloudinary secure_url to open/download. Mock docs have no real file behind them. */
  cloudinaryUrl?: string
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Policies',
  'Templates',
  'Contracts',
  'Compliance',
  'Onboarding',
]

type Seed = [
  name: string,
  description: string,
  category: DocumentCategory,
  fileType: CompanyDocument['fileType'],
  sizeKb: number,
  updatedAt: string,
]

const SEEDS: Seed[] = [
  ['Employee handbook', 'Everything a new joiner needs to know, start to finish.', 'Policies', 'PDF', 2480, '2026-05-02'],
  ['Remote working policy', 'Expectations for hybrid and fully remote staff.', 'Policies', 'PDF', 412, '2026-04-18'],
  ['Expenses policy', 'What can be claimed, and how to claim it.', 'Policies', 'PDF', 288, '2026-03-11'],
  ['Code of conduct', 'Standards of behaviour expected of everyone.', 'Policies', 'PDF', 356, '2026-01-22'],
  ['Parental leave policy', 'Maternity, paternity and shared parental leave.', 'Policies', 'PDF', 502, '2026-02-09'],

  ['Offer letter template', 'Standard offer letter, ready to personalise.', 'Templates', 'DOCX', 96, '2026-06-01'],
  ['Appointment letter template', 'Formal appointment confirmation.', 'Templates', 'DOCX', 88, '2026-06-01'],
  ['Promotion letter template', 'For internal moves and promotions.', 'Templates', 'DOCX', 74, '2026-05-14'],
  ['Reference letter template', 'Standard employment reference.', 'Templates', 'DOCX', 62, '2026-04-30'],

  ['Standard employment contract', 'Full-time permanent contract, current version.', 'Contracts', 'PDF', 640, '2026-06-12'],
  ['Contractor agreement', 'For fixed-term and freelance engagements.', 'Contracts', 'PDF', 528, '2026-05-27'],
  ['NDA — mutual', 'Two-way confidentiality agreement.', 'Contracts', 'PDF', 214, '2026-03-03'],

  ['GDPR data-handling guide', 'How we store and process personal data.', 'Compliance', 'PDF', 1140, '2026-04-05'],
  ['Health & safety statement', 'Annual statement, signed by the Owner.', 'Compliance', 'PDF', 396, '2026-01-15'],
  ['Right to work checklist', 'Documents to verify before day one.', 'Compliance', 'XLSX', 48, '2026-02-20'],

  ['Onboarding checklist', 'Week-one tasks for the new joiner and their manager.', 'Onboarding', 'XLSX', 64, '2026-06-08'],
  ['IT setup guide', 'Accounts, hardware and access requests.', 'Onboarding', 'PDF', 720, '2026-05-19'],
  ['First 90 days plan', 'Template for structuring a new hire’s first quarter.', 'Onboarding', 'DOCX', 110, '2026-04-02'],
]

export const mockDocuments: CompanyDocument[] = SEEDS.map(
  ([name, description, category, fileType, sizeKb, updatedAt], i) => ({
    id: `doc-${String(i + 1).padStart(3, '0')}`,
    organizationId: MOCK_ORGANIZATION_ID,
    name,
    description,
    category,
    fileType,
    sizeKb,
    updatedAt,
    updatedBy: i % 3 === 0 ? 'Marta Lindqvist' : 'Priya Nair',
  }),
)
