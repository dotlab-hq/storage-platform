import { ChatGoogle } from "@langchain/google";

const sttModel = new ChatGoogle( {
    model: "gemini-3.1-flash-lite-preview",
    reasoningEffort:"high",
    responseModalities: ["TEXT", "IMAGE", "AUDIO"],
} );

export { sttModel }