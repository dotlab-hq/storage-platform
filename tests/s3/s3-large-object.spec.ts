import { expect, test } from '@playwright/test'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import {
  createS3Client,
  probeS3Access,
  testBucketName,
} from './helpers/s3-test-utils'

const LARGE_OBJECT_SIZE = 9 * 1024 * 1024

function createLargePayload(): Uint8Array {
  const payload = new Uint8Array(LARGE_OBJECT_SIZE)
  for (let index = 0; index < payload.length; index += 1) {
    payload[index] = index % 251
  }
  return payload
}

test.describe('S3 large object reads', () => {
  const bucketName = process.env.S3_TEST_BUCKET ?? ''
  const key = `playwright-large/${Date.now()}/large-object.bin`

  test.beforeAll(async () => {
    if (bucketName.length === 0) {
      throw new Error('Missing environment variable: S3_TEST_BUCKET')
    }
    const probe = await probeS3Access({ bucketName })
    test.skip(!probe.ok, probe.reason)
  })

  test('GetObject streams objects larger than 8 MiB', async () => {
    const client = createS3Client()
    const payload = createLargePayload()

    await client.send(
      new PutObjectCommand({
        Bucket: testBucketName(),
        Key: key,
        Body: payload,
        ContentType: 'application/octet-stream',
      }),
    )

    try {
      const head = await client.send(
        new HeadObjectCommand({ Bucket: testBucketName(), Key: key }),
      )
      expect(Number(head.ContentLength ?? 0)).toBe(payload.byteLength)

      const object = await client.send(
        new GetObjectCommand({ Bucket: testBucketName(), Key: key }),
      )
      const bytes = await object.Body?.transformToByteArray()
      expect(bytes?.byteLength ?? 0).toBe(payload.byteLength)
      expect(bytes?.[0]).toBe(payload[0])
      expect(bytes?.[payload.length - 1]).toBe(payload[payload.length - 1])

      const ranged = await client.send(
        new GetObjectCommand({
          Bucket: testBucketName(),
          Key: key,
          Range: 'bytes=1048576-1049599',
        }),
      )
      const rangedBytes = await ranged.Body?.transformToByteArray()
      expect(rangedBytes?.byteLength ?? 0).toBe(1024)
      expect(ranged.ContentRange).toBe(
        `bytes 1048576-1049599/${payload.byteLength}`,
      )
    } finally {
      await client.send(
        new DeleteObjectCommand({ Bucket: testBucketName(), Key: key }),
      )
    }
  })
})
