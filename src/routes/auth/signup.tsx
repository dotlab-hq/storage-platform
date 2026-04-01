import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signupWithPasswordFn } from "./-auth-server"

export const Route = createFileRoute( "/auth/signup" )( {
  component: SignupPage,
} )

function SignupPage() {
  const [name, setName] = useState( "" )
  const [email, setEmail] = useState( "" )
  const [password, setPassword] = useState( "" )
  const [isSubmitting, setIsSubmitting] = useState( false )

  const signup = async () => {
    setIsSubmitting( true )
    try {
      await signupWithPasswordFn( { data: { name, email, password } } )
      toast.success( "Account created. You can now log in." )
      setPassword( "" )
    } catch ( error ) {
      toast.error( error instanceof Error ? error.message : "Signup failed." )
    } finally {
      setIsSubmitting( false )
    }
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <div className="space-y-2">
          <Label>Name</Label>
          <Input value={name} onChange={( event ) => setName( event.target.value )} />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={( event ) => setEmail( event.target.value )} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={password} onChange={( event ) => setPassword( event.target.value )} />
        </div>
        <Button className="w-full" disabled={isSubmitting} onClick={() => void signup()}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
        <Link to="/auth/login" className="text-primary block text-center text-sm">Back to login</Link>
      </div>
    </div>
  )
}
