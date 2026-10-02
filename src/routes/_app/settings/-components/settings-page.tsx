import { getRouteApi } from '@tanstack/react-router'
import { SidebarInset } from '@/components/ui/sidebar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/app/page-header'
import { ProfileSection } from './profile-section'
import { ProvidersSection } from './providers-section'
import { AuthMethodsSection } from './auth-methods-section'
import { TwoFactorSection } from './two-factor-section'
import { PasswordSection } from './password-section'
import { TinySessionsSection } from './tiny-sessions-section'

export type SettingsTab =
  | 'profile'
  | 'providers'
  | 'auth'
  | '2fa'
  | 'password'
  | 'sessions'

export const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'providers', label: 'Providers' },
  { id: 'auth', label: 'Auth Methods' },
  { id: '2fa', label: 'Two-Factor' },
  { id: 'password', label: 'Password' },
  { id: 'sessions', label: 'Sessions' },
]

/** Shared classes so the skeleton lines up with the real page. */
export const SETTINGS_BODY_CLASS = 'flex-1 overflow-auto p-4 pt-0'
export const SETTINGS_TAB_LIST_CLASS =
  'mb-4 flex h-auto w-full flex-nowrap gap-1 overflow-x-auto p-1 md:grid md:grid-cols-6'

const routeApi = getRouteApi('/_app/settings/')

/** The Settings page: a tab strip whose open tab lives in the URL (`?tab=`). */
export function SettingsPage() {
  const { tab = 'profile' } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()

  const openTab = (value: string) =>
    void navigate({
      search: { tab: value === 'profile' ? undefined : (value as SettingsTab) },
      replace: true,
    })

  return (
    <SidebarInset>
      <PageHeader title="Settings" />
      <div className={SETTINGS_BODY_CLASS}>
        <Tabs value={tab} onValueChange={openTab}>
          <TabsList className={SETTINGS_TAB_LIST_CLASS}>
            {SETTINGS_TABS.map(({ id, label }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="shrink-0 py-1.5 text-xs md:text-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
          <TabsContent value="providers">
            <ProvidersSection />
          </TabsContent>
          <TabsContent value="auth">
            <AuthMethodsSection />
          </TabsContent>
          <TabsContent value="2fa">
            <TwoFactorSection />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSection />
          </TabsContent>
          <TabsContent value="sessions">
            <TinySessionsSection />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
