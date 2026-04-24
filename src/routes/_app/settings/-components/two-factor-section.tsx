'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSettings, useSettingsStore } from '../-store'
import { Shield, Key, AlertTriangle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  enableTwoFactorSettingsFn,
  verifyTwoFactorSettingsFn,
  disableTwoFactorSettingsFn,
} from '../-settings-server'

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
      const result = await enableTwoFactorSettingsFn({
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
      await verifyTwoFactorSettingsFn({ data: { code: totpCode } })
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
      await disableTwoFactorSettingsFn({
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
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-background via-background to-muted/30 p-6 shadow-sm">
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
        {/* Status Card */}
        <div className="flex items-center justify-between rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div
              className={`size-3 rounded-full ${
                twoFactorEnabled ? 'bg-green-500' : 'bg-amber-500'
              }`}
            />
            <span className="font-medium">
              {twoFactorEnabled ? 'Protected' : 'Not Protected'}
            </span>
          </div>
          {twoFactorEnabled ? (
            <Button
              variant="destructive"
              size="sm"
              disabled={isUpdating2FA}
              onClick={() => void disable2FA()}
            >
              Disable 2FA
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={isUpdating2FA}
              onClick={() => void enable2FA()}
            >
              Enable 2FA
            </Button>
          )}
        </div>

        {/* Action Area */}
        {!twoFactorEnabled ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Password</Label>
              <Input
                type="password"
                value={twoFactorPassword}
                onChange={(e) => setTwoFactorPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <Button
              onClick={() => void enable2FA()}
              disabled={!twoFactorPassword}
            >
              Enable Two-Factor Authentication
            </Button>
            <p className="text-muted-foreground text-xs">
              You'll need to enter a verification code from your authenticator
              app each time you sign in.
            </p>
          </div>
        ) : (
          <>
            {/* Verify Code */}
            <div className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                  <Key className="text-primary size-4" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Verify Authenticator</h3>
                  <p className="text-muted-foreground text-sm">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Authenticator Code</Label>
                  <Input
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={isUpdating2FA || !totpCode || totpCode.length < 6}
                  onClick={() => void verify2FA()}
                >
                  Verify
                </Button>
              </div>
            </div>

            {/* Backup Codes Table */}
            {backupCodes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-500 size-4" />
                  <span className="text-sm font-medium">Backup Codes</span>
                  <span className="text-muted-foreground text-xs">
                    (Save these securely - they can only be used once)
                  </span>
                </div>
                <div className="rounded-xl border bg-card overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backupCodes.map((code, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-mono text-sm">
                            {code}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground inline-flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              Unused
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
