import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
        },
        opacity: 0,
        y: 20,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative py-24 px-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="cta-content">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Start Your Journey
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join engineers and teams who control their own infrastructure.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-semibold">
              Get Started Free
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold">
              Schedule Demo
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-400">
            No credit card required. Free tier includes 5GB storage.
          </p>
        </div>
      </div>
    </section>
  )
}
