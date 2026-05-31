import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { useDeviceDetection, getParticleCount, createStorageParticles } from '@/components/landing/utils/scene'

function ParticleSystem() {
  const pointsRef = useRef<THREE.Points>(null)
  const device = useDeviceDetection()
  const particleCount = getParticleCount(device)

  const particles = createStorageParticles(particleCount)

  useFrame((state) => {
    if (!pointsRef.current) return
    const time = state.clock.getElapsedTime()

    pointsRef.current.rotation.x += 0.0001
    pointsRef.current.rotation.y += 0.0002

    const positions = (pointsRef.current.geometry as THREE.BufferGeometry).attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += Math.sin(time + i) * 0.01
      positions[i + 1] += Math.cos(time + i) * 0.01
      positions[i + 2] += Math.sin(time * 0.5 + i) * 0.005
    }
    ;(pointsRef.current.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true
  })

  return (
    <Points
      ref={pointsRef}
      positions={particles}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#00ff88"
        size={device === 'mobile' ? 0.3 : device === 'tablet' ? 0.4 : 0.5}
        sizeAttenuation
      />
    </Points>
  )
}

export default function Hero3DScene() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth < 768) setDevice('mobile')
      else if (window.innerWidth < 1024) setDevice('tablet')
      else setDevice('desktop')
    }

    checkDevice()
  }, [])

  const fov = device === 'mobile' ? 75 : 65

  return (
    <Canvas
      camera={{
        position: [0, 0, 100],
        fov,
      }}
      gl={{ antialias: true, alpha: true }}
      className="h-screen w-full"
    >
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[100, 100, 100]} intensity={0.8} />
      <ParticleSystem />
    </Canvas>
  )
}
