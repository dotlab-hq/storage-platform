import { Suspense, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { ThreeElements } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

function ArchitectureLayers() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ mouse }) => {
    if (!groupRef.current) return
    groupRef.current.rotation.x = mouse.y * 0.3
    groupRef.current.rotation.y = mouse.x * 0.3
  })

  return (
    <group ref={groupRef}>
      {/* Application Layer */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[6, 0.5, 6]} />
        <meshStandardMaterial color="#00ff88" wireframe />
      </mesh>

      {/* API Layer */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[5.5, 0.5, 5.5]} />
        <meshStandardMaterial color="#0088ff" wireframe />
      </mesh>

      {/* Storage Layer */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 0.5, 5]} />
        <meshStandardMaterial color="#ff00ff" wireframe />
      </mesh>

      {/* Replication Layer */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[4.5, 0.5, 4.5]} />
        <meshStandardMaterial color="#ffff00" wireframe />
      </mesh>

      {/* Infrastructure Layer */}
      <mesh position={[0, -2, 0]}>
        <boxGeometry args={[4, 0.5, 4]} />
        <meshStandardMaterial color="#ff8800" wireframe />
      </mesh>
    </group>
  )
}

export default function ArchitectureSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    gsap.from(sectionRef.current, {
      opacity: 0,
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
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-4 text-center text-5xl font-bold md:text-6xl">
          Infrastructure Architecture
        </h2>
        <p className="mb-16 text-center text-gray-400">
          Multi-layered, resilient infrastructure for global data distribution
        </p>

        <div className="h-96 rounded-xl border border-gray-700 overflow-hidden">
          <Suspense fallback={<div className="h-full bg-gray-900" />}>
            <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
              <color attach="background" args={['#000000']} />
              <ambientLight intensity={0.6} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <ArchitectureLayers />
            </Canvas>
          </Suspense>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Applications', color: 'text-green-400' },
            { label: 'APIs', color: 'text-blue-400' },
            { label: 'Object Storage', color: 'text-purple-400' },
            { label: 'Replication', color: 'text-yellow-400' },
            { label: 'Infrastructure', color: 'text-orange-400' },
            { label: 'Global Network', color: 'text-pink-400' },
          ].map((layer) => (
            <div
              key={layer.label}
              className="rounded-lg border border-gray-700 p-4"
            >
              <div className={`font-semibold ${layer.color}`}>
                ◆ {layer.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
