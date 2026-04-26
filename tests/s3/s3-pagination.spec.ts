import { expect, test } from '@playwright/test'
import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'
import {
  createS3Client,
  probeS3Access,
  testBucketName,
} from './helpers/s3-test-utils'

test.describe('S3 list pagination compatibility', () => {
  const bucketName = testBucketName()
  const prefix = `playwright/pagination/${Date.now()}`

  test.beforeAll(async () => {
    const probe = await probeS3Access({ bucketName })
    test.skip(!probe.ok, probe.reason)
  })

  test('ListObjectsV2 supports continuation tokens', async () => {
    const client = createS3Client()
    const keys = Array.from({ length: 8 }).map(
      (_, index) => `${prefix}/item-${String(index + 1).padStart(2, '0')}.txt`,
    )

    await Promise.all(
      keys.map((key) =>
        client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: new Uint8Array(Buffer.from(`content-${key}`)),
          }),
        ),
      ),
    )

    const first = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: 3,
      }),
    )
    expect(first.IsTruncated).toBeTruthy()
    expect((first.Contents ?? []).length).toBeLessThanOrEqual(3)
    expect(first.NextContinuationToken).toBeTruthy()

    const second = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
        MaxKeys: 3,
        ContinuationToken: first.NextContinuationToken,
      }),
    )

    const firstKeys = new Set((first.Contents ?? []).map((entry) => entry.Key))
    const secondKeys = new Set(
      (second.Contents ?? []).map((entry) => entry.Key),
    )
    const overlap = Array.from(secondKeys).filter((key) => firstKeys.has(key))
    expect(overlap.length).toBe(0)
  })
})
