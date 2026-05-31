import { useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { CoreFeatures } from '@/components/landing/core-features'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FinalCTA } from '@/components/landing/final-cta-simple'

gsap.registerPlugin(ScrollTrigger)

function LandingPageContent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    ScrollTrigger.update()

    lenis.on('scroll', ScrollTrigger.update)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-white text-gray-900"
    >
      <Navbar />
      <HeroSection />
      <CoreFeatures />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </div>
  )
}

export const Route = createFileRoute('/landing/')({
  component: LandingPageContent,
})
