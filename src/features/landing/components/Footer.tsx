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

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-paper">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-56 text-[13px] leading-relaxed text-muted">
              One system to run your company's people — from ten employees to five hundred.
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-[12px] font-semibold tracking-[0.08em] text-ink uppercase">
                {col.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="text-[13px] text-muted transition-colors hover:text-ink"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            © {new Date().getFullYear()} Keystone HR Ltd. All rights reserved.
          </p>
          <p className="text-[13px] text-muted">Built for companies that would rather be building.</p>
        </div>
      </Container>
    </footer>
  )
}
