import { expect, test } from '@playwright/test'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectVersionsCommand,
  PutBucketVersioningCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { createS3Client, testBucketName } from './helpers/s3-test-utils'

test.describe('S3 versioning compatibility', () => {
  const bucketName = testBucketName()
  const prefix = `playwright/versioning/${Date.now()}`
  const key = `${prefix}/versioned.txt`

  test('PutObject returns version id when enabled', async () => {
    const client = createS3Client()

    await client.send(
      new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    )

    const put = await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(Buffer.from('v1')),
      }),
    )

    expect(put.VersionId).toBeTruthy()

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(Buffer.from('v2')),
      }),
    )

    const versions = await client.send(
      new ListObjectVersionsCommand({
        Bucket: bucketName,
        Prefix: key,
        MaxKeys: 20,
      }),
    )

    const matchingVersions = (versions.Versions ?? []).filter(
      (item) => item.Key === key,
    )
    expect(matchingVersions.length).toBeGreaterThanOrEqual(2)

    await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: key }))
  })

  test('DeleteObject creates delete marker when enabled', async () => {
    const client = createS3Client()
    await client.send(
      new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: { Status: 'Enabled' },
      }),
    )

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(Buffer.from('delete-marker-test')),
      }),
    )

    const deleted = await client.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: key }),
    )
    expect(deleted.VersionId).toBeTruthy()
    expect(deleted.DeleteMarker).toBeTruthy()

    await expect(
      client.send(new GetObjectCommand({ Bucket: bucketName, Key: key })),
    ).rejects.toBeDefined()
  })

  test('Suspended versioning returns null version id', async () => {
    const client = createS3Client()
    await client.send(
      new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: { Status: 'Suspended' },
      }),
    )

    const put = await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `${key}-suspended`,
        Body: new Uint8Array(Buffer.from('suspended')),
      }),
    )
    expect(put.VersionId ?? 'null').toBe('null')
  })
})
