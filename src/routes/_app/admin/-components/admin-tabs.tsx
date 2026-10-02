import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export const ADMIN_TABS = ['overview', 'providers', 'users', 'add'] as const
export type AdminTab = (typeof ADMIN_TABS)[number]

/** Parses the `?tab=` search param. */
export function parseAdminTab(value: unknown): AdminTab | undefined {
  return ADMIN_TABS.find((tab) => tab === value)
}

/** Tab triggers of the admin page (shared with its loading skeleton). */
export function AdminTabsList() {
  return (
    <TabsList className="mb-4 grid w-full grid-cols-4">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="providers">Providers</TabsTrigger>
      <TabsTrigger value="users">Users</TabsTrigger>
      <TabsTrigger value="add">Add Provider</TabsTrigger>
    </TabsList>
  )
}
