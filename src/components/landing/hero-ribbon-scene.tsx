import { useMemo, useRef } from 'react'
import { Float, PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

type RibbonPanelProps = {
  index: number
  total: number
}

const palette = ['#f8a8ff', '#a7f3ff', '#d8b4fe', '#f9c6de', '#b5d5ff', '#c4b5fd']

function RibbonPanel({ index, total }: RibbonPanelProps) {
  const meshRef = useRef<Mesh>(null)
  const seed = index / Math.max(total - 1, 1)
  const baseX = -12 + index * 0.95
  const baseY = Math.sin(index * 0.42) * 1.55 + index * 0.03
  const baseZ = Math.cos(index * 0.33) * 0.95
  const baseRotation = [-0.05, 0.12, -0.9 + Math.sin(index * 0.2) * 0.08] as const
  const color = palette[index % palette.length]

  useFrame(({ clock, mouse }) => {
    if (!meshRef.current) return

    const time = clock.getElapsedTime()
    meshRef.current.rotation.x = baseRotation[0] + Math.sin(time * 0.6 + seed * 4) * 0.06 + mouse.y * 0.03
    meshRef.current.rotation.y = baseRotation[1] + mouse.x * 0.04
    meshRef.current.rotation.z = baseRotation[2] + Math.cos(time * 0.5 + seed * 5) * 0.08
    meshRef.current.position.y = baseY + Math.sin(time * 1.1 + seed * 7) * 0.05
    meshRef.current.position.z = baseZ + Math.cos(time * 0.8 + seed * 6) * 0.06
  })

  return (
    <Float floatIntensity={0.3} rotationIntensity={0.2} speed={1.2}>
      <group position={[baseX, baseY, baseZ]}>
        <mesh ref={meshRef}>
          <boxGeometry args={[0.74, 2.9, 0.12]} />
          <meshPhysicalMaterial
            color={color}
            metalness={0.94}
            roughness={0.12}
            transmission={0.24}
            thickness={0.45}
            clearcoat={1}
            clearcoatRoughness={0.04}
            ior={1.45}
            envMapIntensity={1.3}
          />
        </mesh>
        <mesh position={[0, 0, -0.045]}>
          <boxGeometry args={[0.82, 3.02, 0.03]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.24} />
        </mesh>
      </group>
    </Float>
  )
}

export function HeroRibbonScene() {
  const panels = useMemo(() => Array.from({ length: 22 }, (_, index) => index), [])

  return (
    <div className="absolute inset-0">
      <Canvas gl={{ antialias: true, alpha: true }} className="h-full w-full">
        <PerspectiveCamera makeDefault position={[0, 0.3, 18]} fov={38} />
        <color attach="background" args={['#f6f7fb']} />
        <fog attach="fog" args={['#f6f7fb', 15, 28]} />
        <ambientLight intensity={1.8} />
        <directionalLight position={[10, 8, 10]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-6, 5, 10]} intensity={18} color="#d8b4fe" />
        <pointLight position={[6, -3, 8]} intensity={14} color="#a7f3ff" />
        {panels.map((index) => (
          <RibbonPanel key={index} index={index} total={panels.length} />
        ))}
      </Canvas>
    </div>
  )
}

export default HeroRibbonScene