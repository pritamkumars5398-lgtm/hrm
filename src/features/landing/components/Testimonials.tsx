import Container from '@/shared/components/Container'
import Reveal from '@/shared/components/Reveal'
import SectionHeading from '@/shared/components/SectionHeading'
import { landingService } from '@/services/landingService'

export default function Testimonials() {
  const testimonials = landingService.getTestimonials()

  return (
    <section id="customers" className="border-t border-hairline py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            label="Customers"
            title="Trusted by growing businesses"
          />
        </Reveal>

        <div className="mt-14 grid gap-px border-t border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05} className="bg-paper">
              <figure className="flex h-full flex-col justify-between p-7 pl-0 sm:pl-7">
                <blockquote className="font-display text-[19px] leading-[1.5] tracking-[-0.01em] text-balance">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-hairline pt-5">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-tint text-[12px] font-semibold text-pine-deep">
                    {t.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{t.name}</span>
                    <span className="block truncate text-[13px] text-muted">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
