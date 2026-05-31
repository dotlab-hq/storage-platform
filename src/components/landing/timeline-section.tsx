import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

interface TimelineEvent {
  year: string
  title: string
  description: string
}

const events: TimelineEvent[] = [
  {
    year: '2024',
    title: 'Foundation',
    description: 'Launched global infrastructure backbone',
  },
  {
    year: '2025',
    title: 'Scale',
    description: 'Expanded to 180+ regions worldwide',
  },
  {
    year: '2026',
    title: 'Innovation',
    description: 'Introduced AI-powered optimization',
  },
  {
    year: '2027',
    title: 'Evolution',
    description: 'Next-generation edge computing',
  },
]

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const eventsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    eventsRef.current.forEach((event, idx) => {
      gsap.from(event, {
        opacity: 0,
        x: idx % 2 === 0 ? -50 : 50,
        duration: 0.8,
        scrollTrigger: {
          trigger: event,
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
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-4 text-center text-5xl font-bold md:text-6xl">
          Our Journey
        </h2>
        <p className="mb-16 text-center text-gray-400">
          Building the future of global data infrastructure
        </p>

        <div ref={timelineRef} className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-green-500 to-blue-500" />

          <div className="space-y-12">
            {events.map((event, idx) => (
              <div
                ref={(el) => {
                  if (el) eventsRef.current[idx] = el
                }}
                key={event.year}
                className={`flex gap-8 ${idx % 2 === 0 ? '' : 'flex-row-reverse'}`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-6">
                    <div className="text-sm font-semibold text-green-400">
                      {event.year}
                    </div>
                    <h3 className="mb-2 text-2xl font-bold">{event.title}</h3>
                    <p className="text-gray-400">{event.description}</p>
                  </div>
                </div>

                {/* Timeline dot */}
                <div className="flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-4 border-green-500 bg-black" />
                </div>

                {/* Empty space for alternation */}
                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
