import { useCallback, useMemo, useState } from "react"
import type {
    S3BucketItem,
    S3BucketActionResponse,
    S3BucketCredentials,
    S3BucketCredentialsResponse,
    S3BucketListResponse,
} from "@/types/s3-buckets"

type PendingAction = "create" | "empty" | "delete"
type PendingByBucket = Record<string, PendingAction | undefined>

async function parseJson<T>( response: Response ): Promise<T> {
    return ( await response.json() ) as T
}

async function readApiError( response: Response, fallback: string ): Promise<string> {
    const payload = await parseJson<{ error?: string }>( response )
    return payload.error ?? fallback
}

export function useS3Buckets() {
    const [buckets, setBuckets] = useState<S3BucketItem[]>( [] )
    const [isLoading, setIsLoading] = useState<boolean>( true )
    const [isRefreshing, setIsRefreshing] = useState<boolean>( false )
    const [isCreating, setIsCreating] = useState<boolean>( false )
    const [pendingByBucket, setPendingByBucket] = useState<PendingByBucket>( {} )
    const [credentialByBucket, setCredentialByBucket] = useState<Record<string, S3BucketCredentials | undefined>>( {} )
    const [error, setError] = useState<string | null>( null )

    const refreshBuckets = useCallback( async () => {
        setIsRefreshing( true )
        setError( null )
        try {
            const response = await fetch( "/api/storage/s3/buckets", { method: "GET" } )
            if ( !response.ok ) {
                throw new Error( await readApiError( response, "Failed to load buckets" ) )
            }
            const payload = await parseJson<S3BucketListResponse>( response )
            setBuckets( payload.buckets )
        } catch ( fetchError ) {
            setError( fetchError instanceof Error ? fetchError.message : "Failed to load buckets" )
        } finally {
            setIsRefreshing( false )
            setIsLoading( false )
        }
    }, [] )

    const createNewBucket = useCallback( async ( bucketName: string ) => {
        setIsCreating( true )
        setError( null )

        const normalizedName = bucketName.trim()
        const tempBucket: S3BucketItem = {
            id: `temp-${crypto.randomUUID()}`,
            name: normalizedName,
            mappedFolderId: null,
            isActive: true,
            createdAt: new Date().toISOString(),
        }

        setBuckets( ( previous ) => [tempBucket, ...previous] )

        try {
            const response = await fetch( "/api/storage/s3/buckets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( { bucketName: normalizedName } ),
            } )
            const payload = await parseJson<S3BucketActionResponse>( response )
            if ( !response.ok || !payload.ok ) {
                const message = payload.ok ? "Failed to create bucket" : payload.error
                throw new Error( message )
            }

            setBuckets( ( previous ) => {
                const withoutTemp = previous.filter( ( bucket ) => bucket.name !== normalizedName )
                return [payload.bucket, ...withoutTemp]
            } )
            return true
        } catch ( createError ) {
            setBuckets( ( previous ) => previous.filter( ( bucket ) => bucket.name !== normalizedName ) )
            setError( createError instanceof Error ? createError.message : "Failed to create bucket" )
            return false
        } finally {
            setIsCreating( false )
        }
    }, [] )

    const runBucketAction = useCallback( async ( bucketName: string, action: Exclude<PendingAction, "create"> ) => {
        setPendingByBucket( ( previous ) => ( { ...previous, [bucketName]: action } ) )
        setError( null )

        const originalBuckets = buckets
        if ( action === "delete" ) {
            setBuckets( ( previous ) => previous.filter( ( bucket ) => bucket.name !== bucketName ) )
        }

        const endpoint = action === "empty"
            ? "/api/storage/s3/empty-bucket"
            : "/api/storage/s3/delete-bucket"

        try {
            const response = await fetch( endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( { bucketName } ),
            } )
            if ( !response.ok ) {
                throw new Error( await readApiError( response, `Failed to ${action} bucket` ) )
            }
            return true
        } catch ( actionError ) {
            if ( action === "delete" ) {
                setBuckets( originalBuckets )
            }
            setError( actionError instanceof Error ? actionError.message : `Failed to ${action} bucket` )
            return false
        } finally {
            setPendingByBucket( ( previous ) => ( { ...previous, [bucketName]: undefined } ) )
        }
    }, [buckets] )

    const hasBuckets = useMemo( () => buckets.length > 0, [buckets] )

    const fetchCredentials = useCallback( async ( bucketName: string ) => {
        try {
            const response = await fetch( "/api/storage/s3/bucket-credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( { bucketName } ),
            } )
            const payload = await parseJson<S3BucketCredentialsResponse>( response )
            if ( !response.ok || !payload.ok ) {
                const message = payload.ok ? "Failed to fetch credentials" : payload.error
                throw new Error( message )
            }

            setCredentialByBucket( ( previous ) => ( {
                ...previous,
                [bucketName]: payload.credentials,
            } ) )
            return payload.credentials
        } catch ( fetchError ) {
            setError( fetchError instanceof Error ? fetchError.message : "Failed to fetch credentials" )
            return null
        }
    }, [] )

    return {
        buckets,
        isLoading,
        isRefreshing,
        isCreating,
        pendingByBucket,
        credentialByBucket,
        error,
        hasBuckets,
        refreshBuckets,
        createNewBucket,
        runBucketAction,
        fetchCredentials,
    }
}
