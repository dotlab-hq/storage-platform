import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { AlertTriangle, Key } from 'lucide-react'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { verifyTwoFactorSettingsFn } from './settings-auth'

/** Secrets returned when 2FA setup starts; shown once, never cached. */
export type PendingTwoFactorSetup = {
  qrDataUrl: string
  backupCodes: string[]
}

type TwoFactorSetupProps = {
  setup: PendingTwoFactorSetup
  onVerified: () => void
  onCancel: () => void
}

/** Second 2FA step: scan the QR code, save backup codes, verify a code. */
export function TwoFactorSetup({
  setup,
  onVerified,
  onCancel,
}: TwoFactorSetupProps) {
  const [code, setCode] = useState('')

  const verify = useMutation({
    mutationFn: () => verifyTwoFactorSettingsFn({ data: { code } }),
    onSuccess: () => {
      toast.success('2FA verified and enabled.')
      onVerified()
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to verify 2FA code.',
      )
    },
  })

  const canVerify = !verify.isPending && code.trim().length === 6
  const submit = () => {
    if (canVerify) verify.mutate()
  }

  useHotkey('Mod+Enter', submit, { enabled: canVerify })

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
            <Key className="text-primary size-4" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Verify Authenticator</h3>
            <p className="text-muted-foreground text-sm">
              Scan the code with your authenticator app, then enter the 6-digit
              code it shows
            </p>
          </div>
        </div>
        <img
          src={setup.qrDataUrl}
          alt="Two-factor authentication QR code"
          className="size-44 rounded-lg border bg-white p-2"
        />
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="totp-code">Authenticator Code</Label>
            <Input
              id="totp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={verify.isPending}
          >
            Cancel
          </Button>
          <Button variant="outline" disabled={!canVerify} onClick={submit}>
            Verify
            <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
          </Button>
        </div>
      </div>

      {setup.backupCodes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-500 size-4" />
            <span className="text-sm font-medium">Backup Codes</span>
            <span className="text-muted-foreground text-xs">
              (Save these securely - they can only be used once)
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-2 rounded-xl border bg-card p-4 font-mono text-sm sm:grid-cols-4">
            {setup.backupCodes.map((backupCode) => (
              <li key={backupCode}>{backupCode}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
