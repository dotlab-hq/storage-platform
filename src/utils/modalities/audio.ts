import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { HumanMessage, SystemMessage, type AIMessage } from '@langchain/core/messages'
import { sttModel } from '@/llm/stt.llm'
import { TtsModel } from '@/llm/tts.llm'
import { trimReasoning } from '@/utils/trimReasoning'

function toWav(buf: Uint8Array) {
    const sampleRate = 24000
    const numChannels = 1
    const bitsPerSample = 16

    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8
    const blockAlign = (numChannels * bitsPerSample) / 8

    const header = new ArrayBuffer(44)
    const view = new DataView(header)

    const writeStr = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i))
        }
    }

    writeStr(0, 'RIFF')
    view.setUint32(4, 36 + buf.length, true)
    writeStr(8, 'WAVE')

    writeStr(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitsPerSample, true)

    writeStr(36, 'data')
    view.setUint32(40, buf.length, true)

    return new Uint8Array([...new Uint8Array(header), ...buf])
}

const RETRY_LIMIT = 3
const AUDIO_OUTPUTS = 'outputs'

export const generateAudio = async (text: string, count = 0): Promise<string> => {
    /*
    Type any text and a audio is generated and saved to disk, the path is returned.
    */
        const res = await TtsModel.invoke(`Say: ${text}`)

        const audioBlocks = res.contentBlocks.filter(
            (obj: { type?: string }) => ['audio', 'file'].includes(obj.type ?? ''),
        )

    if (count > RETRY_LIMIT) {
        throw new Error('No audio output after retries')
    }

    if (audioBlocks.length !== 1) {
        return generateAudio(text, count + 1)
    }

    const block = audioBlocks[0] as {
      data?: Uint8Array | string
    }

    // 🔥 handle different formats
    let buf: Uint8Array;

    if (block.data instanceof Uint8Array) {
        buf = block.data
    } else if (typeof block.data === 'string') {
        buf = new Uint8Array(Buffer.from(block.data, 'base64'))
    } else {
        throw new Error('Unsupported audio format')
    }

    const wavData = toWav(buf)

    const filePath = `${AUDIO_OUTPUTS}/audio-${Date.now()}.wav`
    await mkdir(dirname(filePath), { recursive: true })
    await writeFile(filePath, wavData)

    return filePath
}

function detectMimeTypeFromPath(path: string): string {
  if (path.endsWith('.wav')) return 'audio/wav'
  if (path.endsWith('.mp3')) return 'audio/mpeg'
  if (path.endsWith('.ogg')) return 'audio/ogg'
  if (path.endsWith('.m4a')) return 'audio/mp4'
  return 'application/octet-stream'
}

export const transcribeAudio = async (
    audioPath: string,
    count = 0
): Promise<string> => {
    const file = await readFile(audioPath)
    const base64 = Buffer.from(file).toString('base64')
    const mimeType = detectMimeTypeFromPath(audioPath)

    const res = (await sttModel.invoke([
        new SystemMessage(
            'You are a helpful assistant that transcribes audio files. Return only the transcription text, no extra commentary.'
        ),
        new HumanMessage({
            contentBlocks: [
                {
                    type: 'file',
                    data: base64,
                    mimeType: mimeType,
                }
            ]
        })
    ])) as AIMessage

    const text = trimReasoning(res)

    if (text) return text

    if (count >= RETRY_LIMIT) {
        throw new Error('No transcription after retries')
    }

    return transcribeAudio(audioPath, count + 1)
}