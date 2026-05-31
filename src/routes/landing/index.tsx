import { createFileRoute } from '@tanstack/react-router'

import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { LandingHero } from '@/components/landing/landing-hero'
import { LandingHighlights } from '@/components/landing/landing-highlights'

function LandingPageContent() {
  return (
    <div className="relative w-full overflow-hidden bg-[#f6f7fb] text-slate-900">
      <Navbar />
      <LandingHero />
      <LandingHighlights />
      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/landing/')({
  component: LandingPageContent,
})
