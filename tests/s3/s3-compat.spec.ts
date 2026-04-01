import { expect, test } from "@playwright/test"
import {
    CreateMultipartUploadCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    ListBucketsCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function readRequiredEnv( key: string ): string {
    const value = process.env[key]
    if ( !value || value.trim().length === 0 ) {
        throw new Error( `Missing environment variable: ${key}` )
    }
    return value
}

function createS3Client(): S3Client {
    const endpoint = process.env.S3_TEST_ENDPOINT ?? "https://storage.wpsadi.dev"
    const region = process.env.S3_TEST_REGION ?? "auto"
    return new S3Client( {
        endpoint,
        region,
        forcePathStyle: true,
        credentials: {
            accessKeyId: readRequiredEnv( "S3_TEST_ACCESS_KEY_ID" ),
            secretAccessKey: readRequiredEnv( "S3_TEST_SECRET_ACCESS_KEY" ),
        },
    } )
}

function readFixtureBytes(): Uint8Array {
    const filePath = process.env.S3_TEST_DUMMY_FILE_PATH
        ? resolve( process.cwd(), process.env.S3_TEST_DUMMY_FILE_PATH )
        : resolve( process.cwd(), "tests/s3/fixtures/dummy-upload.txt" )
    return new Uint8Array( readFileSync( filePath ) )
}

test.describe( "S3 compatibility endpoints", () => {
    const bucketName = process.env.S3_TEST_BUCKET ?? ""
    const sdCompartmentPrefix = process.env.S3_TEST_SD_COMPARTMENT_PREFIX ?? "sd"
    const prefix = `playwright/${Date.now()}`
    const sdPrefix = `${sdCompartmentPrefix}/${prefix}`
    const key = `${prefix}/dummy-upload.txt`
    const sdKey = `${sdPrefix}/dummy-upload.txt`
    const multipartKey = `${prefix}/multipart-upload.bin`

    test.beforeAll( async () => {
        if ( bucketName.length === 0 ) {
            throw new Error( "Missing environment variable: S3_TEST_BUCKET" )
        }
    } )

    test( "ListBuckets returns the configured bucket", async () => {
        const client = createS3Client()
        const result = await client.send( new ListBucketsCommand( {} ) )
        const bucketNames = ( result.Buckets ?? [] ).map( ( bucket ) => bucket.Name )
        expect( bucketNames ).toContain( bucketName )
    } )

    test( "HeadBucket succeeds", async () => {
        const client = createS3Client()
        await expect( client.send( new HeadBucketCommand( { Bucket: bucketName } ) ) ).resolves.toBeDefined()
    } )

    test( "PutObject + HeadObject + GetObject + ListObjectsV2 + DeleteObject", async () => {
        const client = createS3Client()
        const bytes = readFixtureBytes()

        await client.send( new PutObjectCommand( {
            Bucket: bucketName,
            Key: key,
            Body: bytes,
            ContentType: "text/plain",
        } ) )

        const head = await client.send( new HeadObjectCommand( {
            Bucket: bucketName,
            Key: key,
        } ) )
        expect( Number( head.ContentLength ?? 0 ) ).toBe( bytes.byteLength )

        const object = await client.send( new GetObjectCommand( {
            Bucket: bucketName,
            Key: key,
        } ) )
        const content = await object.Body?.transformToString()
        expect( content ?? "" ).toContain( "Dummy payload for S3 compatibility tests." )

        const listed = await client.send( new ListObjectsV2Command( {
            Bucket: bucketName,
            Prefix: prefix,
        } ) )
        const objectKeys = ( listed.Contents ?? [] ).map( ( item ) => item.Key )
        expect( objectKeys ).toContain( key )

        await client.send( new DeleteObjectCommand( {
            Bucket: bucketName,
            Key: key,
        } ) )

        await expect( client.send( new HeadObjectCommand( {
            Bucket: bucketName,
            Key: key,
        } ) ) ).rejects.toBeDefined()
    } )

    test( "SD compartment prefix can Put/Get/List/Delete objects", async () => {
        const client = createS3Client()
        const bytes = readFixtureBytes()

        await client.send( new PutObjectCommand( {
            Bucket: bucketName,
            Key: sdKey,
            Body: bytes,
            ContentType: "text/plain",
        } ) )

        const sdHead = await client.send( new HeadObjectCommand( {
            Bucket: bucketName,
            Key: sdKey,
        } ) )
        expect( Number( sdHead.ContentLength ?? 0 ) ).toBe( bytes.byteLength )

        const sdObject = await client.send( new GetObjectCommand( {
            Bucket: bucketName,
            Key: sdKey,
        } ) )
        const sdContent = await sdObject.Body?.transformToString()
        expect( sdContent ?? "" ).toContain( "Dummy payload for S3 compatibility tests." )

        const listed = await client.send( new ListObjectsV2Command( {
            Bucket: bucketName,
            Prefix: sdPrefix,
        } ) )
        const objectKeys = ( listed.Contents ?? [] ).map( ( item ) => item.Key )
        expect( objectKeys ).toContain( sdKey )

        await client.send( new DeleteObjectCommand( {
            Bucket: bucketName,
            Key: sdKey,
        } ) )

        await expect( client.send( new HeadObjectCommand( {
            Bucket: bucketName,
            Key: sdKey,
        } ) ) ).rejects.toBeDefined()
    } )

    test( "Multipart lifecycle works", async () => {
        test.skip( process.env.S3_TEST_ENABLE_MULTIPART !== "true", "Set S3_TEST_ENABLE_MULTIPART=true to run multipart checks" )
        const client = createS3Client()
        const partBody = new Uint8Array( Buffer.from( "multipart-content-for-s3-compat-tests" ) )

        const createResult = await client.send( new CreateMultipartUploadCommand( {
            Bucket: bucketName,
            Key: multipartKey,
            ContentType: "application/octet-stream",
        } ) )

        const uploadId = createResult.UploadId
        if ( !uploadId ) {
            throw new Error( "Multipart upload did not return uploadId" )
        }

        try {
            const partResult = await client.send( new UploadPartCommand( {
                Bucket: bucketName,
                Key: multipartKey,
                UploadId: uploadId,
                PartNumber: 1,
                Body: partBody,
            } ) )

            const eTag = partResult.ETag
            if ( !eTag ) {
                throw new Error( "Multipart part upload did not return ETag" )
            }

            await client.send( new CompleteMultipartUploadCommand( {
                Bucket: bucketName,
                Key: multipartKey,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: [{ ETag: eTag, PartNumber: 1 }],
                },
            } ) )

            await client.send( new DeleteObjectCommand( {
                Bucket: bucketName,
                Key: multipartKey,
            } ) )
        } catch ( error ) {
            await client.send( new AbortMultipartUploadCommand( {
                Bucket: bucketName,
                Key: multipartKey,
                UploadId: uploadId,
            } ) )
            throw error
        }
    } )
} )
