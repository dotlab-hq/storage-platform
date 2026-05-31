import { Suspense } from 'react'
import HeroContent from './hero-content'
import Hero3DScene from './hero-3d-scene'

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <Hero3DScene />
      </Suspense>
      <HeroContent />

      {/* Scroll indicator */}
      <div className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="animate-bounce text-center text-gray-400">
          <div className="text-sm">Scroll to explore</div>
          <div className="text-2xl">↓</div>
        </div>
      </div>
    </section>
  )
}
