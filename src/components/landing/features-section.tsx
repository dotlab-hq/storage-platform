import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

interface Feature {
  title: string
  description: string
  icon: string
  highlights: string[]
}

const features: Feature[] = [
  {
    title: 'S3 Compatible APIs',
    description: 'Drop-in replacement for AWS S3',
    icon: '⚙️',
    highlights: ['ListBuckets', 'PutObject', 'GetObject', 'DeleteObject'],
  },
  {
    title: 'Instant File Delivery',
    description: 'Global CDN-backed distribution',
    icon: '⚡',
    highlights: ['Sub-100ms latency', '180+ POPs', 'Automatic caching'],
  },
  {
    title: 'Massive Scale',
    description: 'Handle petabytes of data',
    icon: '📈',
    highlights: ['Unlimited objects', 'Automatic sharding', 'Linear scaling'],
  },
  {
    title: 'Secure Access',
    description: 'Enterprise-grade security',
    icon: '🔐',
    highlights: ['IAM policies', 'Encryption', 'CORS support'],
  },
  {
    title: 'Analytics',
    description: 'Real-time insights',
    icon: '📊',
    highlights: ['Request metrics', 'Latency tracking', 'Cost analysis'],
  },
  {
    title: 'Compliance',
    description: 'Meet regulatory requirements',
    icon: '✅',
    highlights: ['GDPR ready', 'Data residency', 'Audit logs'],
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    featuresRef.current.forEach((feature, idx) => {
      gsap.from(feature, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: feature,
          start: 'top 80%',
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-black py-24 px-4"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-5xl font-bold md:text-6xl">
          Powerful Features
        </h2>
        <p className="mb-16 text-center text-gray-400">
          Everything you need to build with global scale
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              ref={(el) => {
                if (el) featuresRef.current[idx] = el
              }}
              key={feature.title}
              className="group rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-6 transition hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20"
            >
              <div className="mb-4 text-5xl">{feature.icon}</div>
              <h3 className="mb-2 text-2xl font-bold">{feature.title}</h3>
              <p className="mb-6 text-gray-400">{feature.description}</p>
              <div className="space-y-2">
                {feature.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">✓</span>
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
