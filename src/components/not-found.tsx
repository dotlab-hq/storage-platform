import { useRouter } from "@tanstack/react-router"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
    const router = useRouter()

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md text-center">
                <div className="bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
                    <FileQuestion className="text-muted-foreground h-8 w-8" />
                </div>

                <h1 className="text-foreground mb-1 text-5xl font-extrabold tracking-tight">404</h1>
                <h2 className="text-foreground mb-2 text-lg font-semibold">Page not found</h2>
                <p className="text-muted-foreground mb-8 text-sm">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <Button variant="outline" onClick={() => router.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button onClick={() => void router.navigate( { to: "/" } )}>
                        <Home className="mr-2 h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
