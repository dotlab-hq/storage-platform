import { beforeEach, describe, expect, it, vi } from "vitest"
import { finalizeUploadAttempt } from "./upload-reconciliation"
import { resolveUploadStatus, verifyExpiredPendingUploads } from "./upload-reconciliation-status"
import type { AttemptRow } from "./upload-reconciliation-types"

const mocks = vi.hoisted( () => ( {
    findAttemptMock: vi.fn<( userId: string, uploadId: string ) => Promise<AttemptRow | null>>(),
    listExpiredPendingAttemptRefsMock: vi.fn<( cutoff: Date, now: Date, limit: number ) => Promise<Array<{ id: string; userId: string }>>>(),
    markFailedMock: vi.fn<( attemptId: string, errorMessage: string, now: Date ) => Promise<void>>(),
    markUploadedMock: vi.fn<( attemptId: string, eTag: string | null ) => Promise<void>>(),
    touchCheckScheduleMock: vi.fn<( attemptId: string, now: Date, recheckMs: number ) => Promise<void>>(),
    getProviderClientByIdMock: vi.fn(),
    upsertCommittedFileMock: vi.fn(),
    findCommittedFileMock: vi.fn(),
} ) )

vi.mock( "./upload-reconciliation-queries", () => ( {
    findAttempt: mocks.findAttemptMock,
    listExpiredPendingAttemptRefs: mocks.listExpiredPendingAttemptRefsMock,
    markFailed: mocks.markFailedMock,
    markUploaded: mocks.markUploadedMock,
    touchCheckSchedule: mocks.touchCheckScheduleMock,
} ) )

vi.mock( "@/lib/s3-provider-client", () => ( {
    getProviderClientById: mocks.getProviderClientByIdMock,
} ) )

vi.mock( "./upload-file-records", () => ( {
    upsertCommittedFile: mocks.upsertCommittedFileMock,
    findCommittedFile: mocks.findCommittedFileMock,
} ) )

function buildPendingAttempt( override: Partial<AttemptRow> = {} ): AttemptRow {
    const now = new Date()
    return {
        id: "attempt-1",
        userId: "user-1",
        providerId: "provider-1",
        objectKey: "file.txt",
        upstreamObjectKey: "s3/user-1/bucket-1/file.txt",
        expectedSize: 123,
        contentType: "text/plain",
        status: "pending",
        expiresAt: new Date( now.getTime() + 60_000 ),
        createdAt: now,
        completedAt: null,
        errorMessage: null,
        lastCheckedAt: null,
        nextCheckAfter: null,
        mappedFolderId: null,
        ...override,
    }
}

describe( "upload reconciliation", () => {
    beforeEach( () => {
        vi.clearAllMocks()
    } )

    it( "returns uploading without provider HEAD when nextCheckAfter is in future", async () => {
        const attempt = buildPendingAttempt( { nextCheckAfter: new Date( Date.now() + 30_000 ) } )
        mocks.findAttemptMock.mockResolvedValueOnce( attempt )

        const result = await resolveUploadStatus( attempt.userId, attempt.id )

        expect( result.status ).toBe( "uploading" )
        expect( result.internalStatus ).toBe( "pending" )
        expect( mocks.getProviderClientByIdMock ).not.toHaveBeenCalled()
    } )

    it( "finalizes pending upload to ready when HEAD succeeds with matching size", async () => {
        const attempt = buildPendingAttempt()
        const committed = {
            id: "file-1",
            name: "file.txt",
            objectKey: attempt.upstreamObjectKey,
            sizeInBytes: 123,
            providerId: attempt.providerId,
            etag: "abc",
            cacheControl: null,
            lastModified: new Date(),
        }
        mocks.findAttemptMock.mockResolvedValueOnce( attempt )
        mocks.getProviderClientByIdMock.mockResolvedValueOnce( {
            bucketName: "bucket",
            client: { send: vi.fn().mockResolvedValue( { ContentLength: 123, ETag: "\"abc\"" } ) },
        } )
        mocks.upsertCommittedFileMock.mockResolvedValueOnce( committed )

        const result = await finalizeUploadAttempt( attempt.userId, attempt.id )

        expect( result.id ).toBe( committed.id )
        expect( mocks.markUploadedMock ).toHaveBeenCalled()
        expect( mocks.markFailedMock ).not.toHaveBeenCalled()
    } )

    it( "marks upload failed after expiry cutoff when object is still missing", async () => {
        const attempt = buildPendingAttempt( { expiresAt: new Date( Date.now() - ( 3 * 60 * 1000 ) ) } )
        mocks.findAttemptMock.mockResolvedValueOnce( attempt )

        await expect( finalizeUploadAttempt( attempt.userId, attempt.id ) ).rejects.toThrow( "expired" )
        expect( mocks.markFailedMock ).toHaveBeenCalledWith( attempt.id, "Upload expired and object missing", expect.any( Date ) )
    } )

    it( "verifies expired attempts and reports failed when reconcile result is failed", async () => {
        const attempt = buildPendingAttempt( { id: "attempt-verify", expiresAt: new Date( Date.now() - ( 3 * 60 * 1000 ) ) } )
        mocks.listExpiredPendingAttemptRefsMock.mockResolvedValueOnce( [ { id: attempt.id, userId: attempt.userId } ] )
        mocks.findAttemptMock
            .mockResolvedValueOnce( attempt )
            .mockResolvedValueOnce( { ...attempt, status: "failed", errorMessage: "Upload expired and object missing" } )

        const summary = await verifyExpiredPendingUploads( 10 )

        expect( summary.scanned ).toBe( 1 )
        expect( summary.failed ).toBe( 1 )
        expect( summary.ready ).toBe( 0 )
    } )
} )
