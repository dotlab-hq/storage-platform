'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface OptimisticActionState {
  isPending: boolean
  isSuccess: boolean
  error: string | null
}

interface OptimisticActionConfig<T> {
  onMutate?: (variables: T) => void
  onError?: (error: Error, variables: T) => void
  onSuccess?: (data: unknown, variables: T) => void
}

export function useOptimisticAction<T>(config?: OptimisticActionConfig<T>) {
  const [state, setState] = useState<OptimisticActionState>({
    isPending: false,
    isSuccess: false,
    error: null,
  })

  const pending = () => {
    setState({ isPending: true, isSuccess: false, error: null })
  }

  const success = (data: unknown, variables: T) => {
    setState({ isPending: false, isSuccess: true, error: null })
    config?.onSuccess?.(data, variables)
    setTimeout(() => setState((prev) => ({ ...prev, isSuccess: false })), 2000)
  }

  const error = (err: Error, variables: T) => {
    setState({ isPending: false, isSuccess: false, error: err.message })
    config?.onError?.(err, variables)
  }

  const reset = () => {
    setState({ isPending: false, isSuccess: false, error: null })
  }

  return { state, pending, success, error, reset }
}

interface ActionStatusProps {
  isPending: boolean
  isSuccess?: boolean
  error?: string | null
  successLabel?: string
  pendingLabel?: string
  className?: string
}

export function ActionStatus(props: ActionStatusProps) {
  const {
    isPending,
    isSuccess = false,
    error = null,
    successLabel = 'Saved',
    pendingLabel = 'Saving...',
    className = '',
  } = props

  if (isPending) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{pendingLabel}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-destructive ${className}`}
      >
        <span>{error}</span>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 ${className}`}
      >
        <span>{successLabel}</span>
      </div>
    )
  }

  return null
}

interface InlineActionButtonProps {
  onClick: () => void
  isPending: boolean
  isSuccess?: boolean
  error?: string | null
  disabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'icon'
  className?: string
  children: React.ReactNode
}

export function InlineActionButton(props: InlineActionButtonProps) {
  const {
    onClick,
    isPending,
    isSuccess = false,
    error = null,
    disabled = false,
    variant = 'default',
    className = '',
    children,
  } = props

  const baseClasses = 'inline-flex items-center justify-center transition-all'
  const variantClasses = {
    default: '',
    outline: 'border border-input bg-background hover:bg-accent',
    ghost: 'hover:bg-accent',
  }

  const stateClasses = isPending
    ? 'opacity-60 cursor-wait'
    : error
      ? 'border-destructive text-destructive'
      : isSuccess
        ? 'text-green-600 dark:text-green-400'
        : ''

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isPending}
      className={`${baseClasses} ${variantClasses[variant]} ${stateClasses} ${className}`}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}
