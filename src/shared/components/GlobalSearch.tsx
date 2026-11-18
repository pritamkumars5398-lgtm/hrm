import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  FileText,
  Users,
  LayoutDashboard,
  Sparkles,
  Calendar,
  Clock,
  CreditCard,
  LifeBuoy,
  Settings,
  Briefcase,
  ChevronRight,
  UserPlus,
  FormInput,
  FolderKanban,
  GraduationCap,
  Timer,
  Receipt,
  Plane,
  ShieldCheck,
  Building2,
  Command,
} from 'lucide-react'
import { NAV_ITEMS, type NavItem } from '@/shared/config/navigation'
import { mockEmployees, type Employee } from '@/mock/mockEmployees'
import { mockDocuments, type CompanyDocument } from '@/mock/mockDocuments'
import { useCopilotDrawer } from '@/features/ai/copilotStore'
import type { Role } from '@/services/authService'

interface GlobalSearchProps {
  userRole?: Role
  userPermissions?: string[]
}

type SearchCategory = 'pages' | 'people' | 'documents' | 'actions'

interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  category: SearchCategory
  icon: typeof Search
  badge?: string
  action: () => void
}

export default function GlobalSearch({ userRole, userPermissions }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'all' | SearchCategory>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // 1. Keyboard Shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // 2. Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 3. Quick Action Definitions
  const quickActions: SearchResultItem[] = useMemo(
    () => [
      {
        id: 'action-leave',
        title: 'Apply for Leave',
        subtitle: 'Submit an annual, sick, or personal leave request',
        category: 'actions',
        icon: Calendar,
        badge: 'Action',
        action: () => {
          navigate('/dashboard/leave?action=apply')
          setIsOpen(false)
        },
      },
      {
        id: 'action-attendance',
        title: 'Clock In / Clock Out',
        subtitle: 'Mark today’s biometric or GPS attendance',
        category: 'actions',
        icon: Clock,
        badge: 'Action',
        action: () => {
          navigate('/dashboard/attendance')
          setIsOpen(false)
        },
      },
      {
        id: 'action-copilot',
        title: 'Ask AI HR Copilot',
        subtitle: 'Ask about policies, leave balance, team insights',
        category: 'actions',
        icon: Sparkles,
        badge: 'AI Assistant',
        action: () => {
          useCopilotDrawer.getState().openCopilot()
          setIsOpen(false)
        },
      },
      {
        id: 'action-add-employee',
        title: 'Add New Employee',
        subtitle: 'Onboard a new team member with profile & salary details',
        category: 'actions',
        icon: UserPlus,
        badge: 'Owner / HR',
        action: () => {
          navigate('/dashboard/employees/new')
          setIsOpen(false)
        },
      },
      {
        id: 'action-new-form',
        title: 'Create New Form',
        subtitle: 'Build interactive survey or employee request form',
        category: 'actions',
        icon: FormInput,
        badge: 'Engagement',
        action: () => {
          navigate('/dashboard/forms/builder')
          setIsOpen(false)
        },
      },
      {
        id: 'action-helpdesk',
        title: 'Raise Support Ticket',
        subtitle: 'Report IT, workplace, or HR grievance issues',
        category: 'actions',
        icon: LifeBuoy,
        badge: 'Helpdesk',
        action: () => {
          navigate('/dashboard/helpdesk')
          setIsOpen(false)
        },
      },
    ],
    [navigate]
  )

  // 4. Compute search results based on query
  const results: SearchResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase()

    // When query is empty, show default popular recommendations & quick actions
    if (!q) {
      const topPages: SearchResultItem[] = NAV_ITEMS.slice(0, 5).map((item) => ({
        id: `page-${item.key}`,
        title: item.label,
        subtitle: item.description || `Navigate to ${item.label}`,
        category: 'pages',
        icon: item.icon,
        badge: 'Page',
        action: () => {
          navigate(item.path)
          setIsOpen(false)
        },
      }))

      return [...quickActions.slice(0, 3), ...topPages]
    }

    const items: SearchResultItem[] = []

    // 4.1 Pages / Navigation
    NAV_ITEMS.forEach((item) => {
      if (
        item.label.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.path.toLowerCase().includes(q)
      ) {
        // RBAC check: Manager shouldn't see Payroll or Settings in search
        if (userRole === 'MANAGER' && (item.key === 'payroll' || item.key === 'settings')) {
          return
        }
        if (userRole === 'HR' && item.key === 'settings') {
          return
        }

        items.push({
          id: `page-${item.key}`,
          title: item.label,
          subtitle: item.description || `Go to ${item.label} (${item.path})`,
          category: 'pages',
          icon: item.icon,
          badge: 'Module',
          action: () => {
            navigate(item.path)
            setIsOpen(false)
          },
        })
      }
    })

    // Sub-pages check
    if ('add employee'.includes(q) || 'new employee'.includes(q) || 'onboard'.includes(q)) {
      if (userRole !== 'MANAGER') {
        items.push({
          id: 'subpage-add-employee',
          title: 'Add New Employee (Wizard)',
          subtitle: 'Create employee record with 4-step wizard',
          category: 'pages',
          icon: UserPlus,
          badge: 'Staffing',
          action: () => {
            navigate('/dashboard/employees/new')
            setIsOpen(false)
          },
        })
      }
    }
    if ('form builder'.includes(q) || 'create form'.includes(q) || 'new form'.includes(q)) {
      items.push({
        id: 'subpage-form-builder',
        title: 'Form Builder',
        subtitle: 'Design custom forms with draggable blocks',
        category: 'pages',
        icon: FormInput,
        badge: 'Engagement',
        action: () => {
          navigate('/dashboard/forms/builder')
          setIsOpen(false)
        },
      })
    }
    if ('geofence'.includes(q) || 'security'.includes(q) || 'company settings'.includes(q)) {
      if (userRole === 'OWNER') {
        items.push({
          id: 'subpage-settings-geofence',
          title: 'Geofence & Office Coordinates',
          subtitle: 'Configure office lat/long, radius and punch-in boundary',
          category: 'pages',
          icon: Settings,
          badge: 'Settings',
          action: () => {
            navigate('/dashboard/settings?tab=geofence')
            setIsOpen(false)
          },
        })
      }
    }

    // 4.2 Quick Actions match
    quickActions.forEach((qa) => {
      if (qa.title.toLowerCase().includes(q) || (qa.subtitle && qa.subtitle.toLowerCase().includes(q))) {
        items.push(qa)
      }
    })

    // 4.3 People / Employees match
    mockEmployees.forEach((emp) => {
      const matchName = emp.name.toLowerCase().includes(q)
      const matchEmail = emp.email.toLowerCase().includes(q)
      const matchDept = emp.department.toLowerCase().includes(q)
      const matchDesignation = emp.designation.toLowerCase().includes(q)
      const matchEmpId = (emp.employeeId || '').toLowerCase().includes(q)

      if (matchName || matchEmail || matchDept || matchDesignation || matchEmpId) {
        items.push({
          id: `person-${emp.id}`,
          title: emp.name,
          subtitle: `${emp.designation} • ${emp.department} (${emp.employeeId || emp.email})`,
          category: 'people',
          icon: Users,
          badge: emp.status === 'ACTIVE' ? 'Active' : 'Probation',
          action: () => {
            navigate(`/dashboard/employees?search=${encodeURIComponent(emp.name)}`)
            setIsOpen(false)
          },
        })
      }
    })

    // 4.4 Company Documents match
    mockDocuments.forEach((doc) => {
      const matchDocName = doc.name.toLowerCase().includes(q)
      const matchCategory = doc.category.toLowerCase().includes(q)
      const matchDesc = doc.description.toLowerCase().includes(q)

      if (matchDocName || matchCategory || matchDesc) {
        items.push({
          id: `doc-${doc.id}`,
          title: doc.name,
          subtitle: `${doc.category} • ${doc.description || doc.fileType} (${doc.sizeKb} KB)`,
          category: 'documents',
          icon: FileText,
          badge: doc.fileType,
          action: () => {
            navigate(`/dashboard/documents?search=${encodeURIComponent(doc.name)}`)
            setIsOpen(false)
          },
        })
      }
    })

    return items
  }, [query, quickActions, navigate, userRole])

  // Filtered by active category tab if selected
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results
    return results.filter((r) => r.category === activeTab)
  }, [results, activeTab])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [filteredResults.length, query, activeTab])

  // Handle keyboard navigation inside search list
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown') {
          setIsOpen(true)
        }
        return
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1 < filteredResults.length ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredResults.length - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredResults[activeIndex]) {
          filteredResults[activeIndex].action()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        inputRef.current?.blur()
      }
    },
    [isOpen, filteredResults, activeIndex]
  )

  const countsByCategory = useMemo(() => {
    const counts = { all: results.length, pages: 0, people: 0, documents: 0, actions: 0 }
    results.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1
    })
    return counts
  }, [results])

  return (
    <div ref={containerRef} className="relative max-w-md flex-1">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search
          size={15}
          aria-hidden="true"
          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search people, documents, actions, pages…"
          aria-label="Search Keystone workspace"
          autoComplete="off"
          className="h-9 w-full rounded-ctl border border-hairline bg-surface pr-14 pl-9 text-[13px] text-ink transition-colors placeholder:text-muted/70 hover:border-muted/40 focus:border-pine focus:outline-none focus:ring-1 focus:ring-pine/30"
        />

        {/* Right side icons / shortcuts */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="size-5 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-wash transition"
            >
              <X size={13} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-hairline/80 bg-wash px-1.5 py-0.5 text-[10px] font-bold text-muted select-none">
              <Command size={10} />K
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Results Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-[380px] sm:w-[480px] max-w-[calc(100vw-32px)] rounded-xl border border-hairline bg-paper shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Quick Filter Category Pills */}
          <div className="flex items-center gap-1 p-2 border-b border-hairline bg-surface/50 text-[11px] font-medium overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-ink text-white font-semibold'
                  : 'text-muted hover:text-ink hover:bg-wash'
              }`}
            >
              All ({countsByCategory.all})
            </button>
            {countsByCategory.pages > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('pages')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                  activeTab === 'pages'
                    ? 'bg-pine text-white font-semibold'
                    : 'text-muted hover:text-ink hover:bg-wash'
                }`}
              >
                Pages ({countsByCategory.pages})
              </button>
            )}
            {countsByCategory.people > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('people')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                  activeTab === 'people'
                    ? 'bg-pine text-white font-semibold'
                    : 'text-muted hover:text-ink hover:bg-wash'
                }`}
              >
                People ({countsByCategory.people})
              </button>
            )}
            {countsByCategory.documents > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                  activeTab === 'documents'
                    ? 'bg-pine text-white font-semibold'
                    : 'text-muted hover:text-ink hover:bg-wash'
                }`}
              >
                Documents ({countsByCategory.documents})
              </button>
            )}
            {countsByCategory.actions > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('actions')}
                className={`px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 ${
                  activeTab === 'actions'
                    ? 'bg-pine text-white font-semibold'
                    : 'text-muted hover:text-ink hover:bg-wash'
                }`}
              >
                Actions ({countsByCategory.actions})
              </button>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto p-1.5 space-y-0.5">
            {filteredResults.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Search size={24} className="mx-auto text-muted/50 mb-2" />
                <p className="text-[13px] font-semibold text-ink">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-[11px] text-muted mt-0.5">
                  Try searching for employee names, HR policies, &ldquo;leave&rdquo;, &ldquo;attendance&rdquo;, or &ldquo;settings&rdquo;.
                </p>
              </div>
            ) : (
              filteredResults.map((item, index) => {
                const Icon = item.icon
                const isSelected = index === activeIndex

                return (
                  <div
                    key={item.id}
                    onClick={() => item.action()}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition select-none ${
                      isSelected ? 'bg-pine/10 text-ink' : 'text-ink/80 hover:bg-wash'
                    }`}
                  >
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.category === 'people'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.category === 'documents'
                          ? 'bg-blue-50 text-blue-700'
                          : item.category === 'actions'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-ink truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`text-[9.5px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                              item.category === 'people'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.category === 'documents'
                                ? 'bg-blue-100 text-blue-800'
                                : item.category === 'actions'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-zinc-200/80 text-zinc-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <p className="text-[11px] text-muted truncate mt-0.5">{item.subtitle}</p>
                      )}
                    </div>

                    <ChevronRight size={14} className={`shrink-0 ${isSelected ? 'text-pine' : 'text-muted/40'}`} />
                  </div>
                )
              })
            )}
          </div>

          {/* Footer with keyboard guidance */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-hairline bg-surface/80 text-[10.5px] text-muted">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.2 rounded border border-hairline bg-paper">↑</kbd>
                <kbd className="px-1 py-0.2 rounded border border-hairline bg-paper">↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.2 rounded border border-hairline bg-paper">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.2 rounded border border-hairline bg-paper">esc</kbd> close
              </span>
            </div>
            <span>{results.length} total matches</span>
          </div>
        </div>
      )}
    </div>
  )
}
