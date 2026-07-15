import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Menu, 
  X, 
  ChevronDown, 
  CalendarDays, 
  Banknote, 
  Target, 
  FileText,
  Calculator,
  Scale,
  FileSpreadsheet,
  Sparkles,
  BookOpen,
  HelpCircle,
  Code2,
  Building2,
  Briefcase,
  PhoneCall
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Logo from '@/shared/components/Logo'

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)

  const [mobileModulesOpen, setMobileModulesOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false)

  const [showBanner, setShowBanner] = useState(true)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [isMac, setIsMac] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
    }
  }, [])

  // The mobile panel is a dialog-ish overlay; don't let the page scroll behind it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const moduleItems = [
    {
      title: 'Leave & Attendance',
      desc: 'Track check-ins, time logs, and leave calendars.',
      Icon: CalendarDays,
      color: 'text-emerald-600 bg-emerald-50/80 border-emerald-100/50',
    },
    {
      title: 'Payroll Management',
      desc: 'Process payslips, tax calculations, and cost summaries.',
      Icon: Banknote,
      color: 'text-indigo-600 bg-indigo-50/80 border-indigo-100/50',
    },
    {
      title: 'Performance Reviews',
      desc: 'Run self-appraisals, star reviews, and goal sets.',
      Icon: Target,
      color: 'text-purple-600 bg-purple-50/80 border-purple-100/50',
    },
    {
      title: 'Secure Vault Documents',
      desc: 'Store company files, contracts, and IDs.',
      Icon: FileText,
      color: 'text-teal-600 bg-teal-50/80 border-teal-100/50',
    },
  ]

  const toolItems = [
    {
      title: 'Salary & Tax Calculator',
      desc: 'Estimate gross-to-net pay and deductions in seconds.',
      Icon: Calculator,
      color: 'text-amber-600 bg-amber-50/80 border-amber-100/50',
    },
    {
      title: 'Compliance Guides',
      desc: 'Stay updated on labour laws, PF, and tax compliances.',
      Icon: Scale,
      color: 'text-rose-600 bg-rose-50/80 border-rose-100/50',
    },
    {
      title: 'HR Policy Templates',
      desc: 'Ready-to-use offer letters and policy contracts.',
      Icon: FileSpreadsheet,
      color: 'text-sky-600 bg-sky-50/80 border-sky-100/50',
    },
  ]

  const resourceItems = [
    {
      title: 'Help Center',
      desc: 'FAQs, user guides, and product docs.',
      Icon: HelpCircle,
      color: 'text-emerald-600 bg-emerald-50/80 border-emerald-100/50',
    },
    {
      title: 'Compliance Hub',
      desc: 'Labor laws, tax rules, and local regulations.',
      Icon: Scale,
      color: 'text-amber-600 bg-amber-50/80 border-amber-100/50',
    },
    {
      title: 'Developer API',
      desc: 'Integrate tools, webhooks, and read API docs.',
      Icon: Code2,
      color: 'text-indigo-600 bg-indigo-50/80 border-indigo-100/50',
    },
  ]

  const companyItems = [
    {
      title: 'About Us',
      desc: 'Learn about Keystone and our platform mission.',
      Icon: Building2,
      color: 'text-purple-600 bg-purple-50/80 border-purple-100/50',
    },
    {
      title: 'Careers',
      desc: 'We are hiring! Join our engineering team.',
      Icon: Briefcase,
      color: 'text-teal-600 bg-teal-50/80 border-teal-100/50',
      badge: 'Hiring',
    },
    {
      title: 'Contact Sales',
      desc: 'Get custom pricing and demo details.',
      Icon: PhoneCall,
      color: 'text-rose-600 bg-rose-50/80 border-rose-100/50',
    },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-paper/85 backdrop-blur-md transition-colors duration-300">
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative bg-gradient-to-r from-[#143329] via-[#1f4d3f] to-[#143329] text-white text-center text-[12.5px] font-medium py-2 px-4 flex items-center justify-center overflow-hidden border-b border-[#2d5e4f]/30"
          >
            {/* Soft ambient background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(164,219,198,0.08),transparent_60%)] pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-2 flex-wrap justify-center pr-8 leading-tight">
              <span className="inline-flex items-center gap-1 bg-[#2d5e4f] text-[#a4dbc6] px-2 py-0.5 rounded-full text-[9.5px] font-extrabold uppercase tracking-wider border border-[#44806c]/30">
                New
              </span>
              <span>Keystone v2.0 is live! Automated payroll, compliant leave tracking & instant calculators.</span>
              <Link to="/signup" className="text-white font-bold underline hover:text-[#a4dbc6] transition-colors inline-flex items-center gap-0.5">
                Get started free <Sparkles size={11} className="inline animate-pulse" />
              </Link>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors cursor-pointer rounded-full hover:bg-white/10"
              aria-label="Dismiss banner"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link to="/" aria-label="Keystone — home" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-2 md:flex">
            <a
              href="#features"
              onMouseEnter={() => setHoveredTab('product')}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative px-3 py-1.5 rounded-full text-[13.5px] font-bold text-muted transition-all duration-300 hover:text-ink"
            >
              {hoveredTab === 'product' && (
                <motion.div
                  layoutId="nav-hover-bg"
                  className="absolute inset-0 rounded-full bg-wash/75"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">Product</span>
            </a>

            {/* Modules Dropdown / Mega-Menu */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setModulesOpen(true)
                setHoveredTab('modules')
              }}
              onMouseLeave={() => {
                setModulesOpen(false)
                setHoveredTab(null)
              }}
            >
              <button
                type="button"
                className="relative flex items-center gap-1 text-[13.5px] font-bold text-muted transition-all duration-300 hover:text-ink cursor-pointer px-3 py-1.5 rounded-full"
              >
                {hoveredTab === 'modules' && (
                  <motion.div
                    layoutId="nav-hover-bg"
                    className="absolute inset-0 rounded-full bg-wash/75"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  Modules
                  <ChevronDown size={13} className={`transition-transform duration-300 opacity-80 ${modulesOpen ? 'rotate-180 text-ink' : ''}`} />
                </span>
              </button>

              <AnimatePresence>
                {modulesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-[560px] rounded-card border border-hairline bg-surface/98 backdrop-blur-md shadow-overlay z-50 grid grid-cols-12 overflow-hidden"
                  >
                    {/* Left Column: Modules */}
                    <div className="col-span-7 p-3.5 flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 mb-1 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-pine" />
                        Platform Modules
                      </p>
                      {moduleItems.map((m) => {
                        const IconComponent = m.Icon
                        return (
                          <a
                            key={m.title}
                            href="#modules"
                            onClick={() => setModulesOpen(false)}
                            className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left"
                          >
                            <div className={`p-2 rounded-full border shrink-0 ${m.color}`}>
                              <IconComponent size={13} />
                            </div>
                            <div>
                              <p className="text-[12.5px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                                {m.title}
                              </p>
                              <p className="text-[10.5px] text-muted mt-1 leading-normal font-semibold">
                                {m.desc}
                              </p>
                            </div>
                          </a>
                        )
                      })}
                    </div>

                    {/* Right Column: HR Tools & Guides */}
                    <div className="col-span-5 bg-wash/30 p-3.5 border-l border-hairline flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 mb-1">
                        Tools & Resources
                      </p>
                      {toolItems.map((t) => {
                        const IconComponent = t.Icon
                        return (
                          <a
                            key={t.title}
                            href="#modules"
                            onClick={() => setModulesOpen(false)}
                            className="flex items-start gap-2.5 p-2 rounded-ctl hover:bg-wash transition-colors group text-left"
                          >
                            <div className={`p-1.5 rounded-full border shrink-0 ${t.color}`}>
                              <IconComponent size={12} />
                            </div>
                            <div>
                              <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                                {t.title}
                              </p>
                              <p className="text-[9.5px] text-muted mt-1 leading-normal font-semibold">
                                {t.desc}
                              </p>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resources Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setResourcesOpen(true)
                setHoveredTab('resources')
              }}
              onMouseLeave={() => {
                setResourcesOpen(false)
                setHoveredTab(null)
              }}
            >
              <button
                type="button"
                className="relative flex items-center gap-1 text-[13.5px] font-bold text-muted transition-all duration-300 hover:text-ink cursor-pointer px-3 py-1.5 rounded-full"
              >
                {hoveredTab === 'resources' && (
                  <motion.div
                    layoutId="nav-hover-bg"
                    className="absolute inset-0 rounded-full bg-wash/75"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  Resources
                  <ChevronDown size={13} className={`transition-transform duration-300 opacity-80 ${resourcesOpen ? 'rotate-180 text-ink' : ''}`} />
                </span>
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-72 rounded-card border border-hairline bg-surface/98 backdrop-blur-md p-2 shadow-overlay z-50 flex flex-col gap-0.5"
                  >
                    {resourceItems.map((r) => {
                      const IconComponent = r.Icon
                      return (
                        <a
                          key={r.title}
                          href="#top"
                          onClick={() => setResourcesOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left"
                        >
                          <div className={`p-1.5 rounded-full border shrink-0 ${r.color}`}>
                            <IconComponent size={12} />
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                              {r.title}
                            </p>
                            <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">
                              {r.desc}
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Company Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => {
                setCompanyOpen(true)
                setHoveredTab('company')
              }}
              onMouseLeave={() => {
                setCompanyOpen(false)
                setHoveredTab(null)
              }}
            >
              <button
                type="button"
                className="relative flex items-center gap-1 text-[13.5px] font-bold text-muted transition-all duration-300 hover:text-ink cursor-pointer px-3 py-1.5 rounded-full"
              >
                {hoveredTab === 'company' && (
                  <motion.div
                    layoutId="nav-hover-bg"
                    className="absolute inset-0 rounded-full bg-wash/75"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  Company
                  <ChevronDown size={13} className={`transition-transform duration-300 opacity-80 ${companyOpen ? 'rotate-180 text-ink' : ''}`} />
                </span>
              </button>

              <AnimatePresence>
                {companyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-72 rounded-card border border-hairline bg-surface/98 backdrop-blur-md p-2 shadow-overlay z-50 flex flex-col gap-0.5"
                  >
                    {companyItems.map((c) => {
                      const IconComponent = c.Icon
                      return (
                        <a
                          key={c.title}
                          href="#top"
                          onClick={() => setCompanyOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left"
                        >
                          <div className={`p-1.5 rounded-full border shrink-0 ${c.color}`}>
                            <IconComponent size={12} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                                {c.title}
                              </p>
                              {c.badge && (
                                <span className="inline-flex px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                  {c.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">
                              {c.desc}
                            </p>
                          </div>
                        </a>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="#pricing"
              onMouseEnter={() => setHoveredTab('pricing')}
              onMouseLeave={() => setHoveredTab(null)}
              className="relative px-3 py-1.5 rounded-full text-[13.5px] font-bold text-muted transition-all duration-300 hover:text-ink"
            >
              {hoveredTab === 'pricing' && (
                <motion.div
                  layoutId="nav-hover-bg"
                  className="absolute inset-0 rounded-full bg-wash/75"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">Pricing</span>
            </a>
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <Button to="/login" variant="secondary" size="sm" className="font-bold border border-[#10b981]/20 text-[#15803d] bg-[#10b981]/5 hover:bg-[#10b981]/10 hover:border-[#10b981]/40 transition-all duration-300">
              Sign in
            </Button>
            
            <Button 
              to="/signup" 
              variant="premium" 
              size="sm" 
              className="group relative overflow-hidden font-bold"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -left-full group-hover:animate-shine pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1">
                Get started
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="13" 
                  height="13" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </span>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex size-9.5 items-center justify-center rounded-ctl border border-hairline text-ink hover:bg-wash transition-colors md:hidden cursor-pointer"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-hairline bg-surface md:hidden overflow-hidden"
          >
            <Container className="py-4">
              <nav aria-label="Mobile" className="flex flex-col gap-1">
                <a
                  href="#features"
                  onClick={() => setOpen(false)}
                  className="rounded-ctl px-3 py-2.5 text-[14.5px] font-bold text-muted hover:bg-wash hover:text-ink transition-all"
                >
                  Product
                </a>

                {/* Mobile Modules Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setMobileModulesOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-ctl px-3 py-2.5 text-[14.5px] font-bold text-muted hover:bg-wash hover:text-ink transition-all cursor-pointer"
                  >
                    <span>Modules</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${mobileModulesOpen ? 'rotate-180 text-ink' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {mobileModulesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-2 py-1 flex flex-col gap-2 overflow-hidden"
                      >
                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider pl-2 mt-1.5 flex items-center gap-1">
                          <Sparkles size={11} className="text-pine animate-pulse" />
                          Platform Modules
                        </p>
                        {moduleItems.map((m) => {
                          const IconComponent = m.Icon
                          return (
                            <a
                              key={m.title}
                              href="#modules"
                              onClick={() => {
                                setOpen(false)
                                setMobileModulesOpen(false)
                              }}
                              className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash/60 transition-colors group"
                            >
                              <div className={`p-1.5 rounded-full border shrink-0 ${m.color}`}>
                                <IconComponent size={12} />
                              </div>
                              <div>
                                <p className="text-[12.5px] font-bold text-ink leading-tight mt-0.5">
                                  {m.title}
                                </p>
                                <p className="text-[10.5px] text-muted mt-0.5 font-semibold leading-tight">
                                  {m.desc}
                                </p>
                              </div>
                            </a>
                          )
                        })}

                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider pl-2 mt-2">
                          Tools & Resources
                        </p>
                        {toolItems.map((t) => {
                          const IconComponent = t.Icon
                          return (
                            <a
                              key={t.title}
                              href="#modules"
                              onClick={() => {
                                setOpen(false)
                                setMobileModulesOpen(false)
                              }}
                              className="flex items-start gap-2.5 p-2 rounded-ctl hover:bg-wash/60 transition-colors group"
                            >
                              <div className={`p-1.5 rounded-full border shrink-0 ${t.color}`}>
                                <IconComponent size={11} />
                              </div>
                              <div>
                                <p className="text-[12px] font-bold text-ink leading-tight mt-0.5">
                                  {t.title}
                                </p>
                                <p className="text-[10px] text-muted mt-0.5 font-semibold leading-tight">
                                  {t.desc}
                                </p>
                              </div>
                            </a>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Resources Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setMobileResourcesOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-ctl px-3 py-2.5 text-[14.5px] font-bold text-muted hover:bg-wash hover:text-ink transition-all cursor-pointer"
                  >
                    <span>Resources</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${mobileResourcesOpen ? 'rotate-180 text-ink' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {mobileResourcesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-2 py-1 flex flex-col gap-2 overflow-hidden"
                      >
                        {resourceItems.map((r) => {
                          const IconComponent = r.Icon
                          return (
                            <a
                              key={r.title}
                              href="#top"
                              onClick={() => {
                                setOpen(false)
                                setMobileResourcesOpen(false)
                              }}
                              className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash/60 transition-colors group"
                            >
                              <div className={`p-1.5 rounded-full border shrink-0 ${r.color}`}>
                                <IconComponent size={12} />
                              </div>
                              <div>
                                <p className="text-[12px] font-bold text-ink leading-tight mt-0.5">
                                  {r.title}
                                </p>
                                <p className="text-[10px] text-muted mt-0.5 font-semibold leading-tight">
                                  {r.desc}
                                </p>
                              </div>
                            </a>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile Company Accordion */}
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => setMobileCompanyOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-ctl px-3 py-2.5 text-[14.5px] font-bold text-muted hover:bg-wash hover:text-ink transition-all cursor-pointer"
                  >
                    <span>Company</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${mobileCompanyOpen ? 'rotate-180 text-ink' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {mobileCompanyOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pl-4 pr-2 py-1 flex flex-col gap-2 overflow-hidden"
                      >
                        {companyItems.map((c) => {
                          const IconComponent = c.Icon
                          return (
                            <a
                              key={c.title}
                              href="#top"
                              onClick={() => {
                                setOpen(false)
                                setMobileCompanyOpen(false)
                              }}
                              className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash/60 transition-colors group"
                            >
                              <div className={`p-1.5 rounded-full border shrink-0 ${c.color}`}>
                                <IconComponent size={12} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-[12px] font-bold text-ink leading-tight mt-0.5">
                                    {c.title}
                                  </p>
                                  {c.badge && (
                                    <span className="inline-flex px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                                      {c.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted mt-0.5 font-semibold leading-tight">
                                  {c.desc}
                                </p>
                              </div>
                            </a>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <a
                  href="#pricing"
                  onClick={() => setOpen(false)}
                  className="rounded-ctl px-3 py-2.5 text-[14.5px] font-bold text-muted hover:bg-wash hover:text-ink transition-all"
                >
                  Pricing
                </a>
              </nav>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-hairline">
                <Button to="/login" variant="secondary" size="lg" className="w-full font-bold border border-[#10b981]/20 text-[#15803d] bg-[#10b981]/5 hover:bg-[#10b981]/10 hover:border-[#10b981]/40 transition-all duration-300">
                  Sign in
                </Button>
                <Button 
                  to="/signup" 
                  variant="premium" 
                  size="lg" 
                  className="group relative overflow-hidden w-full font-bold"
                >
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -left-full group-hover:animate-shine pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center gap-1.5">
                    Get started
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="15" 
                      height="15" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                </Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
