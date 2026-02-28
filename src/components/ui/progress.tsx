import * as React from "react"
import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentProps<"div"> & {
    value?: number
    max?: number
    variant?: "default" | "warning" | "danger"
}

export function Progress( {
    className,
    value = 0,
    max = 100,
    variant = "default",
    ...props
}: ProgressProps ) {
    const percentage = Math.min( 100, Math.max( 0, ( value / max ) * 100 ) )

    const variantClasses = {
        default: "bg-primary",
        warning: "bg-amber-500",
        danger: "bg-destructive",
    }

    return (
        <div
            className={cn(
                "bg-muted relative h-2 w-full overflow-hidden rounded-full",
                className
            )}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            {...props}
        >
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    variantClasses[variant]
                )}
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
}
