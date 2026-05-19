# Handler Patterns Reference

Alternatives to the default streaming handler ([`../examples/streaming-handler.ts`](../examples/streaming-handler.ts)).

## Squadbase OpenAI connector

When you have an OpenAI connection in `.squadbase/connections.json`, resolve the key via `connection()` instead of `process.env`. Full: [`../examples/connector-handler.ts`](../examples/connector-handler.ts).

```typescript
import { connection } from "@squadbase/vite-server/connectors/openai";
import { createOpenAI } from "@ai-sdk/openai";

const client = connection("my-openai-connection");
const openai = createOpenAI({ apiKey: client.apiKey });
```

Rest of the handler (parse `messages`, call `streamText`, return `toDataStreamResponse()`) is identical to default.

## Non-streaming

For one-shot completions / scheduled tasks, use `generateText` and return JSON. Full: [`../examples/nonstreaming-handler.ts`](../examples/nonstreaming-handler.ts).

- ✅ Simpler frontend — plain `fetch`, no `useChat`
- ❌ User waits for full completion before seeing anything
- ❌ Loses conversational streaming UX

Choose only when response is short and latency acceptable.

## Extra parameters

`useChat` can send extra fields alongside `messages` via `body` (see [`frontend-patterns.md`](./frontend-patterns.md)). Destructure in handler:

```typescript
export default async function handler(c) {
  const body = await c.req.json();
  const { messages, model, temperature } = body;

  const result = streamText({
    model: openai(model ?? "gpt-4o"),
    messages,
    temperature: temperature ?? 1,
  });

  return result.toDataStreamResponse();
}
```

Common extras: `model`, `temperature`, `system` (per-call override), `userId` (auth), `conversationId` (persistence).

## Other LLM providers

Swap `@ai-sdk/openai` for the matching provider:

| Provider | Package | Factory |
|----------|---------|---------|
| Anthropic | `@ai-sdk/anthropic` | `createAnthropic` |
| Google | `@ai-sdk/google` | `createGoogleGenerativeAI` |
| Mistral | `@ai-sdk/mistral` | `createMistral` |

`streamText()` / `generateText()` and frontend `useChat()` remain identical — only the factory changes.
