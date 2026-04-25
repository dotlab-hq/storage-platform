---
name: langchain-short-memory
description: Implement and tune short-term memory for LangChain/LangGraph chat agents, including thread-level persistence, trimming, deletion, and summarization patterns when conversation history grows.
---

# LangChain Short-Term Memory

Use this skill when a user asks for thread memory, conversation context retention, or common short-memory patterns.

## Scope

- Thread-scoped memory (`thread_id`) for multi-turn conversations.
- Memory lifecycle patterns: append, trim, summarize, selective delete.
- Practical defaults that avoid context bloat.

## Recommended baseline

1. Persist short-term state by thread.
2. Keep a capped recent message window.
3. Summarize older turns once a threshold is reached.
4. Keep deletion support for explicit forgetting.

## Common patterns

### Trim messages

- Keep the latest N meaningful messages.
- Preserve the initial system intent where possible.
- Apply trim before model execution.

### Delete messages

- Remove explicit message IDs when users ask to forget content.
- Validate resulting history is still model-valid.

### Summarize messages

- Trigger summarization after a message threshold.
- Replace early turns with a compact summary and keep recent turns verbatim.

## Minimal TypeScript example

```ts
import { createAgent, summarizationMiddleware } from "langchain";
import { MemorySaver } from "@langchain/langgraph";

const agent = createAgent({
  model: "gpt-4.1",
  tools: [],
  middleware: [
    summarizationMiddleware({
      model: "gpt-4.1-mini",
      trigger: { tokens: 4000 },
      keep: { messages: 20 },
    }),
  ],
  checkpointer: new MemorySaver(),
});
```
