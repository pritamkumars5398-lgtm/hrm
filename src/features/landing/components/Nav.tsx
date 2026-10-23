import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  HelpCircle,
  Code2,
  Building2,
  Briefcase,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Download
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Logo from '@/shared/components/Logo'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function Nav() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const [open, setOpen] = useState(false)
  const [modulesOpen, setModulesOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)

  const [mobileModulesOpen, setMobileModulesOpen] = useState(false)
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false)
  const [mobileCompanyOpen, setMobileCompanyOpen] = useState(false)

  const [showBanner, setShowBanner] = useState(true)
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  // Interactive Public Modal States
  const [activeModal, setActiveModal] = useState<
    'calculator' | 'compliance' | 'policies' | 'help' | 'api' | 'about' | 'careers' | 'sales' | null
  >(null)

  // Salary Calculator State
  const [grossPay, setGrossPay] = useState<number>(75000)

  // Contact Sales State
  const [salesSubmitted, setSalesSubmitted] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open || activeModal ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, activeModal])

  // Navigate to module if logged in, otherwise navigate to login/signup or open modal
  const handleModuleClick = (path: string) => {
    setModulesOpen(false)
    setOpen(false)
    if (user) {
      navigate(path)
    } else {
      navigate(`/login?redirect=${encodeURIComponent(path)}`)
    }
  }

  // Calculate Net Salary Breakdown
  const basicPay = Math.round(grossPay * 0.5)
  const hra = Math.round(grossPay * 0.3)
  const specialAllowance = grossPay - basicPay - hra
  const epfDeduction = Math.min(1800, Math.round(basicPay * 0.12))
  const esicDeduction = grossPay <= 21000 ? Math.round(grossPay * 0.0075) : 0
  const ptDeduction = grossPay > 20000 ? 200 : 0
  const netTakeHome = grossPay - epfDeduction - esicDeduction - ptDeduction

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
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-[580px] rounded-card border border-hairline bg-surface/98 backdrop-blur-md shadow-overlay z-50 grid grid-cols-12 overflow-hidden"
                  >
                    {/* Left Column: Platform Modules */}
                    <div className="col-span-7 p-3.5 flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 mb-1 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-pine" />
                        Platform Modules
                      </p>
                      
                      <button
                        onClick={() => handleModuleClick('/dashboard/attendance')}
                        className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-2 rounded-full border shrink-0 text-emerald-600 bg-emerald-50/80 border-emerald-100/50">
                          <CalendarDays size={13} />
                        </div>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            Leave & Attendance
                          </p>
                          <p className="text-[10.5px] text-muted mt-1 leading-normal font-semibold">
                            Track check-ins, time logs, and leave calendars.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleModuleClick('/dashboard/payroll')}
                        className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-2 rounded-full border shrink-0 text-indigo-600 bg-indigo-50/80 border-indigo-100/50">
                          <Banknote size={13} />
                        </div>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            Payroll Management
                          </p>
                          <p className="text-[10.5px] text-muted mt-1 leading-normal font-semibold">
                            Process payslips, tax calculations, and cost summaries.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleModuleClick('/dashboard/performance')}
                        className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-2 rounded-full border shrink-0 text-purple-600 bg-purple-50/80 border-purple-100/50">
                          <Target size={13} />
                        </div>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            Performance Reviews
                          </p>
                          <p className="text-[10.5px] text-muted mt-1 leading-normal font-semibold">
                            Run self-appraisals, 360 reviews, and OKR goals.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleModuleClick('/dashboard/documents')}
                        className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-2 rounded-full border shrink-0 text-teal-600 bg-teal-50/80 border-teal-100/50">
                          <FileText size={13} />
                        </div>
                        <div>
                          <p className="text-[12.5px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            Secure Vault Documents
                          </p>
                          <p className="text-[10.5px] text-muted mt-1 leading-normal font-semibold">
                            Store company files, contracts, NDAs, and IDs.
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Right Column: HR Tools & Interactive Modals */}
                    <div className="col-span-5 bg-wash/30 p-3.5 border-l border-hairline flex flex-col gap-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-2 mb-1">
                        Tools & Resources
                      </p>

                      <button
                        onClick={() => {
                          setModulesOpen(false)
                          setActiveModal('calculator')
                        }}
                        className="flex items-start gap-2.5 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-1.5 rounded-full border shrink-0 text-amber-600 bg-amber-50/80 border-amber-100/50">
                          <Calculator size={12} />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            Salary & Tax Calculator
                          </p>
                          <p className="text-[9.5px] text-muted mt-1 leading-normal font-semibold">
                            Estimate gross-to-net pay and deductions in seconds.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setModulesOpen(false)
                          setActiveModal('compliance')
                        }}
                        className="flex items-start gap-2.5 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-1.5 rounded-full border shrink-0 text-rose-600 bg-rose-50/80 border-rose-100/50">
                          <Scale size={12} />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            Compliance Guides
                          </p>
                          <p className="text-[9.5px] text-muted mt-1 leading-normal font-semibold">
                            Stay updated on labour laws, PF, and tax compliances.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setModulesOpen(false)
                          setActiveModal('policies')
                        }}
                        className="flex items-start gap-2.5 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                      >
                        <div className="p-1.5 rounded-full border shrink-0 text-sky-600 bg-sky-50/80 border-sky-100/50">
                          <FileSpreadsheet size={12} />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">
                            HR Policy Templates
                          </p>
                          <p className="text-[9.5px] text-muted mt-1 leading-normal font-semibold">
                            Ready-to-use offer letters and policy contracts.
                          </p>
                        </div>
                      </button>
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
                    <button
                      onClick={() => {
                        setResourcesOpen(false)
                        setActiveModal('help')
                      }}
                      className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full border shrink-0 text-emerald-600 bg-emerald-50/80 border-emerald-100/50">
                        <HelpCircle size={12} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">Help Center</p>
                        <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">FAQs, user guides, and product docs.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setResourcesOpen(false)
                        setActiveModal('compliance')
                      }}
                      className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full border shrink-0 text-amber-600 bg-amber-50/80 border-amber-100/50">
                        <Scale size={12} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">Compliance Hub</p>
                        <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">Labor laws, tax rules, and local regulations.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setResourcesOpen(false)
                        setActiveModal('api')
                      }}
                      className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full border shrink-0 text-indigo-600 bg-indigo-50/80 border-indigo-100/50">
                        <Code2 size={12} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">Developer API</p>
                        <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">Integrate tools, webhooks, and read API docs.</p>
                      </div>
                    </button>
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
                    <button
                      onClick={() => {
                        setCompanyOpen(false)
                        setActiveModal('about')
                      }}
                      className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full border shrink-0 text-purple-600 bg-purple-50/80 border-purple-100/50">
                        <Building2 size={12} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">About Us</p>
                        <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">Learn about Keystone and our platform mission.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCompanyOpen(false)
                        setActiveModal('careers')
                      }}
                      className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full border shrink-0 text-teal-600 bg-teal-50/80 border-teal-100/50">
                        <Briefcase size={12} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">Careers</p>
                          <span className="inline-flex px-1.5 py-0.5 rounded-full text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">Hiring</span>
                        </div>
                        <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">We are hiring! Join our engineering team.</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setCompanyOpen(false)
                        setActiveModal('sales')
                      }}
                      className="flex items-start gap-3 p-2 rounded-ctl hover:bg-wash transition-colors group text-left cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full border shrink-0 text-rose-600 bg-rose-50/80 border-rose-100/50">
                        <PhoneCall size={12} />
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-ink group-hover:text-pine transition-colors leading-none mt-0.5">Contact Sales</p>
                        <p className="text-[10px] text-muted mt-1 leading-normal font-semibold">Get custom pricing and demo details.</p>
                      </div>
                    </button>
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
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
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

      {/* Interactive Public Modals */}

      {/* 1. Salary & Tax Calculator Modal */}
      {activeModal === 'calculator' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-5">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <Calculator size={18} /> Interactive Salary & Tax Calculator
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted hover:text-ink font-bold text-xs cursor-pointer p-1">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-ink mb-1.5">
                  <span>Monthly Gross CTC Salary</span>
                  <span className="text-emerald-700 font-mono">₹{grossPay.toLocaleString()} / month</span>
                </div>
                <input
                  type="range"
                  min={15000}
                  max={300000}
                  step={5000}
                  value={grossPay}
                  onChange={(e) => setGrossPay(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="p-4 bg-wash rounded-xl border border-hairline space-y-2 text-xs">
                <p className="font-bold text-muted uppercase text-[10px]">Salary Breakup Structure</p>
                <div className="flex justify-between"><span>Basic Pay (50%)</span><span className="font-bold">₹{basicPay.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>HRA (30%)</span><span className="font-bold">₹{hra.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Special Allowances</span><span className="font-bold">₹{specialAllowance.toLocaleString()}</span></div>
                
                <div className="border-t border-hairline pt-2 text-rose-700 space-y-1">
                  <p className="font-bold text-[10px] uppercase">Statutory Deductions</p>
                  <div className="flex justify-between"><span>EPF Deduction (12% of Basic)</span><span className="font-bold">- ₹{epfDeduction.toLocaleString()}</span></div>
                  {esicDeduction > 0 && <div className="flex justify-between"><span>ESIC Deduction (0.75%)</span><span className="font-bold">- ₹{esicDeduction.toLocaleString()}</span></div>}
                  {ptDeduction > 0 && <div className="flex justify-between"><span>Professional Tax (PT)</span><span className="font-bold">- ₹{ptDeduction.toLocaleString()}</span></div>}
                </div>

                <div className="border-t border-hairline pt-3 flex justify-between items-center text-sm font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span>Estimated Net Take-Home Salary:</span>
                  <span className="text-base font-mono">₹{netTakeHome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveModal(null)} size="sm">Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Compliance Guides Modal */}
      {activeModal === 'compliance' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-5">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <Scale size={18} /> Indian Statutory Compliance Guide
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted hover:text-ink font-bold text-xs cursor-pointer p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-wash rounded-xl border border-hairline space-y-1">
                <p className="font-bold text-ink">Employees' Provident Fund (EPF)</p>
                <p className="text-muted">Mandatory for establishments with 20+ employees. 12% employee contribution matched by employer.</p>
              </div>

              <div className="p-3 bg-wash rounded-xl border border-hairline space-y-1">
                <p className="font-bold text-ink">Employees' State Insurance (ESIC)</p>
                <p className="text-muted">Applicable for employees with gross monthly wage up to ₹21,000. Employee rate 0.75%, Employer rate 3.25%.</p>
              </div>

              <div className="p-3 bg-wash rounded-xl border border-hairline space-y-1">
                <p className="font-bold text-ink">Tax Deducted at Source (TDS Sec 192)</p>
                <p className="text-muted">Tax computed under New & Old Tax Slabs. Automated Form 16 Part A & B generation included in Keystone.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveModal(null)} size="sm">Got it</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. HR Policy Templates Modal */}
      {activeModal === 'policies' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-5">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
                <FileSpreadsheet size={18} /> Ready HR Policy & Contract Templates
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted hover:text-ink font-bold text-xs cursor-pointer p-1">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              {['Standard Employee Offer Letter Template', 'Non-Disclosure Agreement (NDA)', 'POSH Policy & Committee Guidelines', 'Relieving & Experience Certificate'].map((t) => (
                <div key={t} className="p-3 bg-wash rounded-xl border border-hairline flex items-center justify-between font-semibold text-ink">
                  <span>{t}</span>
                  <button
                    onClick={() => alert(`Downloaded ${t}`)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition cursor-pointer"
                  >
                    <Download size={13} /> Download
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveModal(null)} size="sm">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Help Center Modal */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-5">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <HelpCircle size={18} /> Keystone Help Center & Documentation
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted hover:text-ink font-bold text-xs cursor-pointer p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-wash rounded-xl border border-hairline space-y-1">
                <p className="font-bold text-ink">Getting Started & Workspace Setup</p>
                <p className="text-muted">Learn how to invite team members, set up salary components, and define leave policies.</p>
              </div>

              <div className="p-3 bg-wash rounded-xl border border-hairline space-y-1">
                <p className="font-bold text-ink">Attendance & Biometric Sync</p>
                <p className="text-muted">Guide to configuring geofenced GPS punches and integrating face recognition biometric hardware.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveModal(null)} size="sm">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Contact Sales Modal */}
      {activeModal === 'sales' && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-hairline space-y-4">
            <div className="flex items-start justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <PhoneCall size={18} /> Request Enterprise Demo & Sales Inquiry
              </div>
              <button onClick={() => setActiveModal(null)} className="text-muted hover:text-ink font-bold text-xs cursor-pointer p-1">✕</button>
            </div>

            {salesSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                <p className="font-bold text-sm text-ink">Demo Request Submitted!</p>
                <p className="text-xs text-muted">Our enterprise solution architect will get in touch with you shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSalesSubmitted(true)
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-ink font-bold mb-1">Company Name *</label>
                  <input type="text" required placeholder="Acme Corp" className="w-full p-2.5 rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-ink font-bold mb-1">Work Email *</label>
                  <input type="email" required placeholder="alex@acme.com" className="w-full p-2.5 rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-ink font-bold mb-1">Headcount Size</label>
                  <select className="w-full p-2.5 rounded-xl border border-hairline focus:border-indigo-500 focus:outline-none font-semibold">
                    <option>50 - 200 Employees</option>
                    <option>200 - 1,000 Employees</option>
                    <option>1,000+ Enterprise</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm">Submit Demo Request</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
