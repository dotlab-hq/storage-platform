'use client'

import * as React from 'react'
import {
  Home,
  Clock,
  Share2,
  Trash2,
  Shield,
  Settings,
  Database,
  StoneIcon,
  Moon,
  Sun,
  Monitor,
  Wifi,
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import { StorageQuota } from '@/components/storage/storage-quota'
import { useCurrentUser } from '@/lib/auth/current-user'
import { quotaQuery } from '@/lib/storage/folder-query'
import { useTheme } from '@/hooks/use-theme'
import { useHydrated } from '@/hooks/use-hydrated'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { WebRTCScannerDialog } from '@/routes/_app/webrtc/-components/webrtc-scanner-dialog'

const navItems = [
  { title: 'My Files', url: '/', icon: Home },
  { title: 'WebRTC Transfers', url: '/webrtc', icon: Wifi },
  { title: 'Buckets', url: '/buckets', icon: Database },
  { title: 'Recent', url: '/recent', icon: Clock },
  { title: 'Shared with Me', url: '/shared', icon: Share2 },
  { title: 'Trash', url: '/trash', icon: Trash2 },
  { title: 'Settings', url: '/settings', icon: Settings },
]

const themeConfig = {
  light: { icon: Sun, label: 'Light', next: 'dark' as const },
  dark: { icon: Moon, label: 'Dark', next: 'system' as const },
  system: { icon: Monitor, label: 'System', next: 'light' as const },
} as const

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isAdmin } = useCurrentUser()
  const { data: quota = null } = useQuery(quotaQuery())
  const { theme, setTheme } = useTheme()

  const items = React.useMemo(
    () =>
      isAdmin
        ? [...navItems, { title: 'Admin', url: '/admin', icon: Shield }]
        : navItems,
    [isAdmin],
  )

  // The saved theme is only known in the browser; render "system" until
  // hydrated so the server and first client render match.
  const hydrated = useHydrated()
  const currentTheme = hydrated && theme in themeConfig ? theme : 'system'
  const { icon: ThemeIcon, label: themeLabel, next } = themeConfig[currentTheme]

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <StoneIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">DOT. Storage</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <div className="pr-4">
            <NavMain items={items} />
            <div className="px-3 py-2">
              <WebRTCScannerDialog
                triggerLabel="Scan for Transfer"
                triggerVariant="secondary"
                className="w-full justify-start"
              />
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter>
        <StorageQuota quota={quota} className="mb-2" />
        <SidebarSeparator />
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-muted-foreground text-xs">Theme</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setTheme(next)}
                aria-label={`Switch to ${next} theme`}
              >
                <ThemeIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {themeLabel} — click for {next}
            </TooltipContent>
          </Tooltip>
        </div>
        <SidebarSeparator />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
