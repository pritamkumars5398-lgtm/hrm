import {
  Banknote,
  Clock,
  Database,
  Network,
  ShieldCheck,
  Workflow,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'

type Feature = { 
  icon: LucideIcon
  title: string
  body: string
  colorClass: string
  bgClass: string
  borderClass: string
}

const features: Feature[] = [
  {
    icon: Network,
    title: 'Your whole org, mapped',
    body: 'Departments, designations and reporting lines that reflect how the company actually works — and update themselves when someone moves team.',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'group-hover:border-emerald-500/30'
  },
  {
    icon: Database,
    title: 'Centralized employee profiles',
    body: 'Referenced by every module. Change a salary, a manager or a start date once, and attendance, payroll and reporting all follow.',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-500/10',
    borderClass: 'group-hover:border-blue-500/30'
  },
  {
    icon: Workflow,
    title: 'Smart approval workflows',
    body: 'Automate leave requests, appraisals and approvals with role-based routing and complete approval history.',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-500/10',
    borderClass: 'group-hover:border-indigo-500/30'
  },
  {
    icon: Clock,
    title: 'Attendance made effortless',
    body: 'Present, late, half-day and absent, captured daily across every office and totalled monthly — feeding payroll with no export step.',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-500/10',
    borderClass: 'group-hover:border-amber-500/30'
  },
  {
    icon: Banknote,
    title: 'Accurate payroll processing',
    body: 'Components, deductions, bonuses and tax computed from the hours already recorded. Run the entire organisation in one pass.',
    colorClass: 'text-rose-600',
    bgClass: 'bg-rose-500/10',
    borderClass: 'group-hover:border-rose-500/30'
  },
  {
    icon: ShieldCheck,
    title: 'Roles that fit your hierarchy',
    body: 'Owners run the company, HR runs the org, managers see only their own team, and payroll stays where it belongs.',
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-500/10',
    borderClass: 'group-hover:border-teal-500/30'
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 border-t border-hairline bg-gradient-to-b from-white via-wash/20 to-white relative overflow-hidden">
      {/* Background soft glowing blur */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <Container>
        {/* Customized Premium Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-[#15803d] uppercase tracking-wider shadow-sm">
              <Sparkles size={12} className="text-[#10b981] animate-pulse" />
              Platform Overview
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-sans mt-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.04em] text-ink sm:text-[46px]">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                manage your workforce.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted font-medium max-w-2xl mx-auto">
              Not a suite of apps that happen to share a login — one organisation-wide system where every department, manager and employee works from the same records.
            </p>
          </Reveal>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal
                key={f.title}
                delay={i * 0.05}
                className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface/60 backdrop-blur-sm p-6 sm:p-7 hover:bg-surface hover:shadow-[0_15px_30px_rgba(28,29,26,0.03)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Colored Icon Badge */}
                <div className={`flex size-10 items-center justify-center rounded-xl ${f.bgClass} ${f.colorClass} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={18} />
                </div>
                
                {/* Title */}
                <h3 className="mt-5 text-[15.5px] font-bold text-ink tracking-tight group-hover:text-pine transition-colors duration-200">
                  {f.title}
                </h3>
                
                {/* Body Text */}
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted font-medium">
                  {f.body}
                </p>

                {/* Decorative hover card bottom highlight line */}
                <div className={`absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
