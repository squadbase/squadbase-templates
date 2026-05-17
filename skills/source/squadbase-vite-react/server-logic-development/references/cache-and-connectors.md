# Cache & Non-SQL Connectors Reference

Caching + non-SQL connector usage. Pair with `SKILL.md`, `sql-logic.md`, `typescript-logic.md`.

## Cache config

```typescript
interface ServerLogicCacheConfig {
  ttl: number;                      // Cache lifetime in seconds. 0 = no cache.
  staleWhileRevalidate?: boolean;   // Return stale while refreshing in background. Default: false.
}
```

## Recommended TTLs

| Use case | TTL (s) | staleWhileRevalidate | Rationale |
|----------|--------|----------------------|-----------|
| Real-time monitoring | 10–30 | `true` | Near-fresh; stale fallback avoids loading states |
| Daily reports / aggregations | 300–600 | `true` | 5–10 min delay OK; background refresh for UX |
| Master data (region lists) | 3600+ | `false` | Rarely changes; long TTL reduces DB load |
| Historical / archive | 3600+ | `false` | Never changes; cache as long as possible |

## Never cache

- Streaming responses (chat handlers using `streamText`)
- Anything that mutates external state
- Per-user personalized responses unless cache key includes user ID

## Non-SQL connectors in TS handlers

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
