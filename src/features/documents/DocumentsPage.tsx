import { useEffect, useState } from 'react'
import { AlertCircle, Download, FileText, Search, Upload } from 'lucide-react'
import Card from '@/shared/components/Card'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
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
  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-ctl bg-wash">
          <FileText size={16} className="text-muted" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium">{doc.name}</p>
          <p className="tnum mt-0.5 text-[11.5px] text-muted">
            {doc.fileType} · {formatSize(doc.sizeKb)}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-[12.5px] leading-relaxed text-muted">
        {doc.description}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-hairline pt-3">
        <p className="tnum truncate text-[11.5px] text-muted">Updated {formatDate(doc.updatedAt)}</p>

        <button
          type="button"
          aria-label={`Download ${doc.name}`}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-ctl border border-hairline-strong bg-surface px-2.5 text-[12px] font-medium transition-colors hover:border-pine hover:text-pine"
        >
          <Download size={13} />
          {canManage ? 'Download' : 'View'}
        </button>
      </div>
    </Card>
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

export default function DocumentsPage() {
  const user = useAuthStore((s) => s.user)!

  const [data, setData] = useState<DocumentsData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [category, setCategory] = useState<DocumentCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [term, setTerm] = useState('')

  // Debounced — a real API should not be hit on every keystroke.
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

  const tabs: Array<DocumentCategory | 'ALL'> = ['ALL', ...DOCUMENT_CATEGORIES]
  const canManage = data?.canManage ?? false

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] leading-tight font-semibold tracking-[-0.02em]">
            Documents
          </h1>
          <p className="mt-1.5 text-[14px] text-muted">
            Company policies, letter templates and compliance records.
          </p>
        </div>

        {/* §10: a Manager gets Documents view-only — no upload button at all. */}
        {canManage && (
          <Button>
            <Upload size={15} />
            Upload
          </Button>
        )}
      </div>

      {!canManage && status === 'ready' && (
        <div className="mt-4 flex items-center gap-2">
          <Badge tone="neutral">View only</Badge>
          <p className="text-[12.5px] text-muted">
            Your role can read these documents but not change them.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:max-w-xs lg:flex-1">
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
            className="h-10 w-full rounded-ctl border border-hairline-strong bg-surface pr-3 pl-9 text-[14px] transition-colors placeholder:text-muted/70 hover:border-muted/50 focus:border-pine"
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
                className={`shrink-0 rounded-ctl px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-pine-tint font-medium text-pine-deep'
                    : 'text-muted hover:bg-wash hover:text-ink'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab}
                {data && (
                  <span className="tnum ml-1.5 text-[12px]">{data.counts[tab] ?? 0}</span>
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'ready' && data && data.documents.length === 0 && (
        <Card className="mt-6 px-4 py-16 text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-wash">
            <FileText size={18} className="text-muted" aria-hidden="true" />
          </span>
          <p className="mt-4 text-[14px] font-medium">No documents found</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
            Try a different search term, or pick another category.
          </p>
        </Card>
      )}

      {status === 'ready' && data && data.documents.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.documents.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} canManage={canManage} />
          ))}
        </div>
      )}
    </div>
  )
}
