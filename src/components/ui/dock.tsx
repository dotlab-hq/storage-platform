import * as React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Upload,
  Settings,
  Trash2,
  Shield,
  FolderOpen,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useSortStore } from '@/stores/sort-store'

interface DockProps {
  className?: string
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  href?: string
  onClick?: () => void
  active?: boolean
  className?: string
}

const DockIconButton = React.forwardRef<HTMLAnchorElement, DockIconButtonProps>(
  ({ icon: Icon, label, href, onClick, active, className }, ref) => {
    const content = (
      <motion.a
        ref={ref}
        href={href}
        onClick={onClick}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative group p-3 rounded-lg',
          'hover:bg-secondary transition-colors',
          active && 'bg-secondary',
          className,
        )}
      >
        <Icon className="w-5 h-5 text-foreground" />
        <span
          className={cn(
            'absolute -top-8 left-1/2 -translate-x-1/2',
            'px-2 py-1 rounded text-xs',
            'bg-popover text-popover-foreground',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity whitespace-nowrap pointer-events-none',
          )}
        >
          {label}
        </span>
      </motion.a>
    )

    if (href) {
      return <Link to={href as '/'}>{content}</Link>
    }

    return content
  },
)
DockIconButton.displayName = 'DockIconButton'

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className }, ref) => {
    const navigate = useNavigate()
    const sort = useSortStore()

    const handleUploadClick = () => {
      const url = new URL(window.location.href)
      const bucketName = url.pathname.match(/\/buckets\/([^/]+)/)?.[1]
      if (bucketName) {
        window.dispatchEvent(new CustomEvent('dot:open-upload'))
      } else {
        navigate({ to: '/' }).then(() => {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('dot:open-upload'))
          }, 100)
        })
      }
    }

    const handleFilesClick = () => {
      navigate({ to: '/' })
    }

    const handleSortClick = () => {
      sort.toggleOrder()
    }

    const getSortLabel = () => {
      const fieldLabels: Record<string, string> = {
        name: 'Name',
        createdAt: 'Created',
        updatedAt: 'Modified',
        size: 'Size',
      }
      const orderLabel = sort.order === 'asc' ? ' ↑' : ' ↓'
      return `Sort: ${fieldLabels[sort.field]}${orderLabel}`
    }

    const items = [
      {
        icon: Upload,
        label: 'Upload',
        onClick: handleUploadClick,
      },
      {
        icon: FolderOpen,
        label: 'Files',
        href: '/',
        onClick: handleFilesClick,
      },
      {
        icon: sort.order === 'asc' ? ArrowUp : ArrowDown,
        label: getSortLabel(),
        onClick: handleSortClick,
      },
      {
        icon: Trash2,
        label: 'Trash',
        href: '/trash',
      },
      {
        icon: Shield,
        label: 'Admin',
        href: '/admin',
      },
      {
        icon: Settings,
        label: 'Settings',
        href: '/settings',
      },
    ]

    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
          className,
        )}
      >
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 4, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={cn(
            'flex items-center gap-1 p-2 rounded-2xl',
            'backdrop-blur-lg border shadow-lg',
            'bg-background/90 border-border',
            'hover:shadow-xl transition-shadow duration-300',
          )}
        >
          {items.map((item) => (
            <DockIconButton key={item.label} {...item} />
          ))}
        </motion.div>
      </div>
    )
  },
)
Dock.displayName = 'Dock'

export { Dock }
