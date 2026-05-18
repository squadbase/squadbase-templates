---
name: server-logic-development
description: Specification and implementation conventions for SQL / TypeScript server logic. Read when creating or editing a server logic, and before implementing any frontend code that calls one.
---

# Server Logic Development Guide

For `create-sql-server-logic` and `create-typescript-server-logic`. Full spec — tools, workflow, SQL / TS handler rules, cache, non-SQL connectors.

---

## Tools

| Tool | Purpose |
|------|---------|
| `listConnections` | List available DB connections + IDs |
| `create-sql-server-logic` | Create SQL server logic |
| `create-typescript-server-logic` | Create TypeScript server logic |
| `testFetchServerLogic` | Run with sample params, inspect response (end-to-end check) |
| `listServerLogics` | List existing |
| `editServerLogic` | Modify existing |
| `deleteServerLogic` | Remove |

## Workflow

1. **Discover connections** → `listConnections` for `connectionId` values
2. **Design query / handler** — see SQL / TS sections below
3. **Create** → `create-sql-server-logic` or `create-typescript-server-logic`
4. **Test** → `testFetchServerLogic` with sample params

Tools auto-handle: JSON definition write, response schema inference from test results, server auto-reload.

---

## SQL server logic

### Minimal skeleton

```sql
SELECT id, name, created_at
FROM orders
WHERE created_at >= {{start_date}}
ORDER BY created_at DESC
LIMIT {{limit}}
```

Parameters:

```json
[
  { "name": "start_date", "type": "string", "description": "ISO date string", "required": true },
  { "name": "limit",      "type": "number", "description": "Max rows",        "default": 100 }
]
```

### Tool parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Identifier — becomes filename + API path |
| `description` | string | yes | What this server logic returns |
| `query` | string | yes | SQL with `{{paramName}}` placeholders |
| `connectionId` | string | yes | Connection ID from `listConnections` |
| `parameters` | ParameterMeta[] | no | Query parameter definitions (below) |
| `cache` | CacheConfig | no | See Cache section |
| `title` | string | no | Display title |

### Placeholder syntax

Parameters embed via `{{paramName}}`.

```sql
SELECT * FROM orders
WHERE created_at >= {{start_date}}
  AND region = {{region}}
LIMIT {{limit}}
```

### Connector binding

| Connector | Binding |
|-----------|---------|
| PostgreSQL / squadbase-db | `$1, $2, ...` positional (parameterized) |
| MySQL | `?` positional (parameterized) |
| Snowflake / BigQuery / Athena / Redshift / Databricks | Literal substitution (no parameterized query) |

### Auto-quoting (CRITICAL)

**String params auto-quoted by server.** Never add quotes around placeholders.

```
CORRECT:   WHERE date >= {{start_date}}
WRONG:     WHERE date >= '{{start_date}}'    ← double-quoting bug
```

- `string` → auto-wrapped in `'...'` (`'` escaped to `''`)
- `number` → bare numeric literal
- `null` / `undefined` → `NULL`

### Response shape

SQL always returns `{ "data": rows[] }`. Each row = object keyed by column name.

Frontend:

```tsx
const json = await res.json();
return json.data as SalesRow[];
```

---

## TypeScript server logic

### Minimal skeleton

```typescript
import type { Context } from "hono";

export default async function handler(c: Context) {
  const { params } = await c.req.json();

  // ... do work, call APIs, transform data ...

  return new Response(JSON.stringify({ data: { /* ... */ } }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### Tool parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Identifier — becomes filename + API path |
| `description` | string | yes | What this server logic returns |
| `handlerPath` | string | yes | Relative path to `.ts` handler (from server-logic dir) |
| `handlerCode` | string | yes | TypeScript handler source |
| `parameters` | ParameterMeta[] | no | Parameter definitions (for metadata) |
| `cache` | CacheConfig | no | See Cache section |
| `title` | string | no | Display title |
| `response` | ServerLogicResponse | no | Response schema (usually auto-inferred — omit unless overriding) |

### Handler rules

- Default async export, signature `(c: Context)` — import `Context` from `"hono"`.
- Access params via `const { params } = await c.req.json()` — POST body is `{ params: { ... } }` matching `parameters` definitions.
  - **Exception** — chat handlers using `useChat` receive `{ messages }` directly. See `chat-app-development`.
- Return `Response` directly (`new Response(JSON.stringify(...))`) — server passes through.
- Non-SQL connectors: `connection()` from `@squadbase/vite-server/connectors/<type>` (see Connectors section).
- `handlerPath` relative to server-logic dir, points to `.ts` within it (no path traversal).
- Handlers have full Node.js access including `process.env`.

### Response shape

TS server logics return handler's `Response` as-is — shape is whatever you put inside.

Frontend (no `data` wrapper unless added):

```tsx
const json = await res.json();
return json as DashboardSummary;
```

### Schema auto-inference

Tool infers response schema from test results — usually no manual `response` spec needed. Override only when:

- Test data doesn't cover all return shapes
- You want stricter typing than inferred
- Handler returns `ReadableStream` (chat streaming) — see `chat-app-development`

---

## Parameter definition (SQL & TS)

```typescript
interface ParameterMeta {
  name: string;                           // Matches {{name}} in SQL, or params.<name> in TS
  type: "string" | "number" | "boolean";  // Value type
  description: string;                    // Human-readable description
  required?: boolean;                     // Default: false
  default?: string | number | boolean;    // Used when param missing
}
```

Missing param → uses `default` if set, else `null`.

---

## Cache

```typescript
interface ServerLogicCacheConfig {
  ttl: number;                      // Cache lifetime in seconds. 0 = no cache.
  staleWhileRevalidate?: boolean;   // Return stale while refreshing in background. Default: false.
}
```

### Recommended TTLs

| Use case | TTL (s) | staleWhileRevalidate | Rationale |
|----------|--------|----------------------|-----------|
| Real-time monitoring | 10–30 | `true` | Near-fresh; stale fallback avoids loading states |
| Daily reports / aggregations | 300–600 | `true` | 5–10 min delay OK; background refresh for UX |
| Master data (region lists) | 3600+ | `false` | Rarely changes; long TTL reduces DB load |
| Historical / archive | 3600+ | `false` | Never changes; cache as long as possible |

### Never cache

- Streaming responses (chat handlers using `streamText`)
- Anything that mutates external state
- Per-user personalized responses unless cache key includes user ID

---

## Non-SQL connectors (TS handlers)

Import `connection()` from the connector-specific subpath:

```typescript
import { connection } from "@squadbase/vite-server/connectors/<type>";

const client = connection("<connectionId>");
```

- `connection(connectionId)` reads `.squadbase/connections.json`, resolves env vars, returns typed client.
- Each connector's SDK usage (methods, args) depends on type.

### Connection discovery

Use `listConnections` for available IDs before creating a server logic.

- SQL → `connectionId` directly via `create-sql-server-logic`.
- TS → access via `connection(connectionId)` inside handler body.
- Each entry has `connector: { slug }` + `envVars`. `envVars` values are env var **names**, not secrets. Actual secrets come from runtime env (`.env` local, deployment env in prod).

### Common connectors

| Slug | Import | Use for |
|------|--------|---------|
| `openai` | `@squadbase/vite-server/connectors/openai` | OpenAI chat / completion |
| `anthropic` | `@squadbase/vite-server/connectors/anthropic` | Anthropic Claude |
| `slack` | `@squadbase/vite-server/connectors/slack` | Slack Web API |
| `notion` | `@squadbase/vite-server/connectors/notion` | Notion API |

Check actual list via `listConnections` — the set evolves.

---

## Important Notes

1. **Slug = filename** — `sales-summary` → `server-logic/sales-summary.json` → `POST /api/server-logic/sales-summary`.
2. **No quotes around SQL placeholders** — write `{{param}}`, NOT `'{{param}}'`. Strings auto-quoted by server (double-quoting bug).
3. **Response format** — SQL → `{ "data": rows[] }`. TS → handler's `Response` as-is.
4. **Schema auto-inferred** — from test results; usually no manual spec needed.
5. **Param defaults** — missing param uses `default` if set, else `null`.
6. **Always test after creation** — `testFetchServerLogic` with sample params.

---

## Related skills

- `chat-app-development` — chat handlers are streaming TS server logics. Use `{ messages }` body (not `{ params }`) and skip `cache`.
- `component-generation` — frontend wires server logic via `useQuery` + `POST /api/server-logic/<slug>`. See for queryKey conventions and loading / error guards.
