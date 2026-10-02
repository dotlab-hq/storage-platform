import * as React from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { currentUserQuery } from '@/lib/auth/current-user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { toast } from '@/components/ui/sonner'
import { deviceErrorMessage } from '../-device-error'

/** Delay before leaving the page once the request was approved or denied. */
const REDIRECT_AFTER_APPROVE_MS = 3000
const REDIRECT_AFTER_DENY_MS = 1500

export const Route = createFileRoute('/device/approve/')({
  validateSearch: z.object({
    user_code: z.string().optional(),
  }),
  // Runs on SSR and client navigation, so the user is known before render.
  beforeLoad: async ({ context: { queryClient }, location }) => {
    const user = await queryClient.ensureQueryData(currentUserQuery())
    if (!user) {
      throw redirect({ to: '/auth', search: { redirect: location.href } })
    }
  },
  component: DeviceApprovePage,
})

/** Lets the signed-in user approve or deny a device's authorization request. */
function DeviceApprovePage() {
  const { user_code: userCode = '' } = Route.useSearch()
  const navigate = Route.useNavigate()

  const approve = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.device.approve({ userCode })
      if (error)
        throw new Error(deviceErrorMessage(error, 'Failed to approve device'))
    },
    onSuccess: () => toast.success('Device approved successfully!'),
    onError: (error) => toast.error(error.message),
  })

  const deny = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.device.deny({ userCode })
      if (error)
        throw new Error(deviceErrorMessage(error, 'Failed to deny device'))
    },
    onSuccess: () => toast.success('Device access denied.'),
    onError: (error) => toast.error(error.message),
  })

  const finished = approve.isSuccess || deny.isSuccess
  const busy = approve.isPending || deny.isPending

  React.useEffect(() => {
    if (!finished) return
    const delay = approve.isSuccess
      ? REDIRECT_AFTER_APPROVE_MS
      : REDIRECT_AFTER_DENY_MS
    const timer = setTimeout(() => void navigate({ to: '/' }), delay)
    return () => clearTimeout(timer)
  }, [finished, approve.isSuccess, navigate])

  useHotkey('A', () => approve.mutate(), { enabled: !finished && !busy })
  useHotkey('D', () => deny.mutate(), { enabled: !finished && !busy })

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-xl font-semibold">Approve Device</h1>
        <p className="text-muted-foreground text-sm">
          Review the device authorization request.
        </p>
        <div className="text-sm">
          <p>
            <span className="font-medium">User Code:</span>{' '}
            <span className="font-mono">{userCode}</span>
          </p>
        </div>
        {approve.isSuccess ? (
          <p className="text-green-600">
            Device approved! You can close this page or you will be redirected.
          </p>
        ) : deny.isSuccess ? (
          <p className="text-muted-foreground text-sm">
            Device access denied. Redirecting...
          </p>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={() => approve.mutate()}
              disabled={busy}
              className="flex-1"
            >
              {approve.isPending ? 'Approving...' : 'Approve'}
              <KeyboardShortcut keys="A" className="ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => deny.mutate()}
              disabled={busy}
              className="flex-1"
            >
              {deny.isPending ? 'Denying...' : 'Deny'}
              <KeyboardShortcut keys="D" className="ml-2" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
