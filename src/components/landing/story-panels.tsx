import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

const panels = [
  {
    title: 'Object Storage',
    description: 'Scalable, durable storage for any file type',
    icon: '📦',
  },
  {
    title: 'Global Distribution',
    description: 'Instant access from anywhere in the world',
    icon: '🌍',
  },
  {
    title: 'Developer APIs',
    description: 'S3-compatible APIs for seamless integration',
    icon: '⚙️',
  },
  {
    title: 'Reliability',
    description: 'Enterprise-grade uptime and redundancy',
    icon: '🛡️',
  },
]

export default function StoryPanels() {
  const containerRef = useRef<HTMLDivElement>(null)
  const panelsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panelsContainerRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    gsap.to(panelsContainerRef.current, {
      x: () =>
        -(
          (panelsContainerRef.current?.scrollWidth || 0) -
          window.innerWidth
        ),
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: () => `+=${(panelsContainerRef.current?.scrollWidth || 0)}`,
        scrub: 1,
        pin: true,
        onEnter: () => {
          containerRef.current?.classList.add('pinned')
        },
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full overflow-hidden bg-black"
    >
      <div
        ref={panelsContainerRef}
        className="flex h-full w-max gap-8 px-8 py-16"
      >
        {panels.map((panel, idx) => (
          <div
            key={idx}
            className="h-full min-w-[90vw] flex-shrink-0 rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-900 to-black p-8 md:min-w-[70vw]"
          >
            <div className="mb-8 text-6xl">{panel.icon}</div>
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              {panel.title}
            </h2>
            <p className="mb-8 text-gray-400 md:text-lg">
              {panel.description}
            </p>
            <div className="h-64 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 opacity-20" />
          </div>
        ))}
      </div>
    </section>
  )
}
