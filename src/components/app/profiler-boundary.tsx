'use client'

import { Profiler, useEffectEvent, type ProfilerOnRenderCallback } from 'react'

type ProfilerBoundaryProps = {
  id: string
  children: React.ReactNode
}

export function ProfilerBoundary({ id, children }: ProfilerBoundaryProps) {
  const handleRender = useEffectEvent<ProfilerOnRenderCallback>(
    (profileId, phase, actualDuration) => {
      if (!import.meta.env.DEV) {
        return
      }

      console.debug('[profiler]', {
        id: profileId,
        phase,
        actualDuration: Number(actualDuration.toFixed(2)),
      })
    },
  )

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  )
}
