import type { ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type PageHeaderProps = {
  /** Left side: a title, breadcrumbs, or a skeleton placeholder. */
  title: ReactNode
  /** Optional icon shown before a plain-text title. */
  icon?: ReactNode
  /** Right side: page actions. */
  actions?: ReactNode
}

/**
 * The top bar every app page uses (sidebar toggle + title + actions).
 * Fixed height so pages and their skeletons line up exactly.
 */
export function PageHeader({ title, icon, actions }: PageHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-2 sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        {icon}
        {typeof title === 'string' ? (
          <h1 className="truncate text-sm font-semibold">{title}</h1>
        ) : (
          <div className="min-w-0">{title}</div>
        )}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  )
}
