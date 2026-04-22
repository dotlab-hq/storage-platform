export const DEFAULT_ASSETS_BUCKET_NAME = 'assets'

export function isDefaultAssetsBucketName(bucketName: string): boolean {
  return bucketName.trim().toLowerCase() === DEFAULT_ASSETS_BUCKET_NAME
}
