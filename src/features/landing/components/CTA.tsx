import { ArrowRight, Sparkles } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2d24] via-[#12382e] to-[#154639] py-20 sm:py-24 border-t border-hairline">
      {/* Background ambient lighting effects for glassmorphic depth */}
      <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[500px] h-[500px] bg-[#eab308]/5 blur-[130px] rounded-full pointer-events-none" />

      <Container className="relative">
        <Reveal>
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-left">
              {/* Custom styled badge */}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider shadow-sm mb-5">
                <Sparkles size={12} className="text-emerald-300 animate-pulse" />
                Get Started Today
              </span>

              <h2 className="font-sans max-w-xl text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] text-white sm:text-[42px]">
                Put your entire company in{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-teal-100 bg-clip-text text-transparent">
                  one system.
                </span>
              </h2>
              
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-paper/85 font-medium">
                Set up your organisation, invite your managers, and run everything from hiring to
                payroll on records you can actually trust. Free for 14 days.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Button 
                to="/signup" 
                variant="inverse" 
                size="lg"
                className="group relative overflow-hidden font-bold"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -left-full group-hover:animate-shine pointer-events-none" />
                <span className="relative z-10 flex items-center gap-2">
                  Start your workspace
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Button>
              <Button
                href="#modules"
                size="lg"
                className="border-paper/20 bg-transparent text-paper hover:bg-white/5 hover:border-paper/30 font-bold transition-all duration-300 shadow-sm"
              >
                Book a demo
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
