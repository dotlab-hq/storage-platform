import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

interface Stat {
  label: string
  value: number
  suffix: string
}

const stats: Stat[] = [
  { label: 'Requests/s', value: 100, suffix: 'M' },
  { label: 'Storage', value: 1.2, suffix: 'EB' },
  { label: 'Latency', value: 85, suffix: 'ms' },
  { label: 'Uptime', value: 99.99, suffix: '%' },
]

function Counter({ stat }: { stat: Stat }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to({ value: 0 }, {
            value: stat.value,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function () {
              setCount(Math.round(this.targets()[0].value * 100) / 100)
            },
          })
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [stat.value])

  return (
    <div ref={ref} className="text-4xl font-bold text-green-400 md:text-5xl">
      {count}
      <span className="text-2xl md:text-3xl">{stat.suffix}</span>
    </div>
  )
}

export default function StatsDashboard() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={sectionRef}
      className="w-full bg-gradient-to-b from-black to-gray-900 py-24 px-4"
    >
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-5xl font-bold md:text-6xl">
          Real-Time Performance
        </h2>
        <p className="mb-16 text-center text-gray-400">
          Live metrics from our global infrastructure
        </p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-8 text-center"
            >
              <div className="mb-4">
                <Counter stat={stat} />
              </div>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart visualization */}
        <div className="mt-16 rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-8">
          <h3 className="mb-8 text-2xl font-bold">Request Volume (24h)</h3>
          <div className="h-64 rounded-lg bg-black">
            <svg
              viewBox="0 0 1000 300"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              {/* Simple line chart */}
              <polyline
                points="0,200 100,150 200,100 300,120 400,80 500,90 600,60 700,40 800,50 900,30 1000,20"
                fill="none"
                stroke="#00ff88"
                strokeWidth="2"
              />
              <polyline
                points="0,200 100,160 200,130 300,140 400,110 500,120 600,90 700,80 800,85 900,70 1000,60"
                fill="none"
                stroke="#0088ff"
                strokeWidth="2"
                opacity="0.6"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
