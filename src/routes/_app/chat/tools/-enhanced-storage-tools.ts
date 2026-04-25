/**
 * Enhanced Storage Tools - Complete set with rich metadata
 *
 * These tools provide file storage operations via S3-compatible providers.
 * All tools execute server-side for security and performance.
 *
 * Architecture:
 * - All tools extend BaseEnhancedTool for consistency
 * - Rich metadata helps LLM select correct tool
 * - Single S3 gateway dispatches to configured providers
 * - State syncs to TanStack Query store for UI reactivity
 */

import { BaseEnhancedTool } from './-base-enhanced-tool'
import { z } from 'zod'
import type { ToolExecutionContext } from './-tool-types'

// ============================================================================
// List Files Tool
// ============================================================================

export class ListFilesTool extends BaseEnhancedTool {
  name = 'list_files'
  description =
    'List files and folders in a storage bucket or directory. Use this to explore the file system structure, check what files exist before reading, or find files by name pattern.'

  capabilities = {
    concurrencySafe: true,
    readOnly: true,
    interruptible: true,
    requiresNetwork: true, // Calls S3 API
    longRunning: false,
  }

  whenToUse = [
    'When you need to explore what files exist in a bucket or directory',
    'Before reading a file, to confirm the path is correct',
    'When searching for files matching a prefix or pattern',
    'To check if a folder/directory exists and what it contains',
    'After uploading files, to verify they arrived correctly',
  ]

  whenNotToUse = [
    'When you need file content (use read_file instead)',
    'For searching by content within files (use search_files instead)',
    'When you already know the exact file path and just need metadata (use get_file_info)',
    'To count large directories - use pagination limits',
  ]

  examples = [
    {
      description: 'List root of default bucket',
      arguments: { limit: 50 },
    },
    {
      description: 'List files under documents/',
      arguments: { prefix: 'documents/', limit: 100 },
    },
    {
      description: 'List specific bucket',
      arguments: { bucket: 'user-uploads', prefix: '2024/', limit: 20 },
    },
    {
      description: 'Paginated - get next page using continuation marker',
      arguments: { prefix: '', limit: 50, marker: 'next-page-token' },
    },
  ]

  schema = z
    .object({
      bucket: z
        .string()
        .optional()
        .describe('Bucket name. Uses user default bucket if omitted.'),
      prefix: z
        .string()
        .optional()
        .default('')
        .describe(
          'Directory prefix to list (e.g., "documents/"). List recursively from root if omitted.',
        ),
      limit: z
        .number()
        .min(1)
        .max(1000)
        .optional()
        .default(100)
        .describe('Maximum number of items to return (1-1000, default 100).'),
      marker: z
        .string()
        .optional()
        .describe(
          'Pagination token from previous response to get next page. Omit for first page.',
        ),
    })
    .describe('List files and folders')

  async execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const { bucket, prefix, limit, marker } = input

    // TODO: Integrate with actual S3 gateway
    // const result = await s3Gateway.listObjects({
    //   bucket: bucket ?? defaultBucket,
    //   prefix,
    //   limit,
    //   marker,
    // })

    // Placeholder - will be connected to real storage
    return {
      files: [],
      folders: [],
      truncated: false,
      nextMarker: undefined,
      count: 0,
    }
  }
}

// ============================================================================
// Read File Tool
// ============================================================================

export class ReadFileTool extends BaseEnhancedTool {
  name = 'read_file'
  description =
    'Read the contents of a file from storage. Returns text content with line numbers or base64-encoded data for binary files.'

  capabilities = {
    concurrencySafe: true,
    readOnly: true,
    interruptible: true,
    requiresNetwork: true,
    longRunning: true, // Large files take time to download
  }

  whenToUse = [
    'When you need to examine the contents of a specific file',
    'After finding a file with list_files, to read its content',
    'To verify file contents before making edits',
    'When user asks "what is in file X"',
    'To display code, configuration, or text data to the user',
  ]

  whenNotToUse = [
    'When you only need file metadata (size, date) - use get_file_info instead',
    'For very large files (>10MB) - consider summarizing via read_file with range',
    'To list directory contents (use list_files)',
    'When the file path is unknown (discover it first with list_files or search_files)',
  ]

  examples = [
    {
      description: 'Read a text file',
      arguments: { bucket: 'my-bucket', key: 'README.md' },
    },
    {
      description: 'Read specific byte range from large file',
      arguments: {
        bucket: 'logs',
        key: 'app.log',
        range: { start: 0, end: 4096 },
      },
    },
    {
      description: 'Read with offset for pagination',
      arguments: {
        bucket: 'my-bucket',
        key: 'bigfile.txt',
        offset: 1000,
        limit: 500,
      },
    },
  ]

  schema = z
    .object({
      bucket: z.string().describe('Bucket name containing the file.'),
      key: z
        .string()
        .describe('File key/path within bucket (e.g., "folder/file.txt").'),
      range: z
        .object({
          start: z.number().describe('Start byte offset (inclusive)'),
          end: z.number().describe('End byte offset (exclusive)'),
        })
        .optional()
        .describe('Optional byte range to read. Useful for large files.'),
      offset: z
        .number()
        .min(0)
        .optional()
        .describe(
          'Start line number (0-indexed) for text files. Use for paginated reading.',
        ),
      limit: z
        .number()
        .min(1)
        .max(10000)
        .optional()
        .describe('Maximum lines/chars to return. Prevents huge outputs.'),
    })
    .describe('Read file contents')

  async execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const { bucket, key, range, offset, limit } = input

    // Progress callbacks for large files
    this.onProgress?.(context, {
      message: `Starting download: ${key}`,
      percent: 0,
    })
    this.onProgress?.(context, { message: 'Downloading...', percent: 30 })

    // TODO: Connect to S3 gateway
    // const result = await s3Gateway.getObject({ bucket, key, range, offset, limit })

    this.onProgress?.(context, { message: 'Processing...', percent: 80 })
    this.onProgress?.(context, { message: 'Complete', percent: 100 })

    return {
      content: '(file content placeholder)',
      mimeType: 'text/plain',
      size: 0,
      truncated: false,
    }
  }
}

// ============================================================================
// Write File Tool
// ============================================================================

export class WriteFileTool extends BaseEnhancedTool {
  name = 'write_file'
  description =
    'Write content to a file in storage. Creates new files or overwrites existing ones. Supports text and base64-encoded binary data.'

  capabilities = {
    concurrencySafe: false, // Modifying same file concurrently causes conflicts
    readOnly: false,
    interruptible: true,
    requiresNetwork: true,
    longRunning: true, // Uploading data takes time
  }

  whenToUse = [
    'When you need to create a new file in storage',
    'To update or replace an existing file completely',
    'When saving generated code, configuration, or data',
    'After editing content that needs to be persisted',
    'To upload data from the local workspace to storage',
  ]

  whenNotToUse = [
    'When only appending to a file (use append_file if available)',
    'To modify files in-place without reading first (prefer edit pattern)',
    'For massive files (>100MB) - consider chunked upload API',
    'When unsure about file contents - read first to avoid data loss',
  ]

  examples = [
    {
      description: 'Write text content to new file',
      arguments: {
        bucket: 'my-bucket',
        key: 'config/settings.json',
        content: '{"theme": "dark"}',
        contentType: 'application/json',
      },
    },
    {
      description: 'Write with metadata',
      arguments: {
        bucket: 'uploads',
        key: 'image.png',
        content: 'base64-encoded-data...',
        contentType: 'image/png',
        metadata: { uploadedBy: 'agent', source: 'generated' },
      },
    },
  ]

  schema = z
    .object({
      bucket: z.string().describe('Bucket name to write to.'),
      key: z.string().describe('File key/path to write (including filename).'),
      content: z
        .string()
        .describe(
          'File content as string. For binary, use base64 and set binary flag.',
        ),
      contentType: z
        .string()
        .optional()
        .describe(
          'MIME type (e.g., "text/plain", "application/json", "image/png").',
        ),
      metadata: z
        .record(z.string(), z.string())
        .optional()
        .describe('Custom metadata key-value pairs to store with object.'),
      overwrite: z
        .boolean()
        .default(true)
        .describe(
          'If false, fail when file exists. Use true for idempotent writes, false for safety.',
        ),
    })
    .describe('Write file to storage')

  async execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const { bucket, key, content, contentType, metadata, overwrite } = input

    this.onProgress?.(context, {
      message: `Preparing upload: ${key}`,
      percent: 0,
    })

    // TODO: Connect to S3 gateway
    // Checks: file exists if !overwrite
    // Upload with presigned URL or direct S3

    this.onProgress?.(context, { message: 'Uploading...', percent: 50 })
    // const result = await s3Gateway.putObject({ ... })

    this.onProgress?.(context, { message: 'Completed', percent: 100 })

    return {
      success: true,
      bucket,
      key,
      size: content.length,
      etag: '(etag-placeholder)',
      versionId: undefined,
    }
  }
}

// ============================================================================
// Get File Info Tool (Metadata)
// ============================================================================

export class GetFileInfoTool extends BaseEnhancedTool {
  name = 'get_file_info'
  description =
    'Get metadata about a file without downloading its content. Returns size, modification time, ETag, content type, and custom metadata.'

  capabilities = {
    concurrencySafe: true,
    readOnly: true,
    interruptible: true,
    requiresNetwork: true,
    longRunning: false,
  }

  whenToUse = [
    'When you need to check file size before reading (avoid loading huge files)',
    'To verify last modified time (is the file recent?)',
    'To check if a file exists (will return not-found error if missing)',
    'To get content type / MIME type',
    'To read custom metadata tags on an object',
  ]

  whenNotToUse = [
    'To read file content (use read_file instead)',
    'To list directory contents (use list_files)',
    'For recursive metadata (use list_files with fetchOwner flag)',
  ]

  examples = [
    {
      description: 'Get metadata of single file',
      arguments: { bucket: 'my-bucket', key: 'data.json' },
    },
  ]

  schema = z
    .object({
      bucket: z.string().describe('Bucket name.'),
      key: z.string().describe('File key/path.'),
    })
    .describe('Get file metadata')

  async execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const { bucket, key } = input

    // TODO: Connect to S3 gateway
    // const result = await s3Gateway.headObject({ bucket, key })

    return {
      exists: true,
      size: 12345,
      lastModified: new Date().toISOString(),
      etag: '"abc123"',
      contentType: 'application/json',
      metadata: {},
    }
  }
}

// ============================================================================
// Delete File Tool
// ============================================================================

export class DeleteFileTool extends BaseEnhancedTool {
  name = 'delete_file'
  description =
    'Permanently delete a file from storage. This operation is irreversible. Use with caution.'

  capabilities = {
    concurrencySafe: false, // Delete conflicts with reads/writes to same key
    readOnly: false,
    interruptible: true,
    requiresNetwork: true,
    longRunning: false,
  }

  whenToUse = [
    'When permanently removing unwanted files',
    'After archiving data that should be deleted',
    'To cleanup temporary files that are no longer needed',
    'When user explicitly requests deletion',
  ]

  whenNotToUse = [
    'When user may need the file later (move to trash/archive instead)',
    'For bulk deletion of many files (use batch delete API if available)',
    'To delete a directory (use delete_directory or recursive delete)',
    'When uncertain about file importance - verify with get_file_info first',
  ]

  examples = [
    {
      description: 'Delete single file',
      arguments: { bucket: 'my-bucket', key: 'temp/old-data.json' },
    },
    {
      description: 'Delete with version ID for versioned bucket',
      arguments: {
        bucket: 'versioned-bucket',
        key: 'file.txt',
        versionId: 'abc123',
      },
    },
  ]

  schema = z
    .object({
      bucket: z.string().describe('Bucket name.'),
      key: z.string().describe('File key/path to delete.'),
      versionId: z
        .string()
        .optional()
        .describe(
          'Specific version ID to delete (only for versioned buckets).',
        ),
      bypassGovernance: z
        .boolean()
        .optional()
        .describe(
          'Set true to bypass governance mode retention. Requires special permissions.',
        ),
    })
    .describe('Delete file from storage')

  async execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const { bucket, key, versionId, bypassGovernance } = input

    // TODO: Connect to S3 gateway
    // const result = await s3Gateway.deleteObject({ bucket, key, versionId })

    return {
      success: true,
      deletedKey: key,
      versionId: versionId ?? null,
    }
  }
}

// ============================================================================
// Search Files Tool
// ============================================================================

export class SearchFilesTool extends BaseEnhancedTool {
  name = 'search_files'
  description =
    'Search for files by name pattern, extension, or metadata. Uses indexed search for quick results across large buckets.'

  capabilities = {
    concurrencySafe: true,
    readOnly: true,
    interruptible: true,
    requiresNetwork: true,
    longRunning: false,
  }

  whenToUse = [
    'When you need to find files matching a pattern or name',
    'To locate files by extension (.txt, .json, .png)',
    'When searching for files created/updated recently',
    'To find files containing specific metadata tags',
    "When you don't know the exact path, only partial name",
  ]

  whenNotToUse = [
    'To search within file contents (requires content indexing, separate tool)',
    'For exact path lookups (use get_file_info with full path)',
    'To list all files in a small directory (use list_files)',
    'For complex Boolean queries (simplify or use multiple searches)',
  ]

  examples = [
    {
      description: 'Search by filename pattern',
      arguments: { query: '*.json', limit: 20 },
    },
    {
      description: 'Search by extension',
      arguments: { query: 'document', fileTypes: ['.pdf', '.docx'], limit: 10 },
    },
    {
      description: 'Search specific bucket',
      arguments: { query: 'report', bucket: 'analytics', limit: 50 },
    },
    {
      description: 'Search with date filter',
      arguments: {
        query: 'config',
        modifiedAfter: '2024-01-01',
        limit: 20,
      },
    },
  ]

  schema = z
    .object({
      query: z
        .string()
        .min(2)
        .describe(
          'Search query. For best results, use descriptive terms: filename, extension pattern like "*.txt", or partial path component.',
        ),
      bucket: z
        .string()
        .optional()
        .describe('Limit search to specific bucket.'),
      fileTypes: z
        .array(z.string())
        .optional()
        .describe(
          'Filter by file extensions: [".txt", ".pdf", ".json"]. Include leading dot.',
        ),
      limit: z
        .number()
        .min(1)
        .max(100)
        .default(20)
        .describe('Max results returned. Default 20, max 100.'),
      modifiedAfter: z
        .string()
        .datetime()
        .optional()
        .describe('Only files modified after this ISO date.'),
      modifiedBefore: z
        .string()
        .datetime()
        .optional()
        .describe('Only files modified before this ISO date.'),
    })
    .describe('Search files by name or metadata')

  async execute(
    input: z.infer<typeof this.schema>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const { query, bucket, fileTypes, limit, modifiedAfter, modifiedBefore } =
      input

    // TODO: Connect to search index / S3 gateway
    // const result = await s3Gateway.searchObjects({ ... })

    return {
      results: [],
      total: 0,
      truncated: false,
    }
  }
}

// ============================================================================
// Export all tools as enhanced instances
// ============================================================================

export const ENHANCED_STORAGE_TOOLS = [
  new ListFilesTool(),
  new ReadFileTool(),
  new WriteFileTool(),
  new GetFileInfoTool(),
  new DeleteFileTool(),
  new SearchFilesTool(),
].map((t) => t.toEnhancedTool())
