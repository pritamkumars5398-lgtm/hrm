import { Check } from 'lucide-react'
import Button from '@/shared/components/Button'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'
import SectionHeading from '@/shared/components/SectionHeading'
import { landingService } from '@/services/landingService'

export default function Pricing() {
  const tiers = landingService.getPricingTiers()

  return (
    <section id="pricing" className="border-t border-hairline bg-wash py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            label="Pricing"
            title="One price per employee, for the whole company."
            intro="Every department, office and manager included. No implementation fee, no minimum seat count, and no charge for the people you have not hired yet."
          />
        </Reveal>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.id} delay={i * 0.05}>
              {/* The featured tier is marked with the accent border — never a shadow (§7.2) */}
              <div
                className={`flex h-full flex-col rounded-card border bg-surface ${
                  tier.featured ? 'border-pine' : 'border-hairline'
                }`}
              >
                <div className="border-b border-hairline p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-semibold">{tier.name}</h3>
                    {tier.featured && (
                      <span className="rounded-full bg-pine-tint px-2 py-0.5 text-[11px] font-medium text-pine-deep">
                        Most popular
                      </span>
                    )}
                  </div>

                  <p className="mt-4 flex items-baseline gap-1.5">
                    {tier.priceMonthly === null ? (
                      <span className="font-display text-[34px] leading-none font-semibold tracking-[-0.02em]">
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="tnum font-display text-[34px] leading-none font-semibold tracking-[-0.02em]">
                          £{tier.priceMonthly}
                        </span>
                        <span className="text-[13px] text-muted">{tier.cadence}</span>
                      </>
                    )}
                  </p>
                  {tier.priceMonthly === null && (
                    <p className="mt-1.5 text-[13px] text-muted">{tier.cadence}</p>
                  )}

                  <p className="mt-4 text-[13px] leading-relaxed text-muted">{tier.blurb}</p>
                </div>

                <ul className="flex-1 space-y-3 p-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[14px] leading-snug">
                      <Check size={15} className="mt-0.5 shrink-0 text-pine" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="p-6 pt-0">
                  <Button
                    to="/signup"
                    variant={tier.featured ? 'primary' : 'secondary'}
                    className="w-full"
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
