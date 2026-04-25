import * as React from 'react'
import { Link, Route, useNavigate } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { Upload, Settings, Trash2, Shield, FolderOpen } from 'lucide-react'

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
        whileHover={{ scale: 1.05, y: -1 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative group flex h-10 w-10 items-center justify-center rounded-xl',
          'border border-transparent bg-white/[0.03] text-muted-foreground',
          'transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.08] hover:text-foreground',
          active && 'border-white/10 bg-white/[0.12] text-foreground',
          className,
        )}
      >
        <Icon className="h-4 w-4" />
        <span
          className={cn(
            'absolute -top-9 left-1/2 -translate-x-1/2',
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

    const handleUploadClick = () => {
      const url = new URL(window.location.href)
      const bucketName = url.pathname.match(/\/buckets\/([^/]+)/)?.[1]
      if (bucketName) {
        window.dispatchEvent(new CustomEvent('dot:open-upload'))
      } else {
        const search = Route.useSearch()
        navigate({ to: '/', search }).then(() => {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('dot:open-upload'))
          }, 100)
        })
      }
    }

    const handleFilesClick = () => {
      navigate({ to: '/' })
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.25,
            ease: 'easeOut',
          }}
          className={cn(
            'flex items-center gap-2 rounded-[20px] px-2.5 py-2',
            'border border-white/10 bg-background/70 shadow-[0_12px_40px_rgba(0,0,0,0.28)]',
            'backdrop-blur-xl supports-[backdrop-filter]:bg-background/55',
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
