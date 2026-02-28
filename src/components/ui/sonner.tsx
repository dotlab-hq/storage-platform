"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
    return (
        <SonnerToaster
            position="bottom-right"
            toastOptions={{
                className:
                    "bg-background text-foreground border-border shadow-lg rounded-lg",
                duration: 4000,
            }}
            closeButton
            richColors
        />
    )
}

export { toast } from "sonner"
