import { expect, test } from '@playwright/test'
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  createS3Client,
  probeS3Access,
  testBucketName,
} from './helpers/s3-test-utils'

test.describe('S3 presigned URL compatibility', () => {
  const bucketName = testBucketName()
  const key = `playwright/presigned/${Date.now()}.txt`

  test.beforeAll(async () => {
    const probe = await probeS3Access({ bucketName })
    test.skip(!probe.ok, probe.reason)
  })

  test('presigned PUT and GET work against gateway', async ({ request }) => {
    const client = createS3Client()
    const putUrl = await getSignedUrl(
      client,
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        ContentType: 'text/plain',
      }),
      { expiresIn: 900 },
    )

    const putResponse = await request.put(putUrl, {
      data: 'presigned-upload',
      headers: { 'content-type': 'text/plain' },
    })
    expect(putResponse.ok()).toBeTruthy()

    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucketName, Key: key }),
    )
    expect(Number(head.ContentLength ?? 0)).toBeGreaterThan(0)

    const getUrl = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucketName, Key: key }),
      { expiresIn: 900 },
    )
    const getResponse = await request.get(getUrl)
    expect(getResponse.ok()).toBeTruthy()
    expect(await getResponse.text()).toBe('presigned-upload')
  })

  test('response-content-disposition override is applied', async ({
    request,
  }) => {
    const client = createS3Client()
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: `${key}-download`,
        Body: new Uint8Array(Buffer.from('downloadable')),
        ContentType: 'text/plain',
      }),
    )

    const getUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: `${key}-download`,
        ResponseContentDisposition: 'attachment; filename="download.txt"',
      }),
      { expiresIn: 900 },
    )
    const getResponse = await request.get(getUrl)
    expect(getResponse.ok()).toBeTruthy()
    expect(getResponse.headers()['content-disposition']).toContain('attachment')
  })
})
