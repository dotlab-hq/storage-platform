import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

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
            const response = await fetch( '/api/qr-auth/poll', {
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
