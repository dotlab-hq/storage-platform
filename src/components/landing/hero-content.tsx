import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface Metric {
  label: string
  value: string
}

const metrics: Metric[] = [
  { label: 'Objects Stored', value: '1.2B' },
  { label: 'Requests Served', value: '100M/s' },
  { label: 'Regions Connected', value: '180+' },
  { label: 'Storage Throughput', value: '1.5 PB/s' },
]

export default function HeroContent() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctasRef = useRef<HTMLDivElement>(null)
  const metricsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    tl.from(titleRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: 'power2.out',
    })
      .from(
        subtitleRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
        },
        '-=0.5'
      )
      .from(
        ctasRef.current?.children || [],
        {
          opacity: 0,
          y: 20,
          duration: 0.6,
          stagger: 0.2,
        },
        '-=0.4'
      )
      .from(
        metricsRef.current?.children || [],
        {
          opacity: 0,
          scale: 0.8,
          duration: 0.8,
          stagger: 0.15,
        },
        '-=0.2'
      )
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <div className="z-10 px-4 text-center">
        <h1
          ref={titleRef}
          className="mb-6 text-5xl font-bold md:text-7xl lg:text-8xl"
        >
          Storage Built For The <span className="text-green-400">Internet</span>
        </h1>

        <p
          ref={subtitleRef}
          className="mb-12 text-lg text-gray-300 md:text-xl lg:text-2xl"
        >
          Store, distribute, manage, and access data globally through a unified
          infrastructure platform.
        </p>

        <div
          ref={ctasRef}
          className="pointer-events-auto mb-16 flex flex-col gap-4 sm:flex-row sm:justify-center"
        >
          <button className="rounded-lg bg-green-500 px-8 py-3 font-semibold text-black transition hover:bg-green-400 md:px-10 md:py-4">
            Get Started
          </button>
          <button className="rounded-lg border border-gray-400 px-8 py-3 font-semibold transition hover:border-green-400 hover:text-green-400 md:px-10 md:py-4">
            Learn More
          </button>
        </div>

        <div
          ref={metricsRef}
          className="pointer-events-auto grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-gray-700 bg-gray-900 bg-opacity-50 px-4 py-3 backdrop-blur md:px-6 md:py-4"
            >
              <div className="text-xs font-semibold text-gray-400 md:text-sm">
                {metric.label}
              </div>
              <div className="mt-2 text-2xl font-bold text-green-400 md:text-3xl">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
