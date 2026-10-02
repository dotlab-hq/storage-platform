import { useState } from 'react'
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import * as QRCode from 'qrcode'
import { Shield } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import {
  disableTwoFactorSettingsFn,
  enableTwoFactorSettingsFn,
} from './settings-auth'
import {
  refreshSettings,
  settingsQuery,
  updateSettingsSnapshot,
} from './settings-query'
import { TwoFactorSetup } from './two-factor-setup'
import type { PendingTwoFactorSetup } from './two-factor-setup'

/**
 * Enables (password -> scan QR -> verify code) or disables two-factor auth.
 * 2FA only counts as enabled once the server reports it, i.e. after the
 * code is verified. The setup secrets live in component state, so they are
 * gone as soon as the user leaves the tab.
 */
export function TwoFactorSection() {
  const queryClient = useQueryClient()
  const { data: settings } = useSuspenseQuery(settingsQuery())
  const twoFactorEnabled = settings.security.twoFactorEnabled
  const [password, setPassword] = useState('')
  const [setup, setSetup] = useState<PendingTwoFactorSetup | null>(null)

  const setEnabled = (enabled: boolean) =>
    updateSettingsSnapshot(queryClient, (snapshot) => ({
      ...snapshot,
      security: { ...snapshot.security, twoFactorEnabled: enabled },
    }))

  const enable = useMutation({
    mutationFn: async (): Promise<PendingTwoFactorSetup> => {
      const result = await enableTwoFactorSettingsFn({ data: { password } })
      const qrDataUrl = await QRCode.toDataURL(result.totpURI, { margin: 1 })
      return { backupCodes: result.backupCodes, qrDataUrl }
    },
    onSuccess: (pending) => {
      setPassword('')
      setSetup(pending)
      toast.success('Scan the QR code with your authenticator, then verify.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to enable 2FA.',
      )
    },
  })

  const disable = useMutation({
    mutationFn: () => disableTwoFactorSettingsFn({ data: { password } }),
    onSuccess: () => {
      setPassword('')
      setEnabled(false)
      toast.success('2FA disabled.')
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to disable 2FA.',
      )
    },
    onSettled: () => refreshSettings(queryClient),
  })

  const handleVerified = () => {
    setSetup(null)
    setEnabled(true)
    void refreshSettings(queryClient)
  }

  const isBusy = enable.isPending || disable.isPending
  const canSubmitPassword = !isBusy && password.trim().length >= 8
  const submitPassword = () => {
    if (!canSubmitPassword) return
    if (twoFactorEnabled) disable.mutate()
    else enable.mutate()
  }

  useHotkey('Mod+Enter', submitPassword, {
    enabled: canSubmitPassword && !setup,
  })

  return (
    <section className="overflow-hidden rounded-2xl bg-linear-to-br from-background via-background to-muted/30 p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
          <Shield className="text-primary size-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
          <p className="text-muted-foreground text-sm">
            {twoFactorEnabled
              ? '2FA is enabled'
              : 'Add an extra layer of security'}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
          <div
            className={`size-3 rounded-full ${
              twoFactorEnabled ? 'bg-green-500' : 'bg-amber-500'
            }`}
          />
          <span className="font-medium">
            {twoFactorEnabled ? 'Protected' : 'Not Protected'}
          </span>
        </div>

        {setup ? (
          <TwoFactorSetup
            setup={setup}
            onVerified={handleVerified}
            onCancel={() => setSetup(null)}
          />
        ) : (
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="two-factor-password"
                className="text-sm font-medium"
              >
                Account Password
              </Label>
              <Input
                id="two-factor-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button
              variant={twoFactorEnabled ? 'destructive' : 'default'}
              onClick={submitPassword}
              disabled={!canSubmitPassword}
            >
              {twoFactorEnabled
                ? 'Disable Two-Factor Authentication'
                : 'Enable Two-Factor Authentication'}
              <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
            </Button>
            {!twoFactorEnabled && (
              <p className="text-muted-foreground text-xs">
                You'll need to enter a verification code from your authenticator
                app each time you sign in.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
