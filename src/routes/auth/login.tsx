import { useState } from "react"
import { Link, createFileRoute } from "@tanstack/react-router"
import { FaGithub } from "react-icons/fa"
import { toast } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { loginWithPasswordFn } from "./-auth-server"

export const Route = createFileRoute( "/auth/login" )( {
  component: LoginPage,
} )

function LoginPage() {
  const [email, setEmail] = useState( "" )
  const [password, setPassword] = useState( "" )
  const [isSubmitting, setIsSubmitting] = useState( false )

  const signInWithGithub = async () => {
    setIsSubmitting( true )
    try {
      const response = await authClient.signIn.social( { provider: "github" } )
      if ( response.error ) throw new Error( response.error.message )
      if ( response.data.url ) window.location.href = response.data.url
      else throw new Error( "GitHub login URL was not returned." )
    } catch ( error ) {
      toast.error( error instanceof Error ? error.message : "Failed to start GitHub login." )
    } finally {
      setIsSubmitting( false )
    }
  }

  const login = async () => {
    setIsSubmitting( true )
    try {
      await loginWithPasswordFn( { data: { email, password } } )
      toast.success( "Welcome back!" )
      setPassword( "" )
    } catch ( error ) {
      toast.error( error instanceof Error ? error.message : "Login failed." )
    } finally {
      setIsSubmitting( false )
    }
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <div className="space-y-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" type="email" value={email} onChange={( event ) => setEmail( event.target.value )} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password">Password</Label>
          <Input id="login-password" type="password" value={password} onChange={( event ) => setPassword( event.target.value )} />
        </div>
        <Button className="w-full" disabled={isSubmitting} onClick={() => void login()}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <Button className="w-full" variant="outline" disabled={isSubmitting} onClick={() => void signInWithGithub()}>
          <FaGithub className="size-4" />
          Continue with GitHub
        </Button>
        <div className="flex justify-between text-sm">
          <Link to="/auth/signup" className="text-primary">Create account</Link>
          <Link to="/auth/forgot-password" className="text-primary">Forgot password?</Link>
        </div>
      </div>
    </div>
  )
}
