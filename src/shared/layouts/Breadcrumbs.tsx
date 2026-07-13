import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from '@/shared/config/navigation'

/** Derived from the route, so it can never drift out of sync with where you are. */
export default function Breadcrumbs() {
  const { pathname } = useLocation()

  const current = NAV_ITEMS.find(
    (item) => item.path === pathname || (item.key !== 'dashboard' && pathname.startsWith(item.path)),
  )

  const isRoot = pathname === '/dashboard'

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-[13px]">
        <li>
          {isRoot ? (
            <span className="font-medium">Dashboard</span>
          ) : (
            <Link to="/dashboard" className="text-muted transition-colors hover:text-ink">
              Dashboard
            </Link>
          )}
        </li>

        {!isRoot && current && (
          <>
            <ChevronRight size={14} className="text-hairline-strong" aria-hidden="true" />
            <li>
              <span className="font-medium" aria-current="page">
                {current.label}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  )
}
