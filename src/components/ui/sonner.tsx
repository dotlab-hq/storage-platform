'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'

const toastConfig = {
  className: 'bg-background text-foreground border-border shadow-lg rounded-lg',
  duration: 3000,
  closeButton: true,
  richColors: true,
}

export function Toaster() {
  return <SonnerToaster position="bottom-right" toastOptions={toastConfig} />
}

export { toast } from 'sonner'

export function toastError(message: string) {
  toast.error(message, { ...toastConfig, duration: 6000 })
}

export function toastSuccess(message: string) {
  toast.success(message, { ...toastConfig, duration: 2000 })
}
