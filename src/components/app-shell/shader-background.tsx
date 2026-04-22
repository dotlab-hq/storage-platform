'use client'

import { useEffect, useState } from 'react'

export function ShaderBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <div className="mono-shader" aria-hidden="true" />
}
