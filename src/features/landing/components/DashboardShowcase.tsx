import { motion } from 'framer-motion'
import { Activity, Users, CalendarRange } from 'lucide-react'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'

function DashboardMock() {
  const bars = [72, 88, 64, 91, 78, 24, 18, 84, 93, 70, 86, 61, 30, 22]

  return (
    <div className="relative w-full max-w-[620px] mx-auto">
      {/* Browser mockup frame - pure flat border layout, no shadows, no background glows */}
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white">
        
        {/* Browser Header Bar */}
        <div className="flex items-center justify-between border-b border-hairline bg-wash/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11.5px] font-medium text-muted/80 font-mono tracking-tight ml-4">keystone-app.com/dashboard</span>
          </div>
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-pine to-emerald-600 text-[10px] font-bold text-white shadow-sm select-none">
            PN
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 divide-x divide-hairline border-b border-hairline bg-white">
          {[
            { label: 'Employees', value: '248', delta: '+4 this month', color: 'text-pine' },
            { label: 'Departments', value: '12', delta: 'across 4 offices', color: 'text-blue-600' },
            { label: 'Present today', value: '231', delta: '93.1% present', color: 'text-emerald-600' },
          ].map((s) => (
            <div key={s.label} className="px-5 py-4">
              <p className="text-[11px] font-bold tracking-[0.03em] uppercase text-muted/80">{s.label}</p>
              <p className="tnum font-display mt-1.5 text-[28px] leading-none font-extrabold text-ink">
                {s.value}
              </p>
              <p className={`tnum mt-2 text-[11px] font-semibold ${s.color}`}>{s.delta}</p>
            </div>
          ))}
        </div>

        {/* Attendance chart section */}
        <div className="border-b border-hairline px-5 py-5 bg-white">
          <div className="mb-4 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-pine animate-pulse" />
              <p className="text-[12.5px] font-bold text-ink">Attendance · Last 14 Days</p>
            </div>
            <p className="tnum text-[11px] font-bold text-muted bg-wash px-2 py-0.5 rounded-md">avg 92%</p>
          </div>
          <div className="flex h-16 items-end gap-2" aria-hidden="true">
            {bars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className={`flex-1 rounded-t-[3px] ${h < 40 ? 'bg-hairline-strong/60' : 'bg-gradient-to-t from-[#15803d] to-[#10b981]'}`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Activity Feed Table */}
        <div className="bg-white">
          <table className="w-full">
            <tbody>
              {[
                { name: 'Priya Nair', dept: 'Design', status: 'In · 09:02', badge: 'bg-green-50 text-green-700 border-green-200/60' },
                { name: 'Samuel Okafor', dept: 'Payroll', status: 'On leave', badge: 'bg-amber-50 text-amber-700 border-amber-200/60' },
                { name: 'Marta Lindqvist', dept: 'Engineering', status: 'In · 08:47', badge: 'bg-green-50 text-green-700 border-green-200/60' },
              ].map((row) => (
                <tr key={row.name} className="border-b border-hairline last:border-0 hover:bg-wash/40 transition-colors duration-200">
                  <td className="px-5 py-3 text-[13.5px] font-bold text-ink">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-full bg-wash border border-hairline flex items-center justify-center text-[10px] font-bold text-muted uppercase">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      {row.name}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-muted font-semibold">{row.dept}</td>
                  <td className="tnum px-5 py-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${row.badge}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default function DashboardShowcase() {
  return (
    <section className="py-20 sm:py-28 border-t border-hairline bg-white">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16 relative">
          
          {/* Left: Text Panel */}
          <div className="lg:col-span-5 text-left">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/25 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-[#15803d] uppercase tracking-wider shadow-sm">
                <Activity size={12} className="text-[#10b981] animate-pulse" />
                Live Operations Pulse
              </span>
            </Reveal>

            <Reveal delay={0.08}>
              <h2 className="font-sans mt-6 text-[34px] leading-[1.08] font-extrabold tracking-[-0.04em] text-ink sm:text-[42px]">
                Your company's vital signs,{' '}
                <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                  all in one place.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="mt-6 text-[16px] leading-relaxed text-muted font-medium">
                Ditch the outdated spreadsheets and disjointed tracking tools. Keystone's central hub aggregates critical metrics across payroll, presence, and employee statuses as they occur.
              </p>
            </Reveal>

            <div className="mt-8 space-y-5">
              {[
                {
                  icon: Users,
                  title: 'Real-time headcounts',
                  desc: 'Track employee growth, departures, and active departments as organizational changes happen.',
                  color: 'bg-emerald-500/10 text-[#15803d]',
                },
                {
                  icon: CalendarRange,
                  title: 'Instant attendance analytics',
                  desc: 'Visualize daily team check-ins, active leaves, and historical patterns without report generation.',
                  color: 'bg-blue-500/10 text-blue-600',
                },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <Reveal key={item.title} delay={0.2 + idx * 0.08}>
                    <div className="flex gap-4 group">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${item.color} shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[14.5px] font-bold text-ink">{item.title}</h4>
                        <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted font-medium">{item.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>

          {/* Right: Premium Interactive Mock Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <DashboardMock />
          </motion.div>

        </div>
      </Container>
    </section>
  )
}
