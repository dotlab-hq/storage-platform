import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getProviderClientById } from '@/lib/s3-provider-client'
import type { FileSummaryTarget } from './types'

function toUint8Array(chunk: unknown): Uint8Array | null {
  if (chunk instanceof Uint8Array) {
    return chunk
  }

  if (typeof Buffer !== 'undefined' && chunk instanceof Buffer) {
    return new Uint8Array(chunk)
  }

  return null
}

function decodeUtf8WithReplacement(bytes: Uint8Array): string {
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export async function loadTextExcerptForSummary(
  target: FileSummaryTarget,
  maxTextBytes: number,
): Promise<{ text: string; bytesRead: number; wasTruncated: boolean }> {
  if (!target.providerId || !target.bucketName) {
    return { text: '', bytesRead: 0, wasTruncated: false }
  }

  const { client } = await getProviderClientById(target.providerId)
  const response = await client.send(
    new GetObjectCommand({
      Bucket: target.bucketName,
      Key: target.objectKey,
      Range: `bytes=0-${Math.max(0, maxTextBytes - 1)}`,
    }),
  )

  if (!response.Body) {
    return { text: '', bytesRead: 0, wasTruncated: false }
  }

  const body = response.Body as {
    [Symbol.asyncIterator]?: () => AsyncIterator<unknown>
  }
  if (!body[Symbol.asyncIterator]) {
    return { text: '', bytesRead: 0, wasTruncated: false }
  }

  const chunks: Uint8Array[] = []
  let totalRead = 0

  for await (const rawChunk of body as AsyncIterable<unknown>) {
    const chunk = toUint8Array(rawChunk)
    if (!chunk || chunk.byteLength === 0) {
      continue
    }

    const spaceLeft = maxTextBytes - totalRead
    if (spaceLeft <= 0) {
      break
    }

    if (chunk.byteLength <= spaceLeft) {
      chunks.push(chunk)
      totalRead += chunk.byteLength
    } else {
      chunks.push(chunk.slice(0, spaceLeft))
      totalRead += spaceLeft
      break
    }
  }

  if (chunks.length === 0) {
    return { text: '', bytesRead: 0, wasTruncated: false }
  }

  const merged = new Uint8Array(totalRead)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }

  const text = decodeUtf8WithReplacement(merged)
  const wasTruncated =
    typeof target.sizeInBytes === 'number' && target.sizeInBytes > totalRead

  return {
    text,
    bytesRead: totalRead,
    wasTruncated,
  }
}
