import { ArrowRight } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'

export default function CTA() {
  return (
    <section className="bg-pine-deep py-20 sm:py-24">
      <Container>
        <Reveal>
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display max-w-lg text-3xl leading-[1.15] font-semibold tracking-[-0.02em] text-balance text-paper sm:text-[38px]">
                Put your entire company in one system.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-paper/70">
                Set up your organisation, invite your managers, and run everything from hiring to
                payroll on records you can actually trust. Free for 14 days.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button to="/signup" variant="inverse" size="lg">
                Start your workspace
                <ArrowRight size={16} />
              </Button>
              <Button
                href="#modules"
                size="lg"
                className="border-paper/25 bg-transparent text-paper hover:bg-white/10"
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
