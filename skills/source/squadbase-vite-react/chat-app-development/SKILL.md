---
name: chat-app-development
description: LLM chat application patterns — TypeScript data source backend with streaming, Vercel AI SDK frontend integration
---

# Chat App Development Guide

Build LLM-powered chat applications using TypeScript data source handlers as the backend and Vercel AI SDK + React as the frontend.

## Architecture

```
Frontend (React)              Backend (TypeScript data source handler)
┌──────────────┐   POST       ┌──────────────────────┐        ┌──────────┐
│ useChat hook │ ──────────── │ /api/data-source/chat │ ────── │ LLM API  │
│ (ai/react)   │   streaming  │ (handler.ts)          │        │ (OpenAI) │
└──────────────┘ ◄─────────── └──────────────────────┘        └──────────┘
```

- **Backend**: TypeScript data source handler → streams LLM responses via `Response` passthrough
- **Frontend**: Vercel AI SDK `useChat` hook → manages conversation state and streaming automatically

## Dependencies

Install Vercel AI SDK and the OpenAI provider:

```bash
npm install ai @ai-sdk/openai
```

## Backend: Data Source JSON Definition

Create `data-source/chat.json`:

```json
{
  "description": "LLM chat endpoint with streaming responses",
  "type": "typescript",
  "handlerPath": "./chat.ts"
}
```

**Important**: Do NOT add a `cache` field — chat responses are non-deterministic and streaming, so caching must be disabled.

## Backend: Handler Implementation (Streaming)

Create `data-source/chat.ts`:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(c) {
  const body = await c.req.json();
  const { messages } = body;

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
```

**Key points:**
- Handler receives Hono Context `c` as its parameter — use `c.req.json()` to read the request body
- `useChat` sends `{ messages: [...] }` directly in the body (NOT wrapped in `{ params: {} }`)
- `streamText().toDataStreamResponse()` returns a standard `Response` with a `ReadableStream` body — the server passes it through unchanged

### Alternative: Using Squadbase OpenAI Connector

If you have an OpenAI connection configured in `.squadbase/connections.json`:

```typescript
import { connection } from "@squadbase/vite-server/connectors/openai";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export default async function handler(c) {
  const client = connection("my-openai-connection");
  const openai = createOpenAI({ apiKey: client.apiKey });

  const body = await c.req.json();
  const { messages } = body;

  const result = streamText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Backend: Non-Streaming Alternative

For simple use cases where streaming is not needed:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(c) {
  const body = await c.req.json();
  const { messages } = body;

  const { text } = await generateText({
    model: openai("gpt-4o"),
    system: "You are a helpful assistant.",
    messages,
  });

  return new Response(JSON.stringify({ data: { reply: text } }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## Frontend: Chat Page with useChat

Create `src/pages/chat.tsx`:

```tsx
import { useChat } from "ai/react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/data-source/chat",
  });

  return (
    <div className="container mx-auto max-w-3xl p-8">
      <Card className="flex h-[600px] flex-col">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && <Skeleton className="h-12 w-3/4" />}
          {error && <p className="text-destructive">{error.message}</p>}
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
```

### Passing Additional Parameters

Use the `body` option to send extra data alongside messages:

```tsx
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: "/api/data-source/chat",
  body: {
    model: "gpt-4o-mini",
    temperature: 0.7,
  },
});
```

Access these in the handler:

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

## Complete File Tree

```
data-source/
  chat.json          # Data source definition (type: "typescript")
  chat.ts            # TypeScript handler (streamText + toDataStreamResponse)
src/
  pages/
    chat.tsx          # Chat page (useChat hook)
```

## Important Notes

1. **No caching**: Never add `cache` to chat data source JSON — streaming responses are not cacheable.
2. **Handler signature**: Chat handlers receive Hono Context `c` — use `c.req.json()` to access the full request body.
3. **Body format**: `useChat` sends `{ messages: [...] }` directly in the POST body, NOT in `{ params: {} }`. Read messages from `body.messages`, not `body.params.messages`.
4. **Streaming passthrough**: `toDataStreamResponse()` returns a standard `Response` — the server passes it through to the client unchanged.
5. **Environment variables**: Set `OPENAI_API_KEY` in your `.env` file. Handlers have full access to `process.env`.
6. **Other LLM providers**: Replace `@ai-sdk/openai` with `@ai-sdk/anthropic`, `@ai-sdk/google`, etc. The `streamText()` and `useChat()` patterns remain the same.
