import {
  Banknote,
  Clock,
  Database,
  Network,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'
import SectionHeading from '@/shared/components/SectionHeading'

type Feature = { icon: LucideIcon; title: string; body: string }

const features: Feature[] = [
  {
    icon: Network,
    title: 'Your whole org, mapped',
    body: 'Departments, designations and reporting lines that reflect how the company actually works — and update themselves when someone moves team.',
  },
  {
    icon: Database,
    title: 'Centralized employee profiles',
    body: 'Referenced by every module. Change a salary, a manager or a start date once, and attendance, payroll and reporting all follow.',
  },
  {
    icon: Workflow,
    title: 'Smart approval workflows',
    body: 'Automate leave requests, appraisals and approvals with role-based routing and complete approval history.',
  },
  {
    icon: Clock,
    title: 'Attendance made effortless',
    body: 'Present, late, half-day and absent, captured daily across every office and totalled monthly — feeding payroll with no export step in between.',
  },
  {
    icon: Banknote,
    title: 'Accurate payroll processing',
    body: 'Components, deductions, bonuses and tax computed from the hours already recorded. Run the entire organisation in one pass.',
  },
  {
    icon: ShieldCheck,
    title: 'Roles that fit your hierarchy',
    body: 'Owners run the company, HR runs the org, managers see only their own team, and payroll stays where it belongs.',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            label="Platform"
            title="Everything you need to manage your workforce."
            intro="Not a suite of apps that happen to share a login — one organisation-wide system where every department, manager and employee works from the same records."
          />
        </Reveal>

        {/* Hairline grid: dividers come from the cells themselves, no cards, no shadow */}
        <div className="mt-14 grid border-t border-l border-hairline sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <Reveal
                key={f.title}
                delay={i * 0.04}
                className="border-r border-b border-hairline p-6 sm:p-7"
              >
                <Icon size={18} className="text-pine" aria-hidden="true" />
                <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em]">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.body}</p>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
