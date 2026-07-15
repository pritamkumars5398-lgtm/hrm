import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Download,
  FileText,
  Search,
  Upload,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import { useAuthStore } from '@/features/auth/store/authStore'
import {
  DOCUMENT_CATEGORIES,
  documentsService,
  type CompanyDocument,
  type DocumentCategory,
  type DocumentsData,
} from '@/services/documentsService'

const formatSize = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`)

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function DocumentCard({ doc, canManage }: { doc: CompanyDocument; canManage: boolean }) {
  // Category-based styling config
  const categoryConfig = {
    Policies: {
      bg: 'bg-pine-tint text-pine',
      border: 'hover:border-pine/30',
      glow: 'hover:shadow-[0_0_15px_rgba(31,77,63,0.05)]',
    },
    Templates: {
      bg: 'bg-ochre-tint text-ochre-deep',
      border: 'hover:border-ochre/30',
      glow: 'hover:shadow-[0_0_15px_rgba(169,121,28,0.05)]',
    },
    Contracts: {
      bg: 'bg-wash text-ink',
      border: 'hover:border-hairline-strong',
      glow: 'hover:shadow-[0_0_15px_rgba(28,29,26,0.05)]',
    },
    Compliance: {
      bg: 'bg-clay-tint text-clay-deep',
      border: 'hover:border-clay/30',
      glow: 'hover:shadow-[0_0_15px_rgba(156,66,33,0.05)]',
    },
    Onboarding: {
      bg: 'bg-wash text-muted border border-hairline',
      border: 'hover:border-hairline-strong',
      glow: 'hover:shadow-[0_0_15px_rgba(107,109,102,0.05)]',
    },
  }[doc.category]

  // File type badge styling
  const fileTypeConfig = {
    PDF: 'bg-clay-tint text-clay-deep border border-clay/10',
    DOCX: 'bg-pine-tint text-pine-deep border border-pine/10',
    XLSX: 'bg-pine-tint text-pine border border-pine/15',
  }[doc.fileType]

  const btnConfig = 'bg-pine text-white hover:bg-pine-deep border-transparent'

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <Card className={`flex flex-col p-4 h-full justify-between transition-all duration-300 border border-hairline ${categoryConfig.glow} ${categoryConfig.border}`}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-ctl ${categoryConfig.bg}`}>
              <FileText size={16} aria-hidden="true" />
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-ctl ${fileTypeConfig}`}>
              {doc.fileType}
            </span>
          </div>

          <div className="mt-3">
            <p className="truncate text-[13.5px] font-semibold text-ink">{doc.name}</p>
            <p className="tnum mt-0.5 text-[11px] text-muted font-medium">
              Size: {formatSize(doc.sizeKb)}
            </p>
          </div>

          <p className="mt-3 line-clamp-3 text-[12.5px] leading-relaxed text-muted font-medium">
            {doc.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline/60 pt-3.5">
          <div className="min-w-0">
            <p className="tnum truncate text-[10.5px] text-muted font-semibold">Updated {formatDate(doc.updatedAt)}</p>
            <p className="truncate text-[9.5px] text-muted mt-0.5">By {doc.updatedBy}</p>
          </div>

          <button
            type="button"
            aria-label={`Download ${doc.name}`}
            className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-ctl px-3.5 text-[12px] font-bold transition-all duration-200 cursor-pointer border ${btnConfig} shadow-sm hover:shadow`}
          >
            <Download size={13} />
            {canManage ? 'Download' : 'View'}
          </button>
        </div>
      </Card>
    </motion.div>
  )
}

function CardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="size-9 shrink-0 animate-pulse rounded-ctl bg-wash" />
        <div className="flex-1">
          <div className="h-3.5 w-32 animate-pulse rounded bg-wash" />
          <div className="mt-2 h-3 w-20 animate-pulse rounded bg-wash" />
        </div>
      </div>
      <div className="mt-3 h-3 w-full animate-pulse rounded bg-wash" />
      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-wash" />
      <div className="mt-4 h-8 w-full animate-pulse rounded bg-wash" />
    </Card>
  )
}

type UploadModalProps = {
  open: boolean
  onClose: () => void
  onUpload: (payload: {
    name: string
    description: string
    category: DocumentCategory
    fileType: 'PDF' | 'DOCX' | 'XLSX'
  }) => Promise<void>
}

function UploadModal({ open, onClose, onUpload }: UploadModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [categoryInput, setCategoryInput] = useState<DocumentCategory>('Policies')
  const [fileTypeInput, setFileTypeInput] = useState<'PDF' | 'DOCX' | 'XLSX'>('PDF')
  const [submitting, setSubmitting] = useState(false)
  const [errorText, setErrorText] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName('')
      setDescription('')
      setCategoryInput('Policies')
      setFileTypeInput('PDF')
      setErrorText(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) {
      setErrorText('Please fill out all fields.')
      return
    }

    setSubmitting(true)
    setErrorText(null)

    try {
      await onUpload({
        name,
        description,
        category: categoryInput,
        fileType: fileTypeInput,
      })
      onClose()
    } catch {
      setErrorText('We could not upload the document.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload document"
      description="Add a new company policy, template or compliance record."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorText && (
          <div className="flex gap-2 rounded-ctl border border-clay/35 bg-clay/5 p-3 text-[12px] text-clay-deep">
            <AlertCircle size={15} className="mt-px shrink-0 text-clay" />
            <p>{errorText}</p>
          </div>
        )}

        <Input
          label="Document Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Employee Travel Policy"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value as DocumentCategory)}
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Select
            label="File Type"
            value={fileTypeInput}
            onChange={(e) => setFileTypeInput(e.target.value as any)}
            options={[
              { value: 'PDF', label: 'PDF Document' },
              { value: 'DOCX', label: 'Word Document (DOCX)' },
              { value: 'XLSX', label: 'Excel Spreadsheet (XLSX)' },
            ]}
          />
        </div>

        <Input
          label="Description / Purpose"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of what this document covers..."
          required
        />

        <div className="mt-6 flex justify-end gap-2 border-t border-hairline pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Uploading…
              </>
            ) : (
              'Upload file'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function DocumentsPage() {
  const user = useAuthStore((s) => s.user)!

  const [data, setData] = useState<DocumentsData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [category, setCategory] = useState<DocumentCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => setTerm(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    void documentsService
      .get(user.role, { search: term, category })
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [user.role, term, category])

  const handleUpload = async (payload: {
    name: string
    description: string
    category: DocumentCategory
    fileType: 'PDF' | 'DOCX' | 'XLSX'
  }) => {
    await documentsService.upload(user.role, payload)
    // Refetch
    setStatus('loading')
    try {
      const result = await documentsService.get(user.role, { search: term, category })
      setData(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  const tabs: Array<DocumentCategory | 'ALL'> = ['ALL', ...DOCUMENT_CATEGORIES]
  const canManage = data?.canManage ?? false

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">
              Documents
            </h1>
            <span className="flex size-6 items-center justify-center rounded-full bg-pine-tint text-pine">
              <Sparkles size={13} />
            </span>
          </div>
          <p className="mt-1.5 text-[14px] text-muted">
            Company policies, letter templates and compliance records.
          </p>
        </div>

        {canManage && (
          <Button onClick={() => setUploadOpen(true)} className="self-start sm:self-auto shadow-sm">
            <Upload size={15} />
            Upload
          </Button>
        )}
      </div>

      {!canManage && status === 'ready' && (
        <div className="flex items-center gap-2 bg-wash/50 border border-hairline px-3 py-2 rounded-ctl text-[12.5px] text-muted max-w-max">
          <Badge tone="neutral">View only</Badge>
          <p>
            Your role can read these documents but not change them.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            size={15}
            aria-hidden="true"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents…"
            aria-label="Search documents"
            className="h-10 w-full rounded-ctl border border-hairline-strong bg-surface pr-3 pl-9 text-[14px] transition-colors placeholder:text-muted/70 hover:border-muted/50 focus:border-pine focus:outline-none"
          />
        </div>

        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => {
            const active = category === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setCategory(tab)}
                aria-pressed={active}
                className={`shrink-0 rounded-ctl px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? 'bg-pine-tint font-medium text-pine-deep font-bold'
                    : 'text-muted hover:bg-wash hover:text-ink'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
                {data && (
                  <span className="tnum ml-1.5 text-[11px] bg-wash/80 border border-hairline px-1.5 py-0.2 rounded-full font-medium">
                    {data.counts[tab] ?? 0}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {status === 'error' && (
        <Card className="mt-6 flex items-start gap-3 border-clay/30 bg-clay/5 p-5">
          <AlertCircle size={17} className="mt-px shrink-0 text-clay" />
          <p className="text-[14px] font-medium text-clay">We could not load your documents.</p>
        </Card>
      )}

      {status === 'loading' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'ready' && data && data.documents.length === 0 && (
        <Card className="px-4 py-16 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-wash border border-hairline">
            <FileText size={18} className="text-muted" aria-hidden="true" />
          </span>
          <p className="mt-4 text-[14.5px] font-semibold text-ink">No documents found</p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted">
            Try a different search term, or pick another category.
          </p>
        </Card>
      )}

      {status === 'ready' && data && data.documents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {data.documents.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} canManage={canManage} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
    </motion.div>
  )
}
