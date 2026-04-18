import React from 'react'

export type PageSkeletonProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'sidebar' | 'compact' | 'modal' | 'chat'
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ( {
    className = '',
    variant = 'default',
    ...props
} ) => {
    const base = 'animate-pulse bg-muted/50 rounded-md'
    const sizing =
        variant === 'sidebar'
            ? 'h-12 w-full'
            : variant === 'compact'
                ? 'h-8 w-3/4'
                : variant === 'modal'
                    ? 'h-40 w-full'
                    : variant === 'chat'
                        ? 'h-56 w-full'
                        : 'h-24 w-full'

    return (
        <div
            role="status"
            aria-busy="true"
            className={`${base} ${sizing} ${className}`}
            {...props}
        />
    )
}

export default PageSkeleton
