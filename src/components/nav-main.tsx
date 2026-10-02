import type { LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

/** Primary sidebar navigation; the current page is highlighted. */
export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton asChild tooltip={item.title}>
              <Link
                to={item.url}
                // "/" would otherwise match every page.
                activeOptions={{ exact: item.url === '/', includeSearch: false }}
                activeProps={{ 'data-active': true }}
              >
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
