import CTA from './components/CTA'
import Features from './components/Features'
import Footer from './components/Footer'
import Hero from './components/Hero'
import ModuleShowcase from './components/ModuleShowcase'
import Nav from './components/Nav'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import WhyChoose from './components/WhyChoose'

export default function LandingPage() {
  return (
    <div id="top">
      <a
        href="#main"
        className="sr-only rounded-ctl border border-hairline bg-surface px-4 py-2 text-sm focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Features />
        <ModuleShowcase />
        <WhyChoose />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}
