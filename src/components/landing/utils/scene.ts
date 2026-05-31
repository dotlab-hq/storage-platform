import * as THREE from 'three'
import { useEffect, useState } from 'react'

export function useDeviceDetection() {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop'
  )

  useEffect(() => {
    const checkDevice = () => {
      if (window.innerWidth < 768) setDevice('mobile')
      else if (window.innerWidth < 1024) setDevice('tablet')
      else setDevice('desktop')
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return device
}

export function getParticleCount(device: 'mobile' | 'tablet' | 'desktop') {
  switch (device) {
    case 'mobile':
      return 500
    case 'tablet':
      return 2000
    default:
      return 5000
  }
}

export function createStorageParticles(count: number) {
  const particles = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    particles[i3] = (Math.random() - 0.5) * 200
    particles[i3 + 1] = (Math.random() - 0.5) * 200
    particles[i3 + 2] = (Math.random() - 0.5) * 200
  }
  return particles
}

export function createNetworkConnections(
  particleCount: number,
  connectionDistance: number = 50
) {
  const connections: Array<[number, number]> = []
  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < Math.min(i + 10, particleCount); j++) {
      connections.push([i, j])
    }
  }
  return connections
}

export const ScrollConfig = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
}
