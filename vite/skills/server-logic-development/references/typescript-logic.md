# TypeScript Server Logic Reference

Spec for `create-typescript-server-logic`. Pair with `SKILL.md` + `cache-and-connectors.md`.

## Tool parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Identifier — becomes filename + API path |
| `description` | string | yes | What this server logic returns |
| `handlerPath` | string | yes | Relative path to `.ts` handler (from server-logic dir) |
| `handlerCode` | string | yes | TypeScript handler source |
| `parameters` | ParameterMeta[] | no | Parameter definitions (for metadata) |
| `cache` | CacheConfig | no | See `cache-and-connectors.md` |
| `title` | string | no | Display title |
| `response` | ServerLogicResponse | no | Response schema (usually auto-inferred — omit unless overriding) |

## Handler format

Export a default async function taking Hono `Context`, returning `Response`.

```typescript
import type { Context } from "hono";

export default async function handler(c: Context) {
  const { params } = await c.req.json();

  // ... call APIs, compute data ...

  return new Response(JSON.stringify(/* body */), {
    headers: { "Content-Type": "application/json" },
  });
}
```

## Handler rules

- Default async export, signature `(c: Context)` — import `Context` from `"hono"`.
- Access params via `const { params } = await c.req.json()` — POST body is `{ params: { ... } }` matching `parameters` definitions.
  - **Exception** — chat handlers using `useChat` receive `{ messages }` directly. See `chat-app-development`.
- Return `Response` directly (`new Response(JSON.stringify(...))`) — server passes through.
- Non-SQL connectors: `connection()` from `@squadbase/vite-server/connectors/<type>` (see `cache-and-connectors.md`).
- `handlerPath` relative to server-logic dir, points to `.ts` within it (no path traversal).
- Handlers have full Node.js access including `process.env`.

## Parameter definition

```typescript
interface ParameterMeta {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required?: boolean;                     // Default: false
  default?: string | number | boolean;
}
```

Missing param → uses `default` if set, else `null`.

## Response shape

TS server logics return handler's `Response` as-is — shape is whatever you put inside.

Frontend (no `data` wrapper unless added):

```tsx
const json = await res.json();
return json as DashboardSummary;
```

## Schema auto-inference

Tool infers response schema from test results — usually no manual `response` spec needed. Override only when:

- Test data doesn't cover all return shapes
- You want stricter typing than inferred
- Handler returns `ReadableStream` (chat streaming) — see `chat-app-development`
