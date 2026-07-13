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
    <section className="border-t border-hairline py-20 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="h-px w-6 bg-hairline-strong" aria-hidden="true" />
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Why Keystone
                  </span>
                </div>
                <h2 className="font-display mt-4 text-3xl leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[40px]">
                  Run your company from one intelligent workspace.
                </h2>
                <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
                  Employee records, attendance, leave, payroll and performance stay connected in one platform, so your team spends less time managing data and more time growing the business.
                </p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <dl className="border-t border-hairline">
              {reasons.map((r, i) => (
                <Reveal key={r.stat} delay={i * 0.05}>
                  <div className="grid grid-cols-1 gap-3 border-b border-hairline py-7 sm:grid-cols-12 sm:gap-6">
                    <dt className="sm:col-span-4">
                      <span className="tnum font-display block text-[32px] leading-none font-semibold tracking-[-0.02em] text-pine">
                        {r.stat}
                      </span>
                      <span className="mt-2 block text-[12px] leading-snug text-muted">
                        {r.unit}
                      </span>
                    </dt>
                    <dd className="text-[15px] leading-relaxed sm:col-span-8">{r.body}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  )
}
