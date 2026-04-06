
import { createServerFn } from '@tanstack/react-start'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query';
import QRCode from 'qrcode'
import { z } from 'zod'

import * as React from 'react'

const OfferResponseSchema = z.object( {
    code: z.string(),
    pollKey: z.string(),
    payload: z.string(),
    expiresAt: z.string(),
    pollIntervalMs: z.number(),
} )

const PollResponseSchema = z.object( {
    status: z.enum( [
        'pending',
        'claimed',
        'approved',
        'expired',
        'rejected',
        'not_found',
    ] ),
    message: z.string().optional(),
    tinySessionExpiresAt: z.string().optional(),
} )

export type OfferResponse = z.infer<typeof OfferResponseSchema>
export type PollResponse = z.infer<typeof PollResponseSchema>

export const createQrOffer = createServerFn( { method: 'POST' } ).handler(
    async () => {
        try {
            const response = await fetch( '/api/qr-auth/create-offer', {
                method: 'POST',
            } )

            if ( !response.ok ) {
                throw new Error( 'Failed to create QR offer' )
            }

            const data = ( await response.json() )
            const validatedData = OfferResponseSchema.parse( data )
            return { success: true, data: validatedData }
        } catch ( error ) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            return { success: false, error: errorMessage }
        }
    },
)

export const pollQrStatus = createServerFn( { method: 'POST' } )
    .inputValidator( z.object( { pollKey: z.string() } ) )
    .handler( async ( { data } ) => {
        try {
            const response = await fetch(
                `/api/qr-auth/poll`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify( { pollKey: data.pollKey } ),
                } )
            

            if ( !response.ok ) {
                throw new Error( 'Failed to poll QR status' )
            }

            const pollData = ( await response.json() )
            const validatedData = PollResponseSchema.parse( pollData )
            return { success: true, data: validatedData }
        } catch ( error ) {
            const errorMessage =
                error instanceof Error ? error.message : 'Unknown error'
            return { success: false, error: errorMessage }
        }
    } )

export type UseCreateQrOfferReturn = {
    qrImage: string
    setQrImage: ( image: string ) => void
    createOfferMutation: UseMutationResult<OfferResponse, Error, void>
}

export function useCreateQrOffer(): UseCreateQrOfferReturn {
    const [qrImage, setQrImage] = React.useState<string>( '' )

    const createOfferMutation = useMutation( {
        mutationFn: async () => {
            const result = await createQrOffer()
            if ( !result.success ) {
                throw new Error( result.error )
            }
            return result.data
        },
        onSuccess: async ( data ) => {
            try {
                const dataUrl = await QRCode.toDataURL( data.payload, {
                    width: 260,
                    margin: 1,
                } )
                setQrImage( dataUrl )
            } catch ( error ) {
                console.error( 'Failed to generate QR image:', error )
            }
        },
        onError: () => {
            setQrImage( '' )
        },
    } )

    return { qrImage, setQrImage, createOfferMutation }
}

export type UsePollQrStatusReturn = {
    pollResult: PollResponse | null | undefined
    isPolling: boolean
}

export function usePollQrStatus(
    currentOffer: OfferResponse | null | undefined,
    enabled: boolean,
): UsePollQrStatusReturn {
    const { data: pollResult, isLoading: isPolling } = useQuery( {
        queryKey: ['pollQrStatus', currentOffer?.pollKey],
        queryFn: async () => {
            if ( !currentOffer ) return null
            const result = await pollQrStatus( { data: { pollKey: currentOffer.pollKey } } )
            if ( !result.success ) {
                throw new Error( result.error )
            }
            return result.data
        },
        enabled: enabled && currentOffer !== undefined && currentOffer !== null,
        refetchInterval: currentOffer?.pollIntervalMs ?? 5000,
        retry: false,
    } )

    return { pollResult, isPolling }
}
