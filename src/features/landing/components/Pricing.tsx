import { Check, Sparkles } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'
import { landingService } from '@/services/landingService'

export default function Pricing() {
  const tiers = landingService.getPricingTiers()

  return (
    <section id="pricing" className="border-t border-hairline bg-white py-20 sm:py-28">
      <Container>
        {/* Premium Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-[#15803d] uppercase tracking-wider shadow-sm">
              <Sparkles size={12} className="text-[#10b981] animate-pulse" />
              Transparent Pricing
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-sans mt-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.04em] text-ink sm:text-[46px]">
              One price per employee,{' '}
              <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                for the whole company.
              </span>
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted font-medium max-w-2xl mx-auto">
              Every department, office and manager included. No implementation fee, no minimum seat count, and no charge for the people you have not hired yet.
            </p>
          </Reveal>
        </div>

        {/* Pricing Cards Grid - No shadows, no scale, clean border lines */}
        <div className="grid items-start gap-8 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.05}>
              <div
                className={`flex h-full flex-col rounded-2xl bg-white border ${
                  tier.featured 
                    ? 'border-2 border-pine' 
                    : 'border-hairline'
                }`}
              >
                <div className="border-b border-hairline p-6 bg-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15.5px] font-bold text-ink tracking-tight">{tier.name}</h3>
                    {tier.featured && (
                      <span className="rounded-full bg-pine px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        Most popular
                      </span>
                    )}
                  </div>

                  <p className="mt-5 flex items-baseline gap-1.5">
                    {tier.priceMonthly === null ? (
                      <span className="font-sans text-[36px] font-extrabold tracking-[-0.03em] text-ink">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="tnum font-sans text-[38px] font-extrabold tracking-[-0.04em] bg-gradient-to-r from-[#15803d] to-[#10b981] bg-clip-text text-transparent">
                          £{tier.priceMonthly}
                        </span>
                        <span className="text-[13px] font-bold text-muted">/{tier.cadence}</span>
                      </>
                    )}
                  </p>
                  {tier.priceMonthly === null && (
                    <p className="mt-1.5 text-[13px] font-semibold text-muted">{tier.cadence}</p>
                  )}

                  <p className="mt-4 text-[13.5px] leading-relaxed text-muted font-medium">{tier.blurb}</p>
                </div>

                {/* Features List */}
                <ul className="flex-1 space-y-3.5 p-6 bg-white">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-3 text-[14px] leading-snug text-muted font-medium">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-pine-tint text-pine border border-pine/10 mt-0.5">
                        <Check size={10} strokeWidth={3.5} />
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Action Area */}
                <div className="p-6 pt-0 bg-white">
                  <Button
                    to="/signup"
                    variant={tier.featured ? 'premium' : 'secondary'}
                    className="w-full font-bold"
                  >
                    {tier.cta}
                  </Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
