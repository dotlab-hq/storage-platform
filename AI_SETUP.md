# Real AI Integration - Google Gemini Setup

This guide explains how to enable and configure the real AI (Google Gemini) integration in Barrage Chat.

## Quick Start

### 1. Get a Google API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **Create API Key**
3. Copy your new API key

### 2. Set Environment Variable

**For local development**, create `.env.local` in the project root:

```bash
GOOGLE_API_KEY=your_key_here_paste_the_full_key
```

**For Cloudflare Workers**, use:

```bash
wrangler secret put GOOGLE_API_KEY
# Then paste your key when prompted
```

### 3. Restart Your Dev Server

```bash
pnpm dev
```

### 4. Test It

Send a message in the chat. You should now get real AI responses instead of the fallback messages!

## What Changed

The AI integration has been improved to:

✅ **Use proper LangChain message formats** - Messages now use `SystemMessage` and `HumanMessage` types  
✅ **Better error handling** - Errors are logged to console for debugging  
✅ **Optimized for Gemini** - Response extraction works correctly with Gemini's API  
✅ **Clear fallback messages** - If API fails, you get a helpful message instead of generic text  

## Configuration Options

In `src/llm/gemini.llm.ts` and `src/routes/_app/chat/-chat-assistant-reply.ts`:

```bash
# Which Gemini model to use
CHAT_GOOGLE_MODEL=gemini-2.0-flash

# Fallback model
CHAT_GOOGLE_FALLBACK_MODEL=gemini-2.0-flash-lite
```

## Files Modified

- **`src/routes/_app/chat/-chat-assistant-reply.ts`** - Implements real AI calls with proper message format
- **`src/llm/gemini.llm.ts`** - Configures the LangChain ChatGoogle client
- **New: `AI_SETUP.md`** - This setup guide

## Available Gemini Models

- `gemini-2.0-flash` ⭐ **Recommended** - Latest and fastest
- `gemini-2.0-flash-lite` - Lighter weight
- `gemini-1.5-pro` - Most capable
- `gemini-1.5-flash` - Balanced

## Verify It's Working

Check your browser console while chatting:

✅ **No errors** - AI is working  
❌ **`[Chat] LLM Error:`** - There's an issue with the API key or network

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting dummy responses | Make sure `GOOGLE_API_KEY` is set and restart `pnpm dev` |
| "429 Rate Limited" | Free tier limited - upgrade or wait |
| "403 Forbidden" | API key invalid or permissions missing |
| Network errors | Check internet connection and API key validity |

## Free Tier Limits

- 15 requests/minute
- 1 million tokens/day

Perfect for development and testing!

## Security

- ✅ `.env.local` is in `.gitignore` (won't be committed)
- ✅ Never share your API key
- ✅ Rotate keys periodically
- ✅ For production, use Cloudflare Secrets

## Need Help?

- Check logs: `pnpm dev` shows real-time error messages
- Verify API key: https://aistudio.google.com/apikey
- LangChain docs: https://js.langchain.com/docs/integrations/chat/google_generativeai
