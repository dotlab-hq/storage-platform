import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'
import { authClient } from '@/lib/auth-client'
import { currentUserQuery } from '@/lib/auth/current-user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { Label } from '@/components/ui/label'
import { deviceErrorMessage } from './-device-error'

export const Route = createFileRoute('/device/')({
  validateSearch: z.object({
    user_code: z.string().optional(),
  }),
  // Anonymous visitors may check a code; signing in is only needed to approve.
  // Loading the user here means the first render already knows who it is.
  beforeLoad: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(currentUserQuery())
  },
  component: DevicePage,
})

type DeviceCodeInfo = {
  user_code: string
  client_id?: string
  scope?: string
}

/** Step 1 of the device flow: enter (or follow a link with) a code and check it. */
function DevicePage() {
  const formRef = React.useRef<HTMLFormElement>(null)
  const search = Route.useSearch()
  const { data: user } = useSuspenseQuery(currentUserQuery())
  const [userCode, setUserCode] = React.useState(search.user_code ?? '')

  const verify = useMutation({
    mutationFn: async (code: string): Promise<DeviceCodeInfo> => {
      const result = await authClient.device({ query: { user_code: code } })
      if (result.error) {
        throw new Error(deviceErrorMessage(result.error, 'Invalid code'))
      }
      return result.data
    },
  })
  const { mutate: verifyCode } = verify

  // A link like /device?user_code=ABCD-1234 is checked right away.
  React.useEffect(() => {
    if (search.user_code) verifyCode(search.user_code)
  }, [search.user_code, verifyCode])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = userCode.trim()
    if (trimmed) verifyCode(trimmed)
  }

  const codeInfo = verify.data ?? null

  useHotkey('Enter', () => formRef.current?.requestSubmit(), {
    enabled: codeInfo === null,
  })
  useHotkey('Escape', () => verify.reset(), {
    enabled: verify.isError,
    conflictBehavior: 'replace',
  })

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-xl font-semibold">Device Authorization</h1>
        <p className="text-muted-foreground text-sm">
          Enter the user code from your device to authorize it.
        </p>

        {verify.error && (
          <p className="text-sm text-red-500">{verify.error.message}</p>
        )}

        {codeInfo ? (
          <DeviceCodeDetails codeInfo={codeInfo} signedIn={user !== null} />
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">User Code</Label>
              <Input
                id="code"
                value={userCode}
                onChange={(event) => setUserCode(event.target.value)}
                placeholder="e.g., ABCD-1234"
                maxLength={12}
                disabled={verify.isPending}
              />
              {userCode.trim() && (
                <p className="text-muted-foreground text-xs">
                  Ready to verify{' '}
                  <span className="font-mono">{userCode.trim()}</span>
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={verify.isPending}
            >
              {verify.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <KeyboardShortcut keys="Enter" className="ml-2" />
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}

/** The verified request, plus the way forward (approve, or sign in first). */
function DeviceCodeDetails({
  codeInfo,
  signedIn,
}: {
  codeInfo: DeviceCodeInfo
  signedIn: boolean
}) {
  const approveSearch = { user_code: codeInfo.user_code }
  const approvePath = `/device/approve?user_code=${encodeURIComponent(codeInfo.user_code)}`

  return (
    <div className="space-y-4">
      <p>Device is requesting access with the following details:</p>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-medium">Code:</span>{' '}
          <span className="font-mono">{codeInfo.user_code}</span>
        </p>
        {codeInfo.client_id && (
          <p>
            <span className="font-medium">Client ID:</span> {codeInfo.client_id}
          </p>
        )}
        {codeInfo.scope && (
          <p>
            <span className="font-medium">Scope:</span> {codeInfo.scope}
          </p>
        )}
      </div>
      <Button asChild className="w-full">
        {signedIn ? (
          <Link to="/device/approve" search={approveSearch}>
            Continue to Approve
          </Link>
        ) : (
          <Link to="/auth" search={{ redirect: approvePath }}>
            Log in to Approve
          </Link>
        )}
      </Button>
    </div>
  )
}
