import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSettingsSnapshotFn } from './-settings-server'
import { updateSettings } from './-store'
import { ProfileSection } from './-components/profile-section'
import { AuthMethodsSection } from './-components/auth-methods-section'
import { TwoFactorSection } from './-components/two-factor-section'
import { PasswordSection } from './-components/password-section'
import { TinySessionsSection } from './-components/tiny-sessions-section'
import { ApiKeysSection } from './-components/api-keys-section'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute('/_app/settings/')({
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
  component: SettingsPage,
  loader: () => getSettingsSnapshotFn(),
})

function SettingsPage() {
  const initial = Route.useLoaderData()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    updateSettings({
      name: initial.user.name,
      image: initial.user.image,
      twoFactorEnabled: initial.security.twoFactorEnabled,
    })
  }, [initial])

  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold">Settings</h1>
      </header>
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="auth">Auth Methods</TabsTrigger>
            <TabsTrigger value="2fa">2FA</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileSection initial={initial} />
          </TabsContent>
          <TabsContent value="auth">
            <AuthMethodsSection initial={initial} />
          </TabsContent>
          <TabsContent value="2fa">
            <TwoFactorSection />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSection />
          </TabsContent>
          <TabsContent value="sessions">
            <TinySessionsSection initial={initial} />
          </TabsContent>
          <TabsContent value="api-keys">
            <ApiKeysSection initialKeys={initial.apiKeys} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
