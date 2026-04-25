import { createFileRoute, redirect, useSearch } from '@tanstack/react-router'
import * as React from 'react'
import { useAuth } from '@/lib/auth-client'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useMutation } from '@tanstack/react-query'
import { Activity } from '@/components/ui/activity'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { toast } from '@/components/ui/sonner'
import { isAuthenticatedMiddleware } from '@/middlewares/isAuthenticated'

export const Route = createFileRoute( '/device/approve/' )( {
  component: DeviceApprovePage,
  server: {
    middleware: [isAuthenticatedMiddleware],
  },
} )

function DeviceApprovePage() {
  const search = useSearch( { from: '/device/approve' } )
  const userCode = ( search.user_code as string ) || ''
  const auth = useAuth()
  const [approved, setApproved] = React.useState( false )

  const approveMutation = useMutation( {
    mutationFn: async () => {
      await auth.device.approve( { userCode } )
    },
    onSuccess: () => {
      toast.success( 'Device approved successfully!' )
      setApproved( true )
    },
    onError: ( err: any ) => {
      toast.error( err.message || 'Failed to approve device' )
    },
  } )

  const denyMutation = useMutation( {
    mutationFn: async () => {
      await auth.device.deny( { userCode } )
    },
    onSuccess: () => {
      toast.success( 'Device access denied.' )
      // Redirect after short delay
      setTimeout( () => {
        window.location.href = '/'
      }, 1500 )
    },
    onError: ( error: unknown ) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to deny device',
      )
    },
  } )

  useHotkey(
    'A',
    () => {
      if ( !approved && !approveMutation.isPending ) {
        approveMutation.mutate()
      }
    },
    { enabled: auth.user !== null && !approved },
  )

  useHotkey(
    'D',
    () => {
      if ( !approved && !denyMutation.isPending ) {
        denyMutation.mutate()
      }
    },
    { enabled: auth.user !== null && !approved },
  )

  if ( !auth.user ) {
    // Should be handled by middleware, but just in case
    throw redirect( {
      to: '/auth',
      search: { redirect: `/device/approve?user_code=${userCode}` },
    } )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 space-y-4">
        <h1 className="text-xl font-semibold">Approve Device</h1>
        <p className="text-sm text-muted-foreground">
          Review the device authorization request.
        </p>
        <div className="text-sm">
          <p>
            <span className="font-medium">User Code:</span>{' '}
            <span className="font-mono">{userCode}</span>
          </p>
        </div>
        <Activity
          when={approved}
          fallback={
            <div className="flex gap-2">
              <Button
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
                className="flex-1"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
                <KeyboardShortcut keys="A" className="ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => denyMutation.mutate()}
                disabled={denyMutation.isPending}
                className="flex-1"
              >
                {denyMutation.isPending ? 'Denying...' : 'Deny'}
                <KeyboardShortcut keys="D" className="ml-2" />
              </Button>
            </div>
          }
        >
          <p className="text-green-600">
            Device approved! You can close this page or you will be redirected.
            <meta httpEquiv="refresh" content="3;url=/" />
          </p>
        </Activity>
      </Card>
    </div>
  )
}
