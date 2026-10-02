import { ChevronRight, RotateCcw, Trash2, AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/app/page-header'
import type { TrashCrumb } from '../index'

type TrashHeaderProps = {
  path: TrashCrumb[]
  itemCount: number
  onRestoreAll: () => void
  onEmptyTrash: () => void
}

const crumbClass =
  'text-muted-foreground hover:text-foreground max-w-40 truncate rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent'

export function TrashHeader({
  path,
  itemCount,
  onRestoreAll,
  onEmptyTrash,
}: TrashHeaderProps) {
  const isEmpty = itemCount === 0
  return (
    <PageHeader
      title={
        <nav className="flex items-center gap-1" aria-label="Breadcrumb">
          <Link to="/trash" search={{}} className={`${crumbClass} flex items-center gap-1`}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="font-semibold text-foreground">Trash</span>
          </Link>
          {path.map((crumb, index) => (
            <span key={crumb.id} className="flex items-center gap-1">
              <ChevronRight className="text-muted-foreground h-3.5 w-3.5" />
              <Link
                to="/trash"
                search={{ path: path.slice(0, index + 1) }}
                className={crumbClass}
              >
                {crumb.name}
              </Link>
            </span>
          ))}
        </nav>
      }
      actions={
        <>
          <Button variant="outline" size="sm" onClick={onRestoreAll} disabled={isEmpty}>
            <RotateCcw className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">
              {path.length > 0 ? 'Restore folder contents' : 'Restore all'}
            </span>
          </Button>
          <Button variant="destructive" size="sm" onClick={onEmptyTrash}>
            <AlertTriangle className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Empty trash</span>
          </Button>
        </>
      }
    />
  )
}
