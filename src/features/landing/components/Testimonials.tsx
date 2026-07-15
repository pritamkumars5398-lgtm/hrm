import { Sparkles } from 'lucide-react'
import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'
import { landingService } from '@/services/landingService'

export default function Testimonials() {
  const testimonials = landingService.getTestimonials()

  return (
    <section id="customers" className="border-t border-hairline bg-white py-20 sm:py-28">
      <Container>
        {/* Premium Section Heading */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/50 px-3 py-1.5 text-[11px] font-bold text-[#15803d] uppercase tracking-wider shadow-sm">
              <Sparkles size={12} className="text-[#10b981] animate-pulse" />
              Customer Reviews
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-sans mt-6 text-[36px] leading-[1.08] font-extrabold tracking-[-0.04em] text-ink sm:text-[46px]">
              Trusted by{' '}
              <span className="bg-gradient-to-r from-[#15803d] via-[#10b981] to-[#eab308] bg-clip-text text-transparent">
                growing businesses.
              </span>
            </h2>
          </Reveal>
        </div>

        {/* Testimonials Deck Grid - Flat clean border cards, no shadows */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal 
              key={t.id} 
              delay={i * 0.05} 
              className="flex h-full flex-col justify-between rounded-2xl border border-hairline bg-white p-7 hover:border-[#10b981]/25 transition-all duration-300"
            >
              <figure className="flex h-full flex-col justify-between">
                <blockquote className="font-sans text-[16px] leading-[1.55] font-semibold text-ink text-left">
                  “{t.quote}”
                </blockquote>
                
                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-hairline pt-5 text-left">
                  {/* User Profile Image with Initials Fallback */}
                  {t.avatar ? (
                    <img 
                      src={t.avatar} 
                      alt={t.name}
                      className="size-9 shrink-0 rounded-full object-cover border border-hairline shadow-sm select-none"
                    />
                  ) : (
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pine/15 to-emerald-500/10 text-[11px] font-bold text-pine border border-pine/10 shadow-sm uppercase select-none">
                      {t.initials}
                    </span>
                  )}
                  
                  <div className="min-w-0">
                    <span className="block truncate text-[14px] font-extrabold text-ink">{t.name}</span>
                    <span className="block truncate text-[12px] font-semibold text-muted">
                      {t.role}, {t.company}
                    </span>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
