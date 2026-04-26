import {
  HeadBucketCommand,
  GetBucketCorsCommand,
  GetBucketVersioningCommand,
  ListBucketsCommand,
  S3Client,
} from '@aws-sdk/client-s3'

export function readRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

export function createS3Client(input?: {
  accessKeyId?: string
  secretAccessKey?: string
}): S3Client {
  const endpoint =
    process.env.S3_TEST_ENDPOINT ?? 'https://storage.wpsadi.dev/api/storage/s3'
  const region = process.env.S3_TEST_REGION ?? 'auto'
  return new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: {
      accessKeyId:
        input?.accessKeyId ?? readRequiredEnv('S3_TEST_ACCESS_KEY_ID'),
      secretAccessKey:
        input?.secretAccessKey ?? readRequiredEnv('S3_TEST_SECRET_ACCESS_KEY'),
    },
  })
}

export async function readBucketVersioning(
  client: S3Client,
  bucketName: string,
): Promise<string> {
  const result = await client.send(
    new GetBucketVersioningCommand({ Bucket: bucketName }),
  )
  return result.Status ?? 'Disabled'
}

export async function readBucketCors(
  client: S3Client,
  bucketName: string,
): Promise<number> {
  const result = await client.send(
    new GetBucketCorsCommand({ Bucket: bucketName }),
  )
  return result.CORSRules?.length ?? 0
}

export function testBucketName(): string {
  const bucketName = process.env.S3_TEST_BUCKET ?? ''
  if (bucketName.length === 0) {
    throw new Error('Missing environment variable: S3_TEST_BUCKET')
  }
  return bucketName
}

export async function probeS3Access(input: {
  bucketName: string
  client?: S3Client
}): Promise<{ ok: boolean; reason: string }> {
  const client = input.client ?? createS3Client()
  try {
    const listed = await client.send(new ListBucketsCommand({}))
    const bucketNames = (listed.Buckets ?? []).map((bucket) => bucket.Name)
    if (!bucketNames.includes(input.bucketName)) {
      return {
        ok: false,
        reason: `Configured bucket '${input.bucketName}' not visible to configured key`,
      }
    }
    await client.send(new HeadBucketCommand({ Bucket: input.bucketName }))
    return { ok: true, reason: 'ok' }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown S3 credentials failure'
    return {
      ok: false,
      reason: `S3 credential probe failed: ${message}`,
    }
  }
}
