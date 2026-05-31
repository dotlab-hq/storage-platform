import { useEffect } from 'react'
import gsap from 'gsap'

export function HeroContent() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ delay: 0.3 })

      timeline
        .from('.hero-title', {
          duration: 1,
          opacity: 0,
          y: 30,
        })
        .from('.hero-subtitle', {
          duration: 1,
          opacity: 0,
          y: 20,
        }, '-=0.7')
        .from('.hero-cta', {
          duration: 0.8,
          opacity: 0,
          y: 20,
        }, '-=0.6')
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen pt-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="hero-title text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Your Files, Your Infrastructure
        </h1>

        <p className="hero-subtitle text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Use Dot Storage as your personal cloud drive, mount it like a network folder, or integrate it as a powerful S3-compatible backend. Complete control over your data.
        </p>

        <div className="hero-cta flex flex-col md:flex-row items-center justify-center gap-4">
          <button className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-semibold">
            Get Started Free
          </button>
          <button className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition font-semibold">
            View Documentation
          </button>
        </div>
      </div>
    </div>
  )
}
