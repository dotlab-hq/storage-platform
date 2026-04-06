'use client'

import * as React from 'react'
import { ChevronsUpDown, LogOut, Settings, Wifi, WifiOff } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { createClientOnlyFn } from '@tanstack/react-start'
import { sessionStatusFn } from '@/routes/-hot-qr-server'
import { authClient } from '@/lib/auth-client'
import { ScanQrDialog } from '@/components/qr/scan-qr-dialog'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const WEBRTC_ENABLED_KEY = 'dot_webrtc_enabled'

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    isAdmin: boolean
  }
}) {
  const { isMobile } = useSidebar()
  const [tinySession, setTinySession] = React.useState<{
    permission: 'read' | 'read-write'
    expiresAt: string
  } | null>(null)
  const [webrtcEnabled, setWebrtcEnabled] = React.useState(false)

  const logout = createClientOnlyFn(async () => {
    await authClient.signOut()
    window.location.reload()
  })

  React.useEffect(() => {
    const stored = localStorage.getItem(WEBRTC_ENABLED_KEY)
    setWebrtcEnabled(stored === 'true')
  }, [])

  const toggleWebRTC = () => {
    const newValue = !webrtcEnabled
    setWebrtcEnabled(newValue)
    localStorage.setItem(WEBRTC_ENABLED_KEY, String(newValue))
    window.dispatchEvent(
      new CustomEvent('webrtc-toggled', { detail: newValue }),
    )
  }

  React.useEffect(() => {
    let cancelled = false

    const loadTinySession = async () => {
      try {
        const data = await sessionStatusFn()

        if (!data?.active || !data.permission || !data.expiresAt) {
          if (!cancelled) {
            setTinySession(null)
          }
          return
        }

        if (!cancelled) {
          setTinySession({
            permission: data.permission,
            expiresAt: data.expiresAt,
          })
        }
      } catch {
        if (!cancelled) {
          setTinySession(null)
        }
      }
    }

    void loadTinySession()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <Settings />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleWebRTC}>
              {webrtcEnabled ? (
                <>
                  <WifiOff className="mr-2 h-4 w-4" />
                  Disable WebRTC transfers
                </>
              ) : (
                <>
                  <Wifi className="mr-2 h-4 w-4" />
                  Enable WebRTC transfers
                </>
              )}
            </DropdownMenuItem>
            {!tinySession && (
              <div className="px-1 py-1.5">
                <ScanQrDialog
                  triggerLabel="Scan now"
                  triggerVariant="ghost"
                  className="h-8 w-full justify-start px-2"
                />
              </div>
            )}
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => void logout()}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
