import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import type * as THREE from 'three'
import * as THREE_module from 'three'

function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null)
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth < 768) setDevice('mobile')
      else if (window.innerWidth < 1024) setDevice('tablet')
      else setDevice('desktop')
    }

    checkDevice()
  }, [])

  useEffect(() => {
    const particleCount = device === 'mobile' ? 800 : device === 'tablet' ? 1500 : 2500
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 30
      positions[i + 1] = (Math.random() - 0.5) * 30
      positions[i + 2] = (Math.random() - 0.5) * 30
    }

    if (pointsRef.current?.geometry) {
      pointsRef.current.geometry.setAttribute(
        'position',
        new THREE_module.BufferAttribute(positions, 3)
      )
    }
  }, [device])

  useFrame((state) => {
    if (!pointsRef.current) return

    pointsRef.current.rotation.x += 0.00008
    pointsRef.current.rotation.y += 0.00012

    const time = state.clock.getElapsedTime()
    const positions = (pointsRef.current.geometry).attributes
      .position.array as Float32Array

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time * 0.3 + i) * 0.0008
      positions[i + 1] += Math.cos(time * 0.3 + i) * 0.0008
    }

    ;(pointsRef.current.geometry).attributes.position.needsUpdate = true
  })

  return (
    <Points ref={pointsRef} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={device === 'mobile' ? 0.2 : device === 'tablet' ? 0.25 : 0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  )
}

export default function Hero3DScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 60 }}
      gl={{ antialias: true, alpha: true }}
      className="h-screen w-full"
    >
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={0.8} />
      <ParticleSystem />
    </Canvas>
  )
}
