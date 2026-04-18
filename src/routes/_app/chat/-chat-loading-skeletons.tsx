export function ChatRouteSkeleton() {
    return (
        <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 animate-pulse">
            <aside className="hidden w-75 shrink-0 border-r bg-muted/20 lg:block">
                <div className="space-y-2 p-3">
                    <div className="h-9 w-full rounded-md bg-muted" />
                    <div className="h-9 w-full rounded-md bg-muted" />
                </div>
                <div className="space-y-2 p-3">
                    <div className="h-14 w-full rounded-md bg-muted" />
                    <div className="h-14 w-full rounded-md bg-muted" />
                    <div className="h-14 w-full rounded-md bg-muted" />
                </div>
            </aside>

            <section className="flex min-w-0 flex-1 flex-col px-2 pb-2 sm:px-4 sm:pb-4">
                <div className="flex min-h-0 flex-1 flex-col pt-3 sm:pt-4">
                    <div className="space-y-3">
                        <div className="h-24 w-[82%] rounded-md bg-muted" />
                        <div className="ml-auto h-20 w-[72%] rounded-md bg-muted" />
                        <div className="h-28 w-[88%] rounded-md bg-muted" />
                    </div>
                </div>
                <div className="mt-2 h-28 rounded-md bg-muted/70" />
            </section>
        </div>
    )
}

export function ChatContentSkeleton() {
    return (
        <div className="flex min-h-0 flex-1 flex-col animate-pulse pt-3 sm:pt-4">
            <div className="min-h-0 flex-1 space-y-3 overflow-hidden">
                <div className="h-20 w-[82%] rounded-md bg-muted" />
                <div className="ml-auto h-16 w-[70%] rounded-md bg-muted" />
                <div className="h-24 w-[88%] rounded-md bg-muted" />
            </div>
            <div className="mt-2 h-28 rounded-md bg-muted/70" />
        </div>
    )
}