import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from('.step-item', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center+=100',
        },
        opacity: 0,
        y: 30,
        stagger: 0.15,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  const steps = [
    {
      number: '01',
      title: 'Personal Cloud Drive',
      description: 'Use Dot Storage like Google Drive or Dropbox. Upload, organize, and share your files with anyone.',
    },
    {
      number: '02',
      title: 'Mount as Network Folder',
      description: 'Use WebDAV to mount your storage directly to your computer. It shows up like a USB drive or network share.',
    },
    {
      number: '03',
      title: 'S3-Compatible APIs',
      description: 'Use all your existing S3 tools and code. Migrate from AWS S3 or build new applications without vendor lock-in.',
    },
  ]

  return (
    <section ref={containerRef} id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Three Ways to Use It
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One platform. Three powerful interfaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="step-item"
            >
              <div className="flex items-start gap-4">
                <div className="text-5xl font-bold text-gray-900 opacity-20">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What is WebDAV?
          </h3>
          <p className="text-gray-600 leading-relaxed">
            WebDAV is a standard that lets you mount cloud storage like a regular network folder. On Windows, it appears in File Explorer. On Mac, it appears in Finder. On Linux, any file manager supports it. No special client software needed.
          </p>
        </div>
      </div>
    </section>
  )
}
