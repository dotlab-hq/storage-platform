import { HeroContent } from './hero-content'

export function HeroSection() {
  return (
    <section className="relative w-full">
      <HeroContent />

      <div className="text-center pb-8">
        <div className="text-sm text-gray-500 animate-pulse">
          Scroll to explore
        </div>
      </div>
    </section>
  )
}

export default HeroSection
