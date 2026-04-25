import { createFileRoute } from '@tanstack/react-router'
import { createFileRoute, useSearch, redirect } from '@tanstack/react-start'
import * as React from 'react'
import { useAuth } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/sonner'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/device/')({
  component: DevicePage,
})

function DevicePage() {
  const search = useSearch({ from: '/device' })
  const auth = useAuth()
  const [userCode, setUserCode] = React.useState('')
  const [codeInfo, setCodeInfo] = React.useState<{
    user_code: string
    client_id?: string
    scope?: string
    expires_in?: number
  } | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  // If user_code in URL, verify immediately
  React.useEffect(() => {
    const code = (search.user_code as string) || ''
    if (code) {
      setUserCode(code)
      verifyCode(code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.user_code])

  const verifyCode = async (code: string) => {
    setLoading(true)
    try {
      const result = await auth.device({
        query: { user_code: code },
      })
      if (result.error) {
        throw new Error(
          result.error_description || result.error || 'Invalid code',
        )
      }
      if (result.data) {
        setCodeInfo(result.data)
        setError(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userCode.trim()) return
    verifyCode(userCode.trim())
  }

  const goToApprove = () => {
    const code = search.user_code || userCode
    window.location.href = `/device/approve?user_code=${encodeURIComponent(code)}`
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold">Device Authorization</h1>
        <p className="text-sm text-muted-foreground">
          Enter the user code from your device to authorize it.
        </p>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {codeInfo ? (
          <div className="space-y-4">
            <p>Device is requesting access with the following details:</p>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Code:</span>{' '}
                <span className="font-mono">{codeInfo.user_code}</span>
              </p>
              {codeInfo.client_id && (
                <p>
                  <span className="font-medium">Client ID:</span>{' '}
                  {codeInfo.client_id}
                </p>
              )}
              {codeInfo.scope && (
                <p>
                  <span className="font-medium">Scope:</span> {codeInfo.scope}
                </p>
              )}
            </div>
            {auth.user ? (
              <Button onClick={goToApprove} className="w-full">
                Continue to Approve
              </Button>
            ) : (
              <Button asChild className="w-full">
                <a
                  href={`/auth?redirect=/device/approve?user_code=${encodeURIComponent(
                    codeInfo.user_code,
                  )}`}
                >
                  Log in to Approve
                </a>
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">User Code</Label>
              <Input
                id="code"
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                placeholder="e.g., ABCD-1234"
                maxLength={12}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
