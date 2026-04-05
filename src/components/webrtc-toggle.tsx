'use client'

import * as React from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'

const WEBRTC_ENABLED_KEY = 'dot_webrtc_enabled'

export function WebRTCToggle() {
    const [webrtcEnabled, setWebrtcEnabled] = React.useState( false )

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

    const toggle = () => {
        const newValue = !webrtcEnabled
        setWebrtcEnabled( newValue )
        localStorage.setItem( WEBRTC_ENABLED_KEY, String( newValue ) )
        window.dispatchEvent(
            new CustomEvent( 'webrtc-toggled', { detail: newValue } ),
        )
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon"
                    variant={webrtcEnabled ? 'default' : 'ghost'}
                    onClick={toggle}
                    aria-label={
                        webrtcEnabled
                            ? 'Disable WebRTC transfers'
                            : 'Enable WebRTC transfers'
                    }
                >
                    {webrtcEnabled ? (
                        <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                        <WifiOff className="h-4 w-4" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {webrtcEnabled ? 'Disable WebRTC' : 'Enable WebRTC'}
            </TooltipContent>
        </Tooltip>
    )
}
