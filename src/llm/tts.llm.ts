import { ChatGoogle } from '@langchain/google'

const TtsModel = new ChatGoogle({
  model: 'gemini-3.1-flash-tts-preview',
  responseModalities: ['AUDIO', 'TEXT'],
  speechConfig: 'Zubenelgenubi', // Prebuilt voice name
})

export { TtsModel }
