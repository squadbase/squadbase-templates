---
name: chat-app-development
description: LLM chat application patterns with streaming. Read when implementing a chat UI, an LLM streaming endpoint, or integrating Vercel AI SDK (useChat) into the Squadbase Vite template.
---

# Chat App Development Guide

LLM chat: TypeScript server logic handler + Vercel AI SDK `useChat` frontend.

Minimal setup below. Full handler / page code in `examples/`. Alternatives (non-streaming, connector, extra params, error UI) in `references/`.

## Architecture

```
Frontend (React)              Backend (TS server logic handler)
┌──────────────┐   POST       ┌───────────────────────┐        ┌──────────┐
│ useChat hook │ ──────────── │ /api/server-logic/chat│ ────── │ LLM API  │
│ (ai/react)   │   streaming  │ (handler.ts)          │        │ (OpenAI) │
└──────────────┘ ◄─────────── └───────────────────────┘        └──────────┘
```

- Backend: returns `streamText().toDataStreamResponse()` — `Response` passes through.
- Frontend: `useChat` manages state + stream consumption.

## Dependencies

```bash
npm install ai @ai-sdk/openai
```

## Minimal setup (3 files)

1. **`server-logic/chat.json`** — **no `cache` field** (streams not cacheable):

   ```json
   {
     "description": "LLM chat endpoint with streaming responses",
     "type": "typescript",
     "handlerPath": "./chat.ts"
   }
   ```

2. **`server-logic/chat.ts`** — copy [`examples/streaming-handler.ts`](./examples/streaming-handler.ts) (`streamText` + `toDataStreamResponse()`).

3. **`src/pages/chat.tsx`** — copy [`examples/chat-page.tsx`](./examples/chat-page.tsx) (`useChat({ api: "/api/server-logic/chat" })`).

Set `OPENAI_API_KEY` in `.env`. Wire the page into `routes.tsx`.

## File tree

```
server-logic/
  chat.json          # type: "typescript", no cache
  chat.ts            # streamText + toDataStreamResponse
src/
  pages/
    chat.tsx         # useChat hook
```

## Important Notes

1. **No caching** — never add `cache` to chat server logic JSON. Streams aren't cacheable.
2. **Handler signature** — Hono `Context` `c`; read body via `c.req.json()`.
3. **Body format** — `useChat` sends `{ messages: [...] }` directly (NOT `{ params: {} }`). Read as `body.messages`, not `body.params.messages`. Differs from standard server logic — see `server-logic-development`.
4. **Streaming passthrough** — `toDataStreamResponse()` returns standard `Response`; server passes through unchanged.
5. **Env vars** — handlers have `process.env`. For shared connections use `connection()` instead — see [`references/handler-patterns.md`](./references/handler-patterns.md).
6. **Other LLM providers** — swap `@ai-sdk/openai` for `@ai-sdk/anthropic`, `@ai-sdk/google`, etc. Patterns identical.

---

## References

- [`examples/streaming-handler.ts`](./examples/streaming-handler.ts) — default streaming handler
- [`examples/chat-page.tsx`](./examples/chat-page.tsx) — minimal `useChat` page
- [`examples/nonstreaming-handler.ts`](./examples/nonstreaming-handler.ts) — `generateText` variant
- [`examples/connector-handler.ts`](./examples/connector-handler.ts) — Squadbase OpenAI connector variant
- [`references/handler-patterns.md`](./references/handler-patterns.md) — non-streaming / connector / extra-params / other-provider variants
- [`references/frontend-patterns.md`](./references/frontend-patterns.md) — `useChat` body params, error UI, stop / reload / clear, initial messages, markdown

## Related skills

- `server-logic-development` — general server-logic conventions. Chat is a streaming special case; read when defining `chat.json` or custom params.
- `component-generation` — page creation order (Skeleton placeholders before child imports).
