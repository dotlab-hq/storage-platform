#!/bin/bash
# Test S3 upload using the same config as the app

set -euo pipefail

# Inline the credentials (no .env file needed)
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=sp_ed27c82dc05e4828a94d
export AWS_SECRET_ACCESS_KEY=ce305b8d3e151fcbaffc55fe3233b731266ac145d82cb74cce86de9e68bf1110ce305b8d3e151fcbaffc55fe
export S3_BUCKET=medisync
export S3_PUBLIC_URL=https://storage.wpsadi.dev/api/storage/s3
export AWS_ENDPOINT=https://storage.wpsadi.dev/api/storage/s3

echo "=== S3 Upload Test ==="
echo "Endpoint:  $AWS_ENDPOINT"
echo "Region:    $AWS_REGION"
echo "Bucket:    $S3_BUCKET"
echo "Key ID:    ${AWS_ACCESS_KEY_ID:0:10}..."
echo ""

# Create a tiny test file
TEST_FILE="/tmp/s3-test-upload.txt"
echo "Hello from S3 upload test at $(date)" > "$TEST_FILE"
TEST_KEY="uploads/$(date +%s)-test-upload.txt"

echo "=== Test 1: Basic PUT to S3-compatible endpoint (no auth) ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT \
  -T "$TEST_FILE" \
  -H "Content-Type: text/plain" \
  "$AWS_ENDPOINT/$S3_BUCKET/$TEST_KEY" 2>&1)
echo "Response code: $HTTP_CODE"
echo ""

echo "=== Test 2: PUT with dummy auth header ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT \
  -T "$TEST_FILE" \
  -H "Content-Type: text/plain" \
  -H "Authorization: Bearer $AWS_ACCESS_KEY_ID" \
  "$AWS_ENDPOINT/$S3_BUCKET/$TEST_KEY" 2>&1)
echo "Response code: $HTTP_CODE"
echo ""

echo "=== Test 3: HEAD bucket to check access ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X HEAD \
  "$AWS_ENDPOINT/$S3_BUCKET" 2>&1)
echo "Response code: $HTTP_CODE"
echo ""

echo "=== Test 4: GET bucket listing ==="
RESPONSE=$(curl -s \
  "$AWS_ENDPOINT/$S3_BUCKET" 2>&1)
echo "$RESPONSE" | head -20
echo ""

echo "=== Test 5: Upload using Node.js AWS SDK (same config as app) ==="
node -e "
const { PutObjectCommand, S3Client, ListObjectsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  ...(process.env.AWS_ENDPOINT && {
    endpoint: process.env.AWS_ENDPOINT,
    forcePathStyle: true,
  }),
});

async function test() {
  const bucket = process.env.S3_BUCKET;
  const key = 'uploads/test-node-' + Date.now() + '.txt';
  const body = Buffer.from('Hello from Node.js S3 test at ' + new Date().toISOString());

  console.log('Uploading to bucket=' + bucket + ' key=' + key);
  console.log('Endpoint:', process.env.AWS_ENDPOINT);

  try {
    const result = await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: 'text/plain',
    }));
    console.log('SUCCESS! Upload result:', JSON.stringify(result, null, 2));

    const baseUrl = process.env.S3_PUBLIC_URL;
    const url = baseUrl
      ? baseUrl + '/' + key
      : process.env.AWS_ENDPOINT + '/' + bucket + '/' + key;
    console.log('Public URL would be:', url);
  } catch (err) {
    console.error('FAILED:', err.name, '-', err.message);
    if (err.\$metadata) {
      console.error('HTTP Status:', err.\$metadata.httpStatusCode);
      console.error('Request ID:', err.\$metadata.requestId);
    }

    try {
      console.log('\\nTrying to list bucket contents...');
      const list = await s3.send(new ListObjectsCommand({ Bucket: bucket, MaxKeys: 5 }));
      console.log('Bucket listing:', JSON.stringify(list.Contents?.map(c => c.Key) || [], null, 2));
    } catch (listErr) {
      console.error('Bucket listing also failed:', listErr.name, '-', listErr.message);
    }
  }
}

test();
" 2>&1

echo ""
echo "=== Test 6: Upload with explicit credentials object ==="
node -e "
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: '$AWS_REGION',
  endpoint: '$AWS_ENDPOINT',
  forcePathStyle: true,
  credentials: {
    accessKeyId: '$AWS_ACCESS_KEY_ID',
    secretAccessKey: '$AWS_SECRET_ACCESS_KEY',
  },
});

async function test() {
  const key = 'uploads/test-explicit-' + Date.now() + '.txt';
  try {
    await s3.send(new PutObjectCommand({
      Bucket: '$S3_BUCKET',
      Key: key,
      Body: Buffer.from('Explicit credentials test'),
      ContentType: 'text/plain',
    }));
    console.log('SUCCESS with explicit credentials! Key:', key);
  } catch (err) {
    console.error('FAILED:', err.name, '-', err.message);
    console.error('HTTP Status:', err.\$metadata?.httpStatusCode);
  }
}

test();
" 2>&1

rm -f "$TEST_FILE"
echo ""
echo "=== Done ==="
