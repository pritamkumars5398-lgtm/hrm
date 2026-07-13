import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from './Logo'

/**
 * Temporary placeholder so the landing page's /login and /signup calls-to-action
 * do not dead-end during a demo. Each route here is replaced by the real screen
 * as that item is built (CLAUDE.md §4). Delete this file once both exist.
 */
export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <h1 className="font-display mt-8 text-3xl font-semibold tracking-[-0.02em]">{title}</h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
        This screen is next up in the build. The landing page is ready for review.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-pine hover:text-pine-deep"
      >
        <ArrowLeft size={15} />
        Back to the landing page
      </Link>
    </div>
  )
}
