import { useQuery } from '@tanstack/react-query'
import { getHomeDashboardDataFn } from '@/routes/-home-server'
import { MetricCard } from '@/components/admin/dashboard-panels'
import { formatBytes } from '@/lib/format-bytes'
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function HomeMetricsBar() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['home-dashboard'],
    queryFn: getHomeDashboardDataFn,
  })

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid gap-4 md:grid-cols-4">
      <MetricCard title="Files" value={data.fileCount} />
      <MetricCard title="Folders" value={data.folderCount} />
      <MetricCard title="Storage Used" value={formatBytes(data.storageUsed)} />
      <MetricCard title="Providers" value={data.providerCount} />
    </div>
  )
}
