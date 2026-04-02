import { beforeEach, describe, expect, it, vi } from "vitest"
import type { BucketContext } from "./s3-context"
import type { AttemptRow } from "./upload-reconciliation-types"
import { resolvePendingGetObject } from "./s3-object-pending-resolution"

const mocks = vi.hoisted( () => ( {
    findUploadAttemptByObjectKeyMock: vi.fn(),
    finalizeUploadAttemptMock: vi.fn(),
    isUploadExpiredMissingErrorMock: vi.fn(),
} ) )

vi.mock( "./upload-reconciliation-queries", () => ( {
    findUploadAttemptByObjectKey: mocks.findUploadAttemptByObjectKeyMock,
} ) )

vi.mock( "./upload-reconciliation", () => ( {
    finalizeUploadAttempt: mocks.finalizeUploadAttemptMock,
    isUploadExpiredMissingError: mocks.isUploadExpiredMissingErrorMock,
} ) )

function makeAttempt( status: AttemptRow["status"] ): AttemptRow {
    const now = new Date()
    return {
        id: "attempt-1",
        userId: "user-1",
        providerId: "provider-1",
        objectKey: "file.txt",
        upstreamObjectKey: "s3/user-1/bucket-1/file.txt",
        expectedSize: 1,
        contentType: "text/plain",
        status,
        expiresAt: new Date( now.getTime() + 30_000 ),
        createdAt: now,
        completedAt: null,
        errorMessage: status === "failed" ? "Upload expired and object missing" : null,
        lastCheckedAt: null,
        nextCheckAfter: null,
        mappedFolderId: null,
    }
}

describe( "s3 object pending resolution", () => {
    beforeEach( () => {
        vi.clearAllMocks()
    } )

    const bucket: BucketContext = {
        userId: "user-1",
        bucketId: "bucket-1",
        bucketName: "bucket",
        createdAt: new Date(),
        mappedFolderId: null,
    }

    it( "returns null for failed attempt so dispatcher can emit NoSuchKey", async () => {
        mocks.findUploadAttemptByObjectKeyMock.mockResolvedValueOnce( makeAttempt( "failed" ) )

        const response = await resolvePendingGetObject(
            bucket,
            "file.txt",
            { ifModifiedSince: null, ifNoneMatch: null },
            async () => new Response( null, { status: 200 } ),
        )

        expect( response ).toBeNull()
    } )
} )
