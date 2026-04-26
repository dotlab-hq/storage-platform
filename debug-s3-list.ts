import {
  S3Client,
  HeadBucketCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'

const endpoint = 'https://storage.wpsadi.dev/api/storage/s3'
const region = 'us-east-1'
const accessKeyId = 'sp_9132a903e469482a8c94'
const secretAccessKey =
  'ca3a8a220fede5051d9df9b181f5344bb29842fa1c2ac96e8d4f0c17dfd7f7f8ca3a8a220fede5051d9df9b1'
const bucketName = 'storage'

const client = new S3Client({
  endpoint,
  region,
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

async function main() {
  console.log('Testing HEAD bucket...')
  try {
    const headResult = await client.send(
      new HeadBucketCommand({ Bucket: bucketName }),
    )
    console.log('HeadBucket success:', headResult)
  } catch (error) {
    console.error('HeadBucket error:', error)
  }

  console.log('Testing LIST objects...')
  try {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: '',
        Delimiter: '/',
        MaxKeys: 1000,
      }),
    )
    console.log('Success:')
    console.log('IsTruncated:', result.IsTruncated)
    console.log('KeyCount:', result.KeyCount)
    console.log('NextContinuationToken:', result.NextContinuationToken)
    console.log('Contents count:', result.Contents?.length ?? 0)
    if (result.CommonPrefixes) {
      console.log('CommonPrefixes count:', result.CommonPrefixes.length)
    }
  } catch (error) {
    console.error('ListObjectsV2 error:')
    if (error instanceof Error) {
      console.error('Name:', error.name)
      console.error('Message:', error.message)
      if ('$metadata' in error) {
        console.error('Metadata:', (error as any).$metadata)
      }
      if ('$response' in error) {
        console.error('Response:', (error as any).$response?.statusCode)
      }
    } else {
      console.error(error)
    }
  }
}

main()
