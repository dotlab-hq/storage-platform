"use client"

import * as React from "react"
import {
  Home,
  Link2,
  StoneIcon,
} from "lucide-react"
import { ClientOnly } from "@tanstack/react-router"
import { createClientOnlyFn } from "@tanstack/react-start"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { authClient } from "@/lib/auth-client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Share Link",
      url: "#",
      icon: Link2,
    },
  ],
}

export function AppSidebar( { ...props }: React.ComponentProps<typeof Sidebar> ) {
  const [navUser, setNavUser] = React.useState( data.user )

  const getSessionUser = createClientOnlyFn( async () => {
    const { data: session, error } = await authClient.getSession()

    if ( error || !session?.user ) {
      return null
    }

    return {
      name: session.user.name,
      email: session.user.email,
      avatar: session.user.image ?? "",
    }
  } )

  React.useEffect( () => {
    let mounted = true

    void getSessionUser().then( ( sessionUser ) => {
      if ( mounted && sessionUser ) {
        setNavUser( sessionUser )
      }
    } )

    return () => {
      mounted = false
    }
  }, [getSessionUser] )

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <StoneIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">DOT. Storage</span>

                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <ClientOnly fallback={null}>
          <NavUser user={navUser} />
        </ClientOnly>
      </SidebarFooter>
    </Sidebar>
  )
}
