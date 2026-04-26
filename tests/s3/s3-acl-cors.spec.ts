import { expect, test } from '@playwright/test'
import {
  PutBucketAclCommand,
  PutBucketCorsCommand,
  PutObjectAclCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { createS3Client, testBucketName } from './helpers/s3-test-utils'

function endpointRoot(): string {
  return (
    process.env.S3_TEST_ENDPOINT ?? 'https://storage.wpsadi.dev/api/storage/s3'
  )
}

test.describe('S3 ACL and CORS behavior', () => {
  const bucketName = testBucketName()
  const key = `playwright/acl-cors/${Date.now()}.txt`

  test('bucket and object ACL public/private toggles', async ({ request }) => {
    const client = createS3Client()
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: new Uint8Array(Buffer.from('acl content')),
        ContentType: 'text/plain',
      }),
    )

    await client.send(
      new PutBucketAclCommand({ Bucket: bucketName, ACL: 'public-read' }),
    )
    await client.send(
      new PutObjectAclCommand({
        Bucket: bucketName,
        Key: key,
        ACL: 'public-read',
      }),
    )

    const publicResponse = await request.get(
      `${endpointRoot()}/${bucketName}/${key}`,
    )
    expect(publicResponse.ok()).toBeTruthy()

    await client.send(
      new PutBucketAclCommand({ Bucket: bucketName, ACL: 'private' }),
    )
    await client.send(
      new PutObjectAclCommand({ Bucket: bucketName, Key: key, ACL: 'private' }),
    )
  })

  test('cors preflight returns allow headers for allowed origin', async ({
    request,
  }) => {
    const client = createS3Client()
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: ['https://example.test'],
              AllowedMethods: ['GET', 'PUT', 'HEAD', 'OPTIONS'],
              AllowedHeaders: ['*'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 600,
            },
          ],
        },
      }),
    )

    const preflight = await request.fetch(
      `${endpointRoot()}/${bucketName}/${key}`,
      {
        method: 'OPTIONS',
        headers: {
          origin: 'https://example.test',
          'access-control-request-method': 'GET',
          'access-control-request-headers': 'content-type',
        },
      },
    )

    expect(preflight.status()).toBe(204)
    expect(preflight.headers()['access-control-allow-origin']).toBe(
      'https://example.test',
    )
  })
})
