import { expect, test } from '@playwright/test'
import {
  HeadBucketCommand,
  ListBucketsCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import {
  createS3Client,
  probeS3Access,
  testBucketName,
} from './helpers/s3-test-utils'

function readOptionalEnv(key: string): string | null {
  const value = process.env[key]
  if (!value || value.trim().length === 0) {
    return null
  }
  return value
}

test.describe('S3 bucket scoped access keys', () => {
  const primaryBucket = testBucketName()
  const secondaryBucket = readOptionalEnv('S3_TEST_SECOND_BUCKET')
  const secondaryAccessKeyId = readOptionalEnv('S3_TEST_SECOND_ACCESS_KEY_ID')
  const secondarySecretAccessKey = readOptionalEnv(
    'S3_TEST_SECOND_SECRET_ACCESS_KEY',
  )

  test.beforeAll(async () => {
    const probe = await probeS3Access({ bucketName: primaryBucket })
    test.skip(!probe.ok, probe.reason)
  })

  test('root list returns visible buckets for account', async () => {
    const primaryClient = createS3Client()
    const result = await primaryClient.send(new ListBucketsCommand({}))
    const bucketNames = (result.Buckets ?? []).map((bucket) => bucket.Name)
    expect(bucketNames).toContain(primaryBucket)
  })

  test('bucket scoped key cannot access other bucket resources', async () => {
    test.skip(
      !secondaryBucket || !secondaryAccessKeyId || !secondarySecretAccessKey,
      'Set S3_TEST_SECOND_BUCKET, S3_TEST_SECOND_ACCESS_KEY_ID, S3_TEST_SECOND_SECRET_ACCESS_KEY to verify cross-bucket isolation',
    )

    const secondaryClient = createS3Client({
      accessKeyId: secondaryAccessKeyId ?? '',
      secretAccessKey: secondarySecretAccessKey ?? '',
    })

    await expect(
      secondaryClient.send(new HeadBucketCommand({ Bucket: primaryBucket })),
    ).rejects.toBeDefined()

    await expect(
      secondaryClient.send(
        new PutObjectCommand({
          Bucket: primaryBucket,
          Key: `playwright/isolation/${Date.now()}.txt`,
          Body: new Uint8Array(Buffer.from('forbidden')),
        }),
      ),
    ).rejects.toBeDefined()
  })
})
