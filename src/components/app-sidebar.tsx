"use client"

import * as React from "react"
import {
  Home,
  Clock,
  Share2,
  Trash2,
  Settings,
  StoneIcon,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"
import { ClientOnly, Link } from "@tanstack/react-router"
import { createClientOnlyFn } from "@tanstack/react-start"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { StorageQuota } from "@/components/storage/storage-quota"
import { authClient } from "@/lib/auth-client"
import { useTheme } from "@/hooks/use-theme"
import type { UserQuota } from "@/types/storage"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { title: "My Files", url: "/", icon: Home, isActive: true },
  { title: "Recent", url: "/recent", icon: Clock },
  { title: "Shared with Me", url: "/shared", icon: Share2 },
  { title: "Trash", url: "/trash", icon: Trash2 },
  { title: "Settings", url: "/settings", icon: Settings },
]

const defaultUser = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  quota?: UserQuota | null
}

const themeConfig = {
  light: { icon: Sun, label: "Light", next: "dark" as const },
  dark: { icon: Moon, label: "Dark", next: "system" as const },
  system: { icon: Monitor, label: "System", next: "light" as const },
} as const

export function AppSidebar( { quota = null, ...props }: AppSidebarProps ) {
  const [navUser, setNavUser] = React.useState( defaultUser )
  const { theme, setTheme } = useTheme()

  const getSessionUserRef = React.useRef(
    createClientOnlyFn( async () => {
      const { data: session, error } = await authClient.getSession()
      if ( error || !session?.user ) return null
      return {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image ?? "",
      }
    } )
  )

  React.useEffect( () => {
    let mounted = true
    void getSessionUserRef.current().then( ( sessionUser ) => {
      if ( mounted && sessionUser ) setNavUser( sessionUser )
    } )
    return () => { mounted = false }
  }, [] )

  const currentTheme = theme in themeConfig ? theme : "system"
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
        <NavMain items={navItems} />
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
                onClick={() => setTheme( next )}
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
        <ClientOnly fallback={null}>
          <NavUser user={navUser} />
        </ClientOnly>
      </SidebarFooter>
    </Sidebar>
  )
}
