export type CompletedMultipartPart = {
  partNumber: number
  eTag: string
}

function decodeXmlEntities(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

export function parseCompleteMultipartUploadParts(
  xml: string,
): CompletedMultipartPart[] {
  const partMatches = Array.from(xml.matchAll(/<Part>([\s\S]*?)<\/Part>/g))
  if (partMatches.length === 0) {
    return []
  }

  const parts: CompletedMultipartPart[] = []
  for (const match of partMatches) {
    const body = match[1]
    const partNumberMatch = body.match(/<PartNumber>\s*(\d+)\s*<\/PartNumber>/)
    const eTagMatch = body.match(/<ETag>\s*([\s\S]*?)\s*<\/ETag>/)
    if (!partNumberMatch || !eTagMatch) {
      throw new Error(
        'MalformedXML: each Part must include ETag and PartNumber',
      )
    }

    const partNumber = Number.parseInt(partNumberMatch[1], 10)
    if (!Number.isInteger(partNumber) || partNumber < 1) {
      throw new Error('InvalidPart: PartNumber must be a positive integer')
    }

    const eTag = decodeXmlEntities(eTagMatch[1].trim())
    if (eTag.length === 0) {
      throw new Error('InvalidPart: ETag cannot be empty')
    }

    parts.push({ partNumber, eTag })
  }

  return parts
}
