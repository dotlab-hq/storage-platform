import { Suspense } from 'react'
import { HeroContent } from './hero-content'
import Hero3DScene from './hero-3d-scene'

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">
      <Suspense fallback={<div className="h-screen bg-white" />}>
        <Hero3DScene />
      </Suspense>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <HeroContent />
      </div>
    </section>
  )
}

export default HeroSection
