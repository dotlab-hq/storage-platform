import type { ReactNode } from 'react'
import { HotkeysProvider } from '@tanstack/react-hotkeys'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfilerBoundary } from '@/components/app/profiler-boundary'

let context:
  | {
      queryClient: QueryClient
    }
  | undefined

export function getContext() {
  if (context) {
    return context
  }

  const queryClient = new QueryClient()

  context = {
    queryClient,
  }

  return context
}

export default function TanStackQueryProvider({
  children,
}: {
  children: ReactNode
}) {
  const { queryClient } = getContext()

  return (
    <QueryClientProvider client={queryClient}>
      <HotkeysProvider
        defaultOptions={{
          hotkey: { preventDefault: true },
          hotkeySequence: { timeout: 1500 },
        }}
      >
        <ProfilerBoundary id="app-root">{children}</ProfilerBoundary>
      </HotkeysProvider>
    </QueryClientProvider>
  )
}
