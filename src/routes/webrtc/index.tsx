'use client'

import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Wifi, WifiOff, Smartphone, RefreshCcw } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { AppSidebar } from '@/components/app-sidebar'
import { ScanQrDialog } from '@/components/qr/scan-qr-dialog'
import { SendFileDropZone } from '@/components/storage/send-file-drop-zone'
import { IncomingFilesRegion } from '@/components/storage/incoming-files-region'
import { useTinySession } from '@/hooks/use-tiny-session'
import { WebRTCProvider, useWebRTC } from '@/hooks/use-webrtc'
import type { IncomingFile } from '@/hooks/use-webrtc';

const WEBRTC_ENABLED_KEY = 'dot_webrtc_enabled'

type OfferResponse = {
    code: string
    pollKey: string
    payload: string
    expiresAt: string
    pollIntervalMs: number
}

export const Route = createFileRoute( '/webrtc/' )( {
    component: WebRTCRoute,
} )

function WebRTCRoute() {
    const tinySession = useTinySession()

    return (
        <WebRTCProvider
            sessionToken={
                tinySession.hasSession ? tinySession.token : null
            }
        >
            <WebRTCPage />
        </WebRTCProvider>
    )
}

function WebRTCPage() {
    const [webrtcEnabled, setWebrtcEnabled] = React.useState( false )
    const [qrImage, setQrImage] = React.useState( '' )
    const [offer, setOffer] = React.useState<OfferResponse | null>( null )
    const [stateMessage, setStateMessage] = React.useState(
        'Enable WebRTC transfers to get started.',
    )
    const [loading, setLoading] = React.useState( false )
    const [expired, setExpired] = React.useState( false )
    const [saveFileDialogOpen, setSaveFileDialogOpen] = React.useState( false )
    const [fileToSave, setFileToSave] = React.useState<IncomingFile | null>( null )

    const tinySession = useTinySession()
    const { incomingFiles } = useWebRTC()

    React.useEffect( () => {
        const stored = localStorage.getItem( WEBRTC_ENABLED_KEY )
        setWebrtcEnabled( stored === 'true' )

        const handleToggle = ( e: CustomEvent ) => {
            setWebrtcEnabled( e.detail )
        }
        window.addEventListener( 'webrtc-toggled', handleToggle as EventListener )
        return () =>
            window.removeEventListener(
                'webrtc-toggled',
                handleToggle as EventListener,
            )
    }, [] )

    const generateQr = React.useCallback( async () => {
        if ( !webrtcEnabled ) return

        setLoading( true )
        setExpired( false )
        setStateMessage( 'Generating QR code...' )
        try {
            const response = await fetch( '/api/qr-auth/create-offer', {
                method: 'POST',
            } )
            const data = ( await response.json() )
            if ( !response.ok || !( 'payload' in data ) ) {
                throw new Error(
                    ( data as { error?: string } ).error ?? 'Failed to generate QR offer.',
                )
            }

            const dataUrl = await QRCode.toDataURL( data.payload, {
                width: 260,
                margin: 1,
            } )

            setOffer( data )
            setQrImage( dataUrl )
            setStateMessage( 'QR code ready. Scan from another device to connect.' )
        } catch ( error ) {
            setOffer( null )
            setQrImage( '' )
            setStateMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to generate QR code.',
            )
            setExpired( true )
        } finally {
            setLoading( false )
        }
    }, [webrtcEnabled] )

    const toggleWebRTC = () => {
        const newValue = !webrtcEnabled
        setWebrtcEnabled( newValue )
        localStorage.setItem( WEBRTC_ENABLED_KEY, String( newValue ) )
        window.dispatchEvent(
            new CustomEvent( 'webrtc-toggled', { detail: newValue } ),
        )
    }

    React.useEffect( () => {
        if ( webrtcEnabled && !offer ) {
            void generateQr()
        }
    }, [webrtcEnabled, offer, generateQr] )

    React.useEffect( () => {
        if ( !offer || expired ) return

        let cancelled = false
        const startedAt = Date.now()

        const poll = async () => {
            if ( cancelled ) return

            const ONE_MINUTE_MS = 60_000
            if ( Date.now() - startedAt >= ONE_MINUTE_MS ) {
                setExpired( true )
                setStateMessage( 'QR has expired - refresh to generate a new one.' )
                return
            }

            try {
                const response = await fetch(
                    `/api/qr-auth/poll?pollKey=${encodeURIComponent( offer.pollKey )}`,
                )
                const pollData = ( await response.json() )

                if ( !response.ok ) {
                    throw new Error( 'Poll failed' )
                }

                const status = (
                    pollData as { status: string; tinySessionExpiresAt?: string }
                ).status
                if ( status === 'claimed' ) {
                    setStateMessage( 'Device connected! Ready to transfer files.' )
                } else if ( status === 'approved' ) {
                    setStateMessage( 'Connected! You can now transfer files.' )
                    setOffer( null )
                } else if ( status === 'expired' ) {
                    setExpired( true )
                    setStateMessage( 'QR has expired - refresh to generate a new one.' )
                    return
                }

                const pollInterval =
                    ( pollData as { pollIntervalMs?: number } ).pollIntervalMs || 1000
                if ( !cancelled ) {
                    setTimeout( poll, pollInterval )
                }
            } catch ( error ) {
                if ( !cancelled ) {
                    setTimeout( poll, 1000 )
                }
            }
        }

        const pollTimer = setTimeout( poll, 1000 )
        return () => {
            cancelled = true
            clearTimeout( pollTimer )
        }
    }, [offer, expired] )

    const hasActiveSession = tinySession.hasSession

    return (
        <div className="flex h-screen">
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex flex-1 items-center justify-between">
                        <h1 className="text-lg font-semibold">WebRTC Transfers</h1>
                        <Button
                            variant={webrtcEnabled ? 'default' : 'outline'}
                            size="sm"
                            onClick={toggleWebRTC}
                            className="gap-2"
                        >
                            {webrtcEnabled ? (
                                <>
                                    <Wifi className="h-4 w-4" />
                                    Enabled
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4" />
                                    Disabled
                                </>
                            )}
                        </Button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-4xl p-6 space-y-6">
                        {!webrtcEnabled ? (
                            <div className="rounded-lg border border-dashed border-muted-foreground/50 bg-muted/20 p-8 text-center">
                                <WifiOff className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                                <h2 className="mb-2 text-lg font-semibold">
                                    WebRTC Transfers Disabled
                                </h2>
                                <p className="text-muted-foreground mb-4">
                                    Enable WebRTC transfers to send and receive files directly
                                    from another device using peer-to-peer connection.
                                </p>
                                <Button onClick={toggleWebRTC} size="lg">
                                    <Wifi className="mr-2 h-4 w-4" />
                                    Enable WebRTC Transfers
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Connection Status */}
                                <div className="rounded-lg border bg-card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {hasActiveSession ? (
                                                <>
                                                    <div className="flex h-3 w-3 rounded-full bg-green-500" />
                                                    <span className="font-medium text-green-700 dark:text-green-400">
                                                        Connected
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex h-3 w-3 rounded-full bg-amber-500" />
                                                    <span className="font-medium text-amber-700 dark:text-amber-400">
                                                        Waiting for connection
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {hasActiveSession
                                            ? 'A device is connected. You can now transfer files.'
                                            : 'Scan the QR code with another device or use the scanner to connect.'}
                                    </p>
                                </div>

                                {/* QR Code Section */}
                                {qrImage && !hasActiveSession && (
                                    <div className="rounded-lg border bg-card p-6">
                                        <div className="flex flex-col items-center space-y-4">
                                            <h2 className="font-semibold">Scan to Connect</h2>
                                            <img
                                                src={qrImage}
                                                alt="WebRTC Connection QR Code"
                                                className="rounded-lg border p-2"
                                            />
                                            <p className="text-center text-sm text-muted-foreground">
                                                Scan this code with another device to establish a
                                                WebRTC connection
                                            </p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => void generateQr()}
                                                disabled={loading || expired}
                                                className="gap-2"
                                            >
                                                <RefreshCcw className="h-4 w-4" />
                                                Generate New QR
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Incoming Files Section */}
                                <div className="rounded-lg border bg-card p-6">
                                    <h2 className="mb-4 font-semibold">Receiving Files</h2>
                                    <IncomingFilesRegion
                                        onSaveRequest={( file ) => {
                                            setFileToSave( file )
                                            setSaveFileDialogOpen( true )
                                        }}
                                    />
                                    {incomingFiles.length === 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            No files received yet
                                        </p>
                                    )}
                                </div>

                                {/* Drop Zone Section */}
                                {hasActiveSession && (
                                    <div className="rounded-lg border bg-card p-6">
                                        <h2 className="mb-4 font-semibold">Send Files</h2>
                                        <SendFileDropZone />
                                    </div>
                                )}

                                {/* Connection Guide */}
                                {!hasActiveSession && (
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-6">
                                        <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                            Need Help Connecting?
                                        </h3>
                                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                                            <li>
                                                1. Open this device's page on another device or browser
                                            </li>
                                            <li>
                                                2. Use the scanner below to scan the QR code above
                                            </li>
                                            <li>3. Grant permission on the scanning device</li>
                                            <li>4. Connection will be established automatically</li>
                                        </ul>
                                    </div>
                                )}

                                {/* Scanner Section */}
                                <div className="rounded-lg border bg-card p-6">
                                    <h2 className="mb-4 font-semibold">Scanner</h2>
                                    <div className="flex flex-col items-center space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Use this scanner to scan QR codes from other devices
                                        </p>
                                        <ScanQrDialog
                                            triggerLabel="Open Scanner"
                                            triggerVariant="default"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </div>
    )
}
