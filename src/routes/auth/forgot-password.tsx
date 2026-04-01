import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestPasswordResetFn } from "./-auth-server"

export const Route = createFileRoute( "/auth/forgot-password" )( {
  component: ForgotPasswordPage,
} )

function ForgotPasswordPage() {
  const [email, setEmail] = useState( "" )
  const [isSubmitting, setIsSubmitting] = useState( false )

  const requestReset = async () => {
    setIsSubmitting( true )
    try {
      await requestPasswordResetFn( { data: { email } } )
      toast.success( "If your email exists, a reset link has been sent." )
    } catch ( error ) {
      toast.error( error instanceof Error ? error.message : "Could not request password reset." )
    } finally {
      setIsSubmitting( false )
    }
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Forgot password</h1>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={( event ) => setEmail( event.target.value )} />
        </div>
        <Button className="w-full" disabled={isSubmitting} onClick={() => void requestReset()}>
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>
        <Link to="/auth/login" className="text-primary block text-center text-sm">Back to login</Link>
      </div>
    </div>
  )
}
