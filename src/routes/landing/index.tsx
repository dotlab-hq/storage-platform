import { useEffect, useRef } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

import HeroSection from '@/components/landing/hero-section'
import StoryPanels from '@/components/landing/story-panels'
import ArchitectureSection from '@/components/landing/architecture-section'
import FeaturesSection from '@/components/landing/features-section'
import TimelineSection from '@/components/landing/timeline-section'
import StatsDashboard from '@/components/landing/stats-dashboard'
import EnterpriseSection from '@/components/landing/enterprise-section'
import FinalCTA from '@/components/landing/final-cta'

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
      className="relative w-full overflow-hidden bg-black text-white"
    >
      <HeroSection />
      <StoryPanels />
      <ArchitectureSection />
      <FeaturesSection />
      <TimelineSection />
      <StatsDashboard />
      <EnterpriseSection />
      <FinalCTA />
    </div>
  )
}

export const Route = createFileRoute('/landing/')({
  component: LandingPageContent,
})
