import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import type * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useDeviceDetection, getParticleCount, createStorageParticles } from '@/components/landing/utils/scene'

function ConvergingParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const device = useDeviceDetection()
  const particleCount = Math.floor(getParticleCount(device) * 0.8)

  const particles = createStorageParticles(particleCount)

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.getElapsedTime()

    pointsRef.current.rotation.z += 0.001

    const positions = (pointsRef.current.geometry).attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      const distance = Math.sqrt(
        positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
      )
      const factor = Math.max(0.3, 1 - distance / 200)

      positions[i] *= 0.98 * factor
      positions[i + 1] *= 0.98 * factor
      positions[i + 2] *= 0.98 * factor

      positions[i] += Math.sin(time + i) * 0.05
      positions[i + 1] += Math.cos(time + i) * 0.05
    }
    ;(pointsRef.current.geometry).attributes.position.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} positions={particles} stride={3}>
      <PointMaterial
        transparent
        color="#00ff88"
        size={device === 'mobile' ? 0.4 : 0.6}
        sizeAttenuation
      />
    </Points>
  )
}

export default function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    gsap.from(ctaRef.current, {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top center',
      },
    })
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full bg-black py-24 px-4"
    >
      {/* 3D Canvas Background */}
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full bg-black" />}>
          <Canvas
            camera={{ position: [0, 0, 80], fov: 60 }}
            gl={{ antialias: true }}
            className="h-full w-full"
          >
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={0.3} />
            <pointLight position={[50, 50, 50]} intensity={0.5} />
            <ConvergingParticles />
          </Canvas>
        </Suspense>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-screen items-center justify-center">
        <div
          ref={ctaRef}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="mb-6 text-5xl font-bold md:text-7xl">
            Join the <span className="text-green-400">Future</span>
          </h2>
          <p className="mb-12 text-lg text-gray-300 md:text-xl">
            Experience enterprise-grade storage infrastructure that grows with you.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-lg bg-green-500 px-8 py-4 font-bold text-black transition hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/50 md:px-12 md:py-4 md:text-lg">
              Start Free Trial
            </button>
            <button className="rounded-lg border-2 border-green-500 px-8 py-4 font-bold text-green-400 transition hover:bg-green-500/10 md:px-12 md:py-4 md:text-lg">
              Schedule Demo
            </button>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            No credit card required. Free for 30 days.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-24 border-t border-gray-700 pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 font-bold">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">Features</a></li>
                <li><a href="#" className="hover:text-green-400">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400">Docs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">About</a></li>
                <li><a href="#" className="hover:text-green-400">Blog</a></li>
                <li><a href="#" className="hover:text-green-400">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">Privacy</a></li>
                <li><a href="#" className="hover:text-green-400">Terms</a></li>
                <li><a href="#" className="hover:text-green-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-bold">Social</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-green-400">Twitter</a></li>
                <li><a href="#" className="hover:text-green-400">GitHub</a></li>
                <li><a href="#" className="hover:text-green-400">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
            <p>&copy; 2026 Dot Storage. All rights reserved.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
