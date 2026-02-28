import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
    "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground",
                secondary: "border-transparent bg-secondary text-secondary-foreground",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground",
                outline: "text-foreground",
                success:
                    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                warning:
                    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export type BadgeProps = React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants>

export function Badge( { className, variant, ...props }: BadgeProps ) {
    return (
        <span className={cn( badgeVariants( { variant } ), className )} {...props} />
    )
}
