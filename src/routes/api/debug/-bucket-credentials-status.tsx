import { json } from '@tanstack/react-start'
import { db } from '@/db'
import { virtualBucket } from '@/db/schema/s3-gateway'

export async function GET( request: Request ) {
    const authHeader = request.headers.get( 'authorization' )
    if ( !authHeader ) {
        return json( { error: 'Unauthorized' }, { status: 401 } )
    }

    try {
        const buckets = await db
            .select( {
                id: virtualBucket.id,
                name: virtualBucket.name,
                userId: virtualBucket.userId,
                createdAt: virtualBucket.createdAt,
                isActive: virtualBucket.isActive,
            } )
            .from( virtualBucket )
            .limit( 10 )

        return json( {
            bucketCount: buckets.length,
            buckets,
            message: 'Virtual buckets in database',
        } )
    } catch ( error ) {
        return json( { error: String( error ) }, { status: 500 } )
    }
}
