---
name: server-logic-development
description: Specification and implementation conventions for SQL / TypeScript server logic. Read when creating or editing a server logic, and before implementing any frontend code that calls one.
---

# Server Logic Development Guide

For `create-sql-server-logic` and `create-typescript-server-logic`. Workflow, tool inventory, minimal skeletons here; detailed specs in `references/`.

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
2. **Design query / handler** — see references for parameter specs
3. **Create** → `create-sql-server-logic` or `create-typescript-server-logic`
4. **Test** → `testFetchServerLogic` with sample params

Tools auto-handle: JSON definition write, response schema inference from test results, server auto-reload.

---

## SQL minimal skeleton

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

Placeholder syntax, auto-quoting, connector binding → [`references/sql-logic.md`](./references/sql-logic.md).

---

## TypeScript minimal skeleton

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

Handler rules, param shapes, response inference → [`references/typescript-logic.md`](./references/typescript-logic.md).

Non-SQL connectors (OpenAI, Slack, Notion, etc.) → [`references/cache-and-connectors.md`](./references/cache-and-connectors.md).

---

## Important Notes

1. **Slug = filename** — `sales-summary` → `server-logic/sales-summary.json` → `POST /api/server-logic/sales-summary`.
2. **No quotes around SQL placeholders** — write `{{param}}`, NOT `'{{param}}'`. Strings auto-quoted by server (double-quoting bug). See [`references/sql-logic.md`](./references/sql-logic.md).
3. **Response format** — SQL → `{ "data": rows[] }`. TS → handler's `Response` as-is.
4. **Schema auto-inferred** — from test results; usually no manual spec needed.
5. **Param defaults** — missing param uses `default` if set, else `null`.
6. **Always test after creation** — `testFetchServerLogic` with sample params.

---

## References

- [`references/sql-logic.md`](./references/sql-logic.md) — `create-sql-server-logic` full spec: placeholders, auto-quoting, connector binding, response shape
- [`references/typescript-logic.md`](./references/typescript-logic.md) — `create-typescript-server-logic` full spec: handler rules, Context, schema inference
- [`references/cache-and-connectors.md`](./references/cache-and-connectors.md) — cache config, recommended TTLs, non-SQL `connection()` usage

## Related skills

- `chat-app-development` — chat handlers are streaming TS server logics. Use `{ messages }` body (not `{ params }`) and skip `cache`.
- `component-generation` — frontend wires server logic via `useQuery` + `POST /api/server-logic/<slug>`. See for queryKey conventions and loading / error guards.
