import { Sparkles } from 'lucide-react'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'

const reasons = [
  {
    stat: '6 hrs',
    unit: 'saved every week, per administrator',
    body: 'The hours currently spent copying between a spreadsheet, an inbox and a payroll provider simply stop existing.',
  },
  {
    stat: '1',
    unit: 'org chart everyone works from',
    body: 'Departments, managers and reporting lines are defined once. Every approval, every report and every permission follows that structure automatically.',
  },
  {
    stat: '99.8%',
    unit: 'payroll accuracy across runs',
    body: 'Because payroll reads the attendance the company already captured, the most common source of error — the re-key — is gone.',
  },
  {
    stat: 'One',
    unit: 'afternoon to get the company live',
    body: 'Import your people from a CSV, set your leave policy, invite your managers. There is no six-week implementation.',
  },
]

export default function WhyChoose() {
  return (
    <section className="border-t border-hairline bg-white py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 relative">
          
          {/* Left Column (Sticky Headings) */}
          <div className="lg:col-span-5 text-left">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-[#15803d] uppercase tracking-wider shadow-sm">
                  <Sparkles size={12} className="text-[#10b981] animate-pulse" />
                  Why Keystone
                </span>
              </Reveal>
              
              <Reveal delay={0.08}>
                <h2 className="font-sans mt-6 text-[34px] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink sm:text-[42px]">
                  Run your company from{' '}
                  <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                    one intelligent workspace.
                  </span>
                </h2>
              </Reveal>
              
              <Reveal delay={0.16}>
                <p className="mt-6 text-[15.5px] leading-relaxed text-muted font-medium">
                  Employee records, attendance, leave, payroll and performance stay connected in one platform, so your team spends less time managing data and more time growing the business.
                </p>
              </Reveal>
            </div>
          </div>

          {/* Right Column (2x2 Grid of Premium Stat Cards - Flat and White) */}
          <div className="lg:col-span-7">
            <div className="grid gap-6 sm:grid-cols-2">
              {reasons.map((r, i) => (
                <Reveal key={r.stat} delay={i * 0.05}>
                  <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white p-6 h-full flex flex-col justify-between">
                    <div>
                      {/* Big Gradient Stat */}
                      <span className="tnum font-display block text-[38px] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-[#15803d] to-[#10b981] bg-clip-text text-transparent">
                        {r.stat}
                      </span>
                      
                      {/* Unit Label */}
                      <span className="mt-2 block text-[12px] font-bold text-muted/85 leading-snug tracking-tight">
                        {r.unit}
                      </span>
                    </div>

                    {/* Body Text */}
                    <p className="mt-5 text-[13.5px] leading-relaxed text-muted font-medium">
                      {r.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

        </div>
      </Container>
    </section>
  )
}
