import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import { createClientOnlyFn } from '@tanstack/react-start'
import { StoneIcon } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut'
import { authClient } from '@/lib/auth-client'

export function AuthForm({ className, ...props }: React.ComponentProps<'div'>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [optimisticStatus, setOptimisticStatus] = React.useOptimistic<
    'idle' | 'submitting'
  >('idle')

  const callGithubOauth = createClientOnlyFn(async () => {
    const data = await authClient.signIn.social({
      provider: 'github',
    })

    if (data.error) {
      throw new Error(data.error.message)
    }

    if (!data.data?.url) {
      throw new Error('GitHub OAuth URL was not returned')
    }

    window.location.href = data.data.url
  })

  const githubMutation = useMutation({
    mutationFn: async () => {
      setOptimisticStatus('submitting')
      await callGithubOauth()
    },
  })

  const submitGithub = React.useEffectEvent(() => {
    void githubMutation.mutateAsync()
  })

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') {
        return
      }

      if (!event.ctrlKey && !event.metaKey) {
        return
      }

      event.preventDefault()

      if (!githubMutation.isPending) {
        submitGithub()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [githubMutation.isPending, submitGithub])

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col gap-6', className)}
      tabIndex={-1}
      {...props}
    >
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
              <Button
                variant="outline"
                type="button"
                onClick={submitGithub}
                disabled={githubMutation.isPending}
              >
                <FaGithub className="size-4" />
                {githubMutation.isPending || optimisticStatus === 'submitting'
                  ? 'Opening GitHub...'
                  : 'Continue with GitHub'}
                <KeyboardShortcut keys="Mod+Enter" className="ml-2" />
              </Button>
            </Field>
          </div>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center hidden">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{' '}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
