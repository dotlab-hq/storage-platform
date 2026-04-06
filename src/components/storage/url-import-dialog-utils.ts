export type KeyValue = {
  key: string
  value: string
}

export function parsePairs(raw: string): KeyValue[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  return lines
    .map((line) => {
      const separatorIndex = line.indexOf(':')
      if (separatorIndex <= 0) {
        return null
      }
      return {
        key: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      }
    })
    .filter((entry): entry is KeyValue => entry !== null)
}
