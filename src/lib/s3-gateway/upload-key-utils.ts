export function buildUpstreamObjectKey( userId: string, bucketId: string, objectKey: string ): string {
    const cleanedKey = objectKey.replace( /^\/+/, "" )
    return `s3/${userId}/${bucketId}/${cleanedKey}`
}

export function deriveFileName( objectKey: string ): string {
    const pieces = objectKey.split( "/" ).filter( ( value ) => value.length > 0 )
    return pieces[pieces.length - 1] ?? objectKey
}
