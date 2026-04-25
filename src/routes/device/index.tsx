import { useMutation } from '@tanstack/react-query'
import { useHotkey } from '@tanstack/react-hotkeys'
import { createFileRoute, useSearch } from '@tanstack/react-router'
import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-client'
import { Activity } from '@/components/ui/activity'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { Label } from '@/components/ui/label'

export const Route = createFileRoute('/device/')({
  component: DevicePage,
})

type DeviceCodeInfo = {
  user_code: string
  client_id?: string
  scope?: string
  expires_in?: number
}

function DevicePage() {
  const formRef = React.useRef<HTMLFormElement>(null)
  const search = useSearch({ from: '/device' })
  const auth = useAuth()
  const [userCode, setUserCode] = React.useState('')
  const [optimisticCode, setOptimisticCode] = React.useOptimistic('')
  const [codeInfo, setCodeInfo] = React.useState<DeviceCodeInfo | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const result = await auth.device({
        query: { user_code: code },
      })

      if (result.error) {
        const description =
          'error_description' in result.error &&
          typeof result.error.error_description === 'string'
            ? result.error.error_description
            : null
        throw new Error(description || result.error.message || 'Invalid code')
      }

      return result.data ?? null
    },
    onSuccess: (data) => {
      setCodeInfo(data)
      setError(null)
    },
    onError: (mutationError) => {
      setError(mutationError.message)
    },
  })

  const verifyCode = React.useEffectEvent((code: string) => {
    setOptimisticCode(code)
    void verifyMutation.mutateAsync(code)
  })

  React.useEffect(() => {
    const code = typeof search.user_code === 'string' ? search.user_code : ''
    if (!code) {
      return
    }

    setUserCode(code)
    verifyCode(code)
  }, [search.user_code, verifyCode])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = userCode.trim()
    if (!trimmed) {
      return
    }

    verifyCode(trimmed)
  }

  const goToApprove = React.useEffectEvent(() => {
    const code =
      typeof search.user_code === 'string' && search.user_code.length > 0
        ? search.user_code
        : userCode

    window.location.href = `/device/approve?user_code=${encodeURIComponent(code)}`
  })

  useHotkey(
    'Enter',
    () => {
      formRef.current?.requestSubmit()
    },
    { enabled: codeInfo === null },
  )

  useHotkey('Escape', () => setError(null), { enabled: Boolean(error) })

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-xl font-semibold">Device Authorization</h1>
        <p className="text-sm text-muted-foreground">
          Enter the user code from your device to authorize it.
        </p>

        <Activity when={Boolean(error)}>
          <p className="text-sm text-red-500">{error}</p>
        </Activity>

        <Activity
          when={codeInfo !== null}
          fallback={
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">User Code</Label>
                <Input
                  id="code"
                  value={userCode}
                  onChange={(event) => {
                    setUserCode(event.target.value)
                    setOptimisticCode(event.target.value)
                  }}
                  placeholder="e.g., ABCD-1234"
                  maxLength={12}
                  disabled={verifyMutation.isPending}
                />
                <Activity when={optimisticCode.trim().length > 0}>
                  <p className="text-muted-foreground text-xs">
                    Ready to verify{' '}
                    <span className="font-mono">{optimisticCode}</span>
                  </p>
                </Activity>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                <Activity
                  when={verifyMutation.isPending}
                  fallback={
                    <>
                      Verify Code
                      <KeyboardShortcut keys="Enter" className="ml-2" />
                    </>
                  }
                >
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                </Activity>
              </Button>
            </form>
          }
        >
          <div className="space-y-4">
            <p>Device is requesting access with the following details:</p>
            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">Code:</span>{' '}
                <span className="font-mono">{codeInfo?.user_code}</span>
              </p>
              <Activity when={Boolean(codeInfo?.client_id)}>
                <p>
                  <span className="font-medium">Client ID:</span>{' '}
                  {codeInfo?.client_id}
                </p>
              </Activity>
              <Activity when={Boolean(codeInfo?.scope)}>
                <p>
                  <span className="font-medium">Scope:</span> {codeInfo?.scope}
                </p>
              </Activity>
            </div>
            <Activity
              when={Boolean(auth.user)}
              fallback={
                <Button asChild className="w-full">
                  <a
                    href={`/auth?redirect=/device/approve?user_code=${encodeURIComponent(
                      codeInfo?.user_code ?? '',
                    )}`}
                  >
                    Log in to Approve
                  </a>
                </Button>
              }
            >
              <Button onClick={goToApprove} className="w-full">
                Continue to Approve
              </Button>
            </Activity>
          </div>
        </Activity>
      </Card>
    </div>
  )
}
