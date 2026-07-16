import Container from '@/shared/components/Container'
import Logo from '@/shared/components/Logo'

const columns = [
  {
    heading: 'Product',
    links: ['Employee management', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Reports'],
  },
  { heading: 'Company', links: ['About', 'Customers', 'Careers', 'Contact'] },
  { heading: 'Resources', links: ['Documentation', 'Changelog', 'Status', 'Support'] },
  { heading: 'Legal', links: ['Privacy', 'Terms', 'Security', 'DPA'] },
]

const TwitterIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const LinkedinIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const GithubIcon = () => (
  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="relative bg-white pt-16 pb-12 border-t border-hairline overflow-hidden">
      {/* Background soft glowing blur */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

      <Container>
        {/* Newsletter Signup Row */}
        <div className="flex flex-col gap-6 pb-12 border-b border-hairline lg:flex-row lg:items-center lg:justify-between">
          <div className="text-left">
            <h3 className="text-[14px] font-bold text-ink">Subscribe to our newsletter</h3>
            <p className="mt-1 text-[13px] text-muted font-medium">Get the latest HR trends and product updates delivered to your inbox.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="h-10 w-full rounded-lg border border-hairline bg-wash/30 px-3.5 text-[13px] text-ink placeholder-muted/70 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 focus:outline-none transition-all"
            />
            <button
              type="submit"
              className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-700 px-5 text-[12.5px] font-bold text-white shadow-sm hover:from-emerald-600 hover:to-emerald-800 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Main Footer Links & Tools Grid */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8 text-left">

          {/* Brand & Search Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <Logo />
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted font-medium">
                One system to run your company's people — from ten employees to five hundred.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="flex size-8 items-center justify-center rounded-lg border border-hairline bg-surface hover:bg-wash hover:text-pine text-muted transition-colors duration-200">
                <TwitterIcon />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex size-8 items-center justify-center rounded-lg border border-hairline bg-surface hover:bg-wash hover:text-pine text-muted transition-colors duration-200">
                <LinkedinIcon />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="flex size-8 items-center justify-center rounded-lg border border-hairline bg-surface hover:bg-wash hover:text-pine text-muted transition-colors duration-200">
                <GithubIcon />
              </a>
            </div>

            {/* Documentation Search Widget */}
            <div className="max-w-xs">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink">
                Search Documentation
              </label>
              <div className="mt-2.5 flex items-center relative">
                <input
                  type="text"
                  placeholder="Search docs..."
                  className="h-9 w-full rounded-lg border border-hairline bg-wash/30 pl-8 pr-3 text-[12.5px] text-ink placeholder-muted/70 focus:border-pine/30 focus:outline-none transition-colors"
                />
                <span className="absolute left-2.5 text-muted/70 text-[13px] select-none"></span>
                <button
                  type="button"
                  className="absolute right-1 top-1 h-7 rounded-md bg-wash hover:bg-hairline px-2 text-[10px] font-bold text-muted hover:text-ink transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-[11px] font-bold tracking-wider text-ink uppercase">
                {col.heading}
              </h2>
              <ul className="mt-4.5 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-[13.5px] text-muted font-medium hover:text-pine hover:translate-x-0.5 transform transition-all duration-200 inline-block"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom copyright details bar */}
        <div className="relative pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-left">
          {/* Custom soft gradient top rule */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-hairline to-transparent" />

          <p className="text-[13px] text-muted font-medium">
            © {new Date().getFullYear()} Keystone HR Ltd. All rights reserved.
          </p>
          <p className="text-[12px] text-muted font-bold tracking-tight">
            Built for companies that would rather be building.
          </p>
        </div>
      </Container>
    </footer>
  )
}
