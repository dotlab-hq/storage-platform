import { StoneIcon } from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { createClientOnlyFn } from "@tanstack/react-start";

export function AuthForm( {
  className,
  ...props
}: React.ComponentProps<"div"> ) {
  const callGithubOauth = createClientOnlyFn(async () => {
    const data = await authClient.signIn.social( {
      provider: "github",
    } )

    if ( data.error ) {
      throw new Error( data.error.message )
    }

    if ( !data.data?.url ) {
      throw new Error( "GitHub OAuth URL was not returned" )
    }

    window.location.href = data.data.url
  })

  return (
    <div className={cn( "flex flex-col gap-6", className )} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <StoneIcon className="size-6" />
              </div>
              <span className="sr-only">DOT.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to DOT. Storage</h1>
            <Field className="">
              <Button variant="outline" type="button" onClick={callGithubOauth}>
                <FaGithub className="size-4" />
                Continue with GitHub
              </Button>
            </Field>
          </div>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center hidden">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
