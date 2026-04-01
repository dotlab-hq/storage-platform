import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPasswordFn } from "./-auth-server"

export const Route = createFileRoute( "/auth/reset-password" )( {
  component: ResetPasswordPage,
  validateSearch: ( search: Record<string, unknown> ) => ( {
    token: typeof search.token === "string" ? search.token : "",
  } ),
} )

function ResetPasswordPage() {
  const search = Route.useSearch()
  const [token, setToken] = useState( search.token )
  const [newPassword, setNewPassword] = useState( "" )
  const [isSubmitting, setIsSubmitting] = useState( false )

  const reset = async () => {
    setIsSubmitting( true )
    try {
      await resetPasswordFn( { data: { token, newPassword } } )
      toast.success( "Password reset successfully." )
      setNewPassword( "" )
    } catch ( error ) {
      toast.error( error instanceof Error ? error.message : "Password reset failed." )
    } finally {
      setIsSubmitting( false )
    }
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <div className="space-y-2">
          <Label htmlFor="reset-token">Reset token</Label>
          <Input id="reset-token" type="text" value={token} onChange={( event ) => setToken( event.target.value )} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-new-password">New password</Label>
          <Input
            id="reset-new-password"
            type="password"
            value={newPassword}
            onChange={( event ) => setNewPassword( event.target.value )}
          />
        </div>
        <Button className="w-full" disabled={isSubmitting} onClick={() => void reset()}>
          {isSubmitting ? "Resetting..." : "Reset password"}
        </Button>
        <Link to="/auth/login" className="text-primary block text-center text-sm">Back to login</Link>
      </div>
    </div>
  )
}
