import { useQuery } from '@tanstack/react-query'
import type { GetHomeDashboardDataFn } from '@/routes/-home-server'
import { MetricCard } from '@/components/admin/dashboard-panels'
import { formatBytes } from '@/lib/format-bytes'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import the server function to keep client bundle small
async function loadGetHomeDashboardDataFn(): Promise<GetHomeDashboardDataFn> {
  const mod = await import('@/routes/-home-server')
  return mod.getHomeDashboardDataFn
}

export function HomeMetricsBar() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['home-dashboard'],
    queryFn: async () => {
      const fn = await loadGetHomeDashboardDataFn()
      return fn()
    },
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error || !data) {
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard title="All Files" value={data.fileCount} />
      <MetricCard title="All Folders" value={data.folderCount} />
      <MetricCard title="Total Storage" value={formatBytes(data.storageUsed)} />
    </div>
  )
}
