import * as React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import {
  Upload,
  Settings,
  Trash2,
  ArrowUpDown,
  Shield,
  FolderOpen,
} from 'lucide-react'

interface DockProps {
  className?: string
}

interface DockItem {
  icon: LucideIcon
  label: string
  href: string
}

interface DockIconButtonProps {
  icon: LucideIcon
  label: string
  href: string
  className?: string
}

const DockIconButton = React.forwardRef<HTMLAnchorElement, DockIconButtonProps>(
  ({ icon: Icon, label, href, className }, ref) => {
    return (
      <motion.a
        ref={ref}
        href={href}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative group p-3 rounded-lg',
          'hover:bg-secondary transition-colors',
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
  },
)
DockIconButton.displayName = 'DockIconButton'

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className }, ref) => {
    const items: DockItem[] = [
      { icon: Upload, label: 'Upload', href: '/buckets' },
      { icon: FolderOpen, label: 'Files', href: '/buckets' },
      { icon: ArrowUpDown, label: 'Sort', href: '/buckets' },
      { icon: Trash2, label: 'Trash', href: '/trash' },
      { icon: Shield, label: 'Admin', href: '/admin' },
      { icon: Settings, label: 'Settings', href: '/settings' },
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
