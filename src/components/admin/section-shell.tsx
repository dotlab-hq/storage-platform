import type { ReactNode } from 'react'

type SectionShellProps = {
  title: string
  count: number
  children: ReactNode
}

export function SectionShell({ title, count, children }: SectionShellProps) {
  return (
    <section className="rounded-2xl border bg-background/80 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </section>
  )
}
