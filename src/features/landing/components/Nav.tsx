import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Logo from '@/shared/components/Logo'

const links = [
  { label: 'Product', href: '#features' },
  { label: 'Modules', href: '#modules' },
  { label: 'Customers', href: '#customers' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  // The mobile panel is a dialog-ish overlay; don't let the page scroll behind it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" aria-label="Keystone — home">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[14px] text-muted transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button to="/login" variant="ghost" size="sm">
              Sign in
            </Button>
            <Button to="/signup" size="sm">
              Get started
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex size-9 items-center justify-center rounded-ctl border border-hairline md:hidden"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </Container>

      {open && (
        <div className="border-t border-hairline bg-paper md:hidden">
          <Container>
            <nav aria-label="Mobile" className="flex flex-col py-2">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-hairline py-3.5 text-[15px] text-muted"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-2 py-4">
              <Button to="/login" variant="secondary" size="lg">
                Sign in
              </Button>
              <Button to="/signup" size="lg">
                Get started
              </Button>
            </div>
          </Container>
        </div>
      )}
    </header>
  )
}
