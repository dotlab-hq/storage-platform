import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

interface Trust {
  icon: string
  title: string
  description: string
}

const trusts: Trust[] = [
  {
    icon: '🛡️',
    title: 'Enterprise Reliability',
    description: '99.99% SLA with automatic failover',
  },
  {
    icon: '✅',
    title: 'Compliance',
    description: 'SOC 2 Type II, GDPR, HIPAA ready',
  },
  {
    icon: '🌍',
    title: 'Global Availability',
    description: 'Data centers in 6 continents',
  },
  {
    icon: '📊',
    title: 'Monitoring',
    description: 'Real-time alerts and dashboards',
  },
  {
    icon: '🔐',
    title: 'Security',
    description: 'End-to-end encryption and access control',
  },
  {
    icon: '⚡',
    title: 'Performance',
    description: 'Sub-100ms latency globally',
  },
]

export default function EnterpriseSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trustRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    trustRef.current.forEach((trust, idx) => {
      gsap.from(trust, {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top center',
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
      className="relative w-full bg-black py-24 px-4"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00ff88" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-5xl font-bold md:text-6xl">
          Built for Enterprise
        </h2>
        <p className="mb-16 text-center text-gray-400">
          Trust us with your most critical data
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trusts.map((trust, idx) => (
            <div
              ref={(el) => {
                if (el) trustRef.current[idx] = el
              }}
              key={trust.title}
              className="rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-6 transition hover:border-green-500 hover:shadow-lg hover:shadow-green-500/10"
            >
              <div className="mb-4 text-4xl">{trust.icon}</div>
              <h3 className="mb-2 text-lg font-bold">{trust.title}</h3>
              <p className="text-sm text-gray-400">{trust.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
