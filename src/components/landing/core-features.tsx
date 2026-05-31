import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function CoreFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center+=100',
          end: 'top center-=100',
          scrub: 1,
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const features = [
    {
      title: 'Works Everywhere',
      description: 'Compatible with existing S3 tools and libraries. Use your favorite tools without any rewrites.',
    },
    {
      title: 'Your Control',
      description: 'Choose your storage backend, enforce deletion policies, and inspect exactly how your data flows.',
    },
    {
      title: 'Developer Friendly',
      description: 'Type-safe server functions, built-in validation, and offline support reduce bugs and speed development.',
    },
    {
      title: 'Fast & Resilient',
      description: 'Offline caching, incremental pagination, and background sync work seamlessly for large datasets.',
    },
    {
      title: 'Safe Deletion',
      description: 'Predictable trash to queued deletion workflow. Accidental deletions are recoverable.',
    },
    {
      title: 'Mount as Network Folder',
      description: 'Use WebDAV to mount your storage like a regular network drive. No special software needed.',
    },
  ]

  return (
    <section ref={containerRef} id="features" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Built For Control
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dot Storage gives you the flexibility and control traditional cloud storage doesn't.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="feature-card p-8 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
