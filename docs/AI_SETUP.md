# AI Integration Setup Guide

This guide explains how to set up and use the real AI integration with Google Gemini in Barrage Chat.

## Overview

Barrage Chat uses **Google Gemini** as the LLM (Large Language Model) provider for generating intelligent responses. The integration uses LangChain's `ChatGoogle` for seamless API interaction.

## Getting Started

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the **Google AI API** (for Gemini):
   - Go to **APIs & Services** → **Library**
   - Search for "Generative Language API"
   - Click **Enable**

### 2. Create an API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the generated API key

### 3. Set the Environment Variable

#### For Local Development

Create or update your `.env.local` file in the project root:

```bash
GOOGLE_API_KEY=your_api_key_here
```

Or set it via terminal:

```bash
export GOOGLE_API_KEY=your_api_key_here
```

#### For Production (Cloudflare Workers)

Add the secret to your Cloudflare Workers deployment:

```bash
# Option 1: Using wrangler
wrangler secret put GOOGLE_API_KEY

# Option 2: Manual entry in Cloudflare Dashboard
# Dashboard → Workers & Pages → Your Project → Settings → Environment Variables
```

### 4. Verify Setup (Optional)

Run the development server:

```bash
pnpm dev
```

Then visit the chat page and send a message. The AI should respond with real Gemini responses instead of fallback messages.

## Configuration

### Model Selection

You can customize which Gemini models are used by setting these environment variables:

```bash
# Primary model (used first)
CHAT_GOOGLE_MODEL=gemini-2.0-flash

# Fallback model (if primary fails)
CHAT_GOOGLE_FALLBACK_MODEL=gemini-2.0-flash-lite
```

**Available Models:**

- `gemini-2.0-flash` - Latest, fastest, best for general use
- `gemini-2.0-flash-lite` - Lighter weight alternative
- `gemini-1.5-pro` - More capable, higher latency
- `gemini-1.5-flash` - Balanced performance

### Response Parameters

The AI response is configured with:

- **Temperature**: `0.3` (Lower = more deterministic, 0.3 is good for practical answers)
- **Top P**: `0.9` (Nucleus sampling)
- **Top K**: `40` (Consider top 40 tokens)
- **Max Tokens**: `1024` (Limit response length)

You can modify these in `src/llm/gemini.llm.ts` if needed.

## How It Works

### Message Flow

1. User sends a message via the chat input
2. Message is stored in the database
3. `generateAssistantReply()` is called with the user's message
4. The function:
   - Creates a system message ("You are Barrage Chat...")
   - Combines it with the user message
   - Calls Google Gemini API via LangChain
   - Extracts text from the response
   - Returns the assistant's response
5. Assistant message is stored in the database
6. Response appears in the chat UI

### Error Handling

If the API call fails (missing key, quota exceeded, network error):

- An error is logged to the console
- A helpful message is shown to the user indicating they should check API configuration
- The chat continues to function (graceful degradation)

## Troubleshooting

### Problem: "API Key not found" warning

**Solution**: Ensure `GOOGLE_API_KEY` is set in your environment:

```bash
# Check if variable is set
echo $GOOGLE_API_KEY

# Set it if missing
export GOOGLE_API_KEY=your_key_here
```

### Problem: 429 Rate Limited errors

**Solution**: You may have exceeded the free tier quota. Options:

1. Wait for the quota to reset
2. Upgrade to a paid Google Cloud plan
3. Reduce request frequency in your app

### Problem: 403 Forbidden errors

**Solution**: API key may not have proper permissions:

1. Verify the Generative Language API is enabled
2. Check API key restrictions in Cloud Console
3. Regenerate the API key if needed

### Problem: Responses still look like fallback text

**Solution**: Check server logs during development:

```bash
# The console should show:
# [Chat] LLM Error: ... if there's an issue
# Or successful responses with real AI content
```

## Security Considerations

- **Never commit API keys** to version control
- Use `.env.local` for local development (already in `.gitignore`)
- For Cloudflare Workers, use the `wrangler secret` command
- Rotate API keys periodically
- Monitor usage in Google Cloud Console

## Cost

Google's free tier includes:

- 15 requests per minute
- 1 million tokens per day

This is usually sufficient for personal/small team use. Check [Google AI Pricing](https://ai.google.dev/pricing) for larger deployments.

## Next Steps

1. Set up your API key
2. Test by sending a message in the chat
3. Check the browser console for any errors
4. Monitor logs: `pnpm dev` will show any LLM errors
5. Customize the system prompt in `src/routes/_app/chat/-chat-assistant-reply.ts` if desired

## References

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [LangChain ChatGoogle](https://js.langchain.com/docs/integrations/chat/google_generativeai)
- [Google Cloud API Keys](https://cloud.google.com/docs/authentication/api-keys)
