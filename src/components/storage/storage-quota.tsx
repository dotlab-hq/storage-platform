import { Progress } from "@/components/ui/progress"
import { formatFileSize } from "@/lib/file-utils"
import { cn } from "@/lib/utils"
import type { UserQuota } from "@/types/storage"

type StorageQuotaProps = {
    quota: UserQuota | null
    className?: string
}

export function StorageQuota( { quota, className }: StorageQuotaProps ) {
    if ( !quota ) {
        return (
            <div className={cn( "space-y-2 px-2", className )}>
                <div className="bg-muted h-3 w-24 animate-pulse rounded" />
                <div className="bg-muted h-2 w-full animate-pulse rounded-full" />
            </div>
        )
    }

    const percentage = ( quota.usedStorage / quota.allocatedStorage ) * 100
    const isWarning = percentage >= 80
    const isDanger = percentage >= 95

    const variant = isDanger ? "danger" : isWarning ? "warning" : "default"

    return (
        <div className={cn( "space-y-2 px-2", className )}>
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                    Storage
                </span>
                <span
                    className={cn(
                        "text-xs font-medium",
                        isDanger && "text-destructive",
                        isWarning && !isDanger && "text-amber-500"
                    )}
                >
                    {formatFileSize( quota.usedStorage )} /{" "}
                    {formatFileSize( quota.allocatedStorage )}
                </span>
            </div>
            <Progress
                value={quota.usedStorage}
                max={quota.allocatedStorage}
                variant={variant}
                className="h-1.5"
            />
            {isWarning && (
                <p
                    className={cn(
                        "text-[10px]",
                        isDanger ? "text-destructive" : "text-amber-500"
                    )}
                >
                    {isDanger
                        ? "Storage almost full. Free up space."
                        : "You're running low on space."}
                </p>
            )}
        </div>
    )
}
