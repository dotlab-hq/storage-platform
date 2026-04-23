import { useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettings, useSettingsStore } from '../-store'

// Dynamically load server functions
async function loadEnableTwoFactorSettingsFn() {
  const mod = await import('../-settings-server')
  return mod.enableTwoFactorSettingsFn
}

async function loadVerifyTwoFactorSettingsFn() {
  const mod = await import('../-settings-server')
  return mod.verifyTwoFactorSettingsFn
}

async function loadDisableTwoFactorSettingsFn() {
  const mod = await import('../-settings-server')
  return mod.disableTwoFactorSettingsFn
}

export function TwoFactorSection() {
  const [twoFactorPassword, setTwoFactorPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')

  const twoFactorEnabled = useSettingsStore((state) => state.twoFactorEnabled)
  const isUpdating2FA = useSettingsStore((state) => state.isUpdating2FA)
  const backupCodes = useSettingsStore((state) => state.backupCodes)

  const enable2FA = async () => {
    const previous = twoFactorEnabled
    updateSettings({ isUpdating2FA: true, twoFactorEnabled: true })
    try {
      const fn = await loadEnableTwoFactorSettingsFn()
      const result = await fn({
        data: { password: twoFactorPassword },
      })
      updateSettings({ backupCodes: result.backupCodes })
      toast.success('Scan QR from your authenticator, then verify code below.')
    } catch (error) {
      updateSettings({ twoFactorEnabled: previous })
      toast.error(
        error instanceof Error ? error.message : 'Failed to enable 2FA.',
      )
    } finally {
      updateSettings({ isUpdating2FA: false })
    }
  }

  const verify2FA = async () => {
    updateSettings({ isUpdating2FA: true })
    try {
      const fn = await loadVerifyTwoFactorSettingsFn()
      await fn({ data: { code: totpCode } })
      setTotpCode('')
      toast.success('2FA verified.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to verify 2FA code.',
      )
    } finally {
      updateSettings({ isUpdating2FA: false })
    }
  }

  const disable2FA = async () => {
    const previous = twoFactorEnabled
    updateSettings({ isUpdating2FA: true, twoFactorEnabled: false })
    try {
      const fn = await loadDisableTwoFactorSettingsFn()
      await fn({
        data: { password: twoFactorPassword },
      })
      updateSettings({ backupCodes: [] })
      toast.success('2FA disabled.')
    } catch (error) {
      updateSettings({ twoFactorEnabled: previous })
      toast.error(
        error instanceof Error ? error.message : 'Failed to disable 2FA.',
      )
    } finally {
      updateSettings({ isUpdating2FA: false })
    }
  }

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <h2 className="text-base font-semibold">Two-Factor Authentication</h2>
      <div className="space-y-1">
        <Label>Account password</Label>
        <Input
          type="password"
          value={twoFactorPassword}
          onChange={(e) => setTwoFactorPassword(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          disabled={isUpdating2FA || twoFactorEnabled}
          onClick={() => void enable2FA()}
        >
          Enable 2FA
        </Button>
        <Button
          variant="outline"
          disabled={isUpdating2FA || !twoFactorEnabled}
          onClick={() => void disable2FA()}
        >
          Disable 2FA
        </Button>
      </div>
      <div className="space-y-1">
        <Label>Authenticator code</Label>
        <Input value={totpCode} onChange={(e) => setTotpCode(e.target.value)} />
      </div>
      <Button
        variant="outline"
        disabled={isUpdating2FA || !twoFactorEnabled}
        onClick={() => void verify2FA()}
      >
        Verify code
      </Button>
      {backupCodes.length > 0 && (
        <div className="rounded-md bg-muted p-3 text-xs">
          Backup codes: {backupCodes.join(', ')}
        </div>
      )}
    </section>
  )
}
