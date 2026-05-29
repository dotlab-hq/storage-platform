import { expect, test } from '@playwright/test'
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { createS3Client, probeS3Access, testBucketName } from './helpers/s3-test-utils'

test.describe('S3 Windows path separators', () => {
  const bucketName = testBucketName()
  const prefix = `playwright/${Date.now()}`
  const keyWithBackslashes = `${prefix}\\subdir\\file.txt`
  const normalizedKey = `${prefix}/subdir/file.txt`

  test.beforeAll(async () => {
    const probe = await probeS3Access({ bucketName })
    test.skip(!probe.ok, probe.reason)
  })

  test('Backslashes are treated as folder separators', async () => {
    const client = createS3Client()
    const body = new TextEncoder().encode('windows-separator-test')

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: keyWithBackslashes,
        Body: body,
        ContentType: 'text/plain',
      }),
    )

    await expect(
      client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: keyWithBackslashes,
        }),
      ),
    ).resolves.toBeDefined()

    const listed = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: `${prefix}/subdir/`,
      }),
    )
    const keys = (listed.Contents ?? []).map((item) => item.Key)
    expect(keys).toContain(normalizedKey)

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: keyWithBackslashes,
      }),
    )
  })
})
