'use client'

import { Wifi, WifiOff, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ScanQrDialog } from '@/components/qr/scan-qr-dialog'
import { SendFileDropZone } from '@/components/storage/send-file-drop-zone'
import { IncomingFilesRegion } from '@/components/storage/incoming-files-region'
import { useTinySession } from '@/hooks/use-tiny-session'
import { useWebRTC } from '@/hooks/use-webrtc'
import { useWebrtcQr } from './use-webrtc-qr'

export function WebRTCPage() {
    const tinySession = useTinySession()
    const { isConnected, incomingFiles } = useWebRTC()
    const {
        webrtcEnabled, qrImage, loading, expired,
        errorMessage, toggleWebRTC, generateQr
    } = useWebrtcQr( isConnected )

    return (
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
                                Enable WebRTC transfers to send and receive files directly from another device using peer-to-peer connection.
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
                                        {isConnected ? (
                                            <>
                                                <div className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                                                <span className="font-medium text-green-700 dark:text-green-400">
                                                    Peer Connected
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                                                <span className="font-medium text-amber-700 dark:text-amber-400">
                                                    {tinySession.hasSession ? 'Establishing Peer Connection' : 'Waiting for Connection'}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {isConnected
                                        ? 'Peer is connected. You can now transfer files.'
                                        : errorMessage || 'Scan the QR code with another device or use the scanner to connect.'}
                                </p>
                            </div>

                            {/* QR Code Section */}
                            {qrImage && !isConnected && (
                                <div className="rounded-lg border bg-card p-6">
                                    <div className="flex flex-col items-center space-y-4">
                                        <h2 className="font-semibold">Scan to Connect</h2>
                                        <img
                                            src={qrImage}
                                            alt="WebRTC Connection QR Code"
                                            className="rounded-lg border p-2"
                                        />
                                        <p className="text-center text-sm text-muted-foreground">
                                            Scan this code with another device to establish a WebRTC connection
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
                                    onSaveRequest={() => {
                                        // Handle save request
                                    }}
                                />
                                {incomingFiles.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No files received yet
                                    </p>
                                )}
                            </div>

                            {/* Drop Zone Section */}
                            {isConnected && (
                                <div className="rounded-lg border bg-card p-6">
                                    <h2 className="mb-4 font-semibold">Send Files</h2>
                                    <SendFileDropZone />
                                </div>
                            )}

                            {/* Connection Guide */}
                            {!isConnected && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-6">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                                        How to Connect
                                    </h3>
                                    <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-300 list-decimal list-inside">
                                        <li>Open this device's page on another device or browser</li>
                                        <li>Scan the QR code above with the other device</li>
                                        <li>The peer connection will establish automatically</li>
                                        <li>Once connected, you can transfer files in both directions</li>
                                    </ol>
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
    )
}
