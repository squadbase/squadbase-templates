---
name: server-logic-development
description: Server logic creation and editing workflows — SQL/TypeScript server logic patterns, connection setup, testing procedures
---

# Server Logic Development Guide

Reference for creating server logics using the `create-sql-server-logic` and `create-typescript-server-logic` tools.
This document covers the domain knowledge needed to provide correct inputs — query design, handler code, parameters, and connections.

---

## Tools Overview

| Tool | Purpose |
|------|---------|
| `listConnections` | Discover available database connections and their IDs |
| `create-sql-server-logic` | Create a new SQL server logic |
| `create-typescript-server-logic` | Create a new TypeScript server logic |
| `testServerLogic` | Test a server logic by executing it with sample parameters |
| `testFetchServerLogic` | Test fetching server logic results (validates end-to-end) |
| `listServerLogics` | List all existing server logics |
| `editServerLogic` | Modify an existing server logic |
| `deleteServerLogic` | Remove a server logic |

### Typical Workflow

1. **Discover connections** — call `listConnections` to find available `connectionId` values
2. **Design query/handler** — write the SQL query or TypeScript handler code using this guide
3. **Create server logic** — call `create-sql-server-logic` or `create-typescript-server-logic` with the designed inputs
4. **Test** — call `testServerLogic` to verify execution, then `testFetchServerLogic` to validate end-to-end

### What the tools handle automatically

- Writing the JSON definition file to the correct directory
- Inferring the response schema from test results
- Triggering server auto-reload (no restart needed)

---

## SQL Server Logic — What to Provide

### Tool Parameters (`create-sql-server-logic`)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Identifier — becomes the filename and API path |
| `description` | string | yes | Human-readable description of what this server logic returns |
| `query` | string | yes | SQL query with `{{paramName}}` placeholders |
| `connectionId` | string | yes | Connection ID from `listConnections` |
| `parameters` | ParameterMeta[] | no | Query parameter definitions (see Parameter Definition section) |
| `cache` | CacheConfig | no | Caching configuration (see Cache Configuration section) |
| `title` | string | no | Display title |

### SQL Placeholder Syntax

Parameters are embedded in SQL using `{{paramName}}` placeholders.

```sql
SELECT * FROM orders WHERE created_at >= {{start_date}} AND region = {{region}} LIMIT {{limit}}
```

**Connector-specific binding:**

| Connector | Binding method |
|-----------|---------------|
| PostgreSQL / squadbase-db | Converted to `$1, $2, ...` positional parameters (parameterized) |
| MySQL | Converted to `?` positional parameters (parameterized) |
| Snowflake / BigQuery / Athena / Redshift / Databricks | Literal value substitution (no parameterized query support) |

### Auto-Quoting (Critical!)

**String-type parameters are automatically single-quoted by the server.**
Never add quotes around placeholders in your SQL template.

```
CORRECT:   WHERE date >= {{start_date}}
WRONG:     WHERE date >= '{{start_date}}'    ← double-quoting bug!
```

- `string` parameters → auto-wrapped in `'...'` (with `'` escaped to `''`)
- `number` parameters → inserted as bare numeric literals
- `null` / `undefined` → inserted as `NULL`

---

## TypeScript Server Logic — What to Provide

### Tool Parameters (`create-typescript-server-logic`)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Identifier — becomes the filename and API path |
| `description` | string | yes | Human-readable description of what this server logic returns |
| `handlerPath` | string | yes | Relative path to `.ts` handler file (from the server-logic directory) |
| `handlerCode` | string | yes | TypeScript handler source code |
| `parameters` | ParameterMeta[] | no | Parameter definitions (for metadata) |
| `cache` | CacheConfig | no | Caching configuration (see Cache Configuration section) |
| `title` | string | no | Display title |
| `response` | ServerLogicResponse | no | Response schema (usually auto-inferred — omit unless you need to override) |

### Handler File Format

The handler must export a default async function receiving a Hono `Context` and returning a `Response`.

```typescript
import type { Context } from "hono";

export default async function handler(c: Context) {
  // Access POST body parameters via c.req.json()
  const { params } = await c.req.json();

  const res = await fetch(`https://api.example.com/users/${params.userId}`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();

  return new Response(JSON.stringify({ data }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### Handler Rules

- Export a default async function with signature `(c: Context)` — import `Context` from `"hono"`
- Access request parameters via `const { params } = await c.req.json()` — the POST body contains `{ params: { ... } }` matching the server logic's `parameters` definitions
- Return a `Response` object directly (e.g., `new Response(JSON.stringify(...))`) — the server passes the handler's response through as-is
- For non-SQL connectors, use `connection()` from `@squadbase/vite-server/connectors/<type>` (see Non-SQL Connectors section)
- `handlerPath` must be relative to the server-logic directory and point to a `.ts` file within it (no path traversal)
- Handlers run with full Node.js environment access including `process.env`

---

## Parameter Definition

```typescript
interface ParameterMeta {
  name: string;                           // Parameter name (matches {{name}} in SQL query)
  type: "string" | "number" | "boolean";  // Value type
  description: string;                    // Human-readable description
  required?: boolean;                     // Default: false
  default?: string | number | boolean;    // Default value when parameter is not provided
}
```

When a parameter is not provided in the request: if it has a `default` value, the default is used; otherwise `null` is used.

---

## Connections

Use `listConnections` to discover available connections and their IDs before creating a server logic.

- SQL server logics use `connectionId` to reference a connection
- TypeScript handlers access connections via the `connection()` function from connector subpath exports (see Non-SQL Connectors section)
- Each connection entry has `connector: { slug }` and `envVars` — the `envVars` values are environment variable **names**, not actual secrets

---

## Cache Configuration

```typescript
interface ServerLogicCacheConfig {
  ttl: number;                      // Cache lifetime in seconds. 0 = no cache.
  staleWhileRevalidate?: boolean;   // Return stale data while refreshing in background. Default: false.
}
```

### Recommended TTL Values

| Use Case | TTL (seconds) | staleWhileRevalidate | Rationale |
|----------|---------------|----------------------|-----------|
| Real-time monitoring | 10–30 | `true` | Near-fresh data; stale fallback avoids loading states |
| Daily reports / aggregations | 300–600 | `true` | 5–10 min delay acceptable; background refresh for UX |
| Master data (region lists, etc.) | 3600+ | `false` | Rarely changes; long TTL reduces DB load |
| Historical / archive data | 3600+ | `false` | Never changes; cache as long as possible |

---

## Non-SQL Connectors in TypeScript Handlers

Non-SQL connectors are used via TypeScript server logic handlers. Import the `connection()` function from the connector-specific subpath export.

```typescript
import { connection } from "@squadbase/vite-server/connectors/<type>";

const client = connection("<connectionId>");
```

- `connection(connectionId)` reads the connection entry from `.squadbase/connections.json`, resolves environment variables, and returns a typed client instance
- Each connector's SDK usage (methods, arguments, etc.) depends on the connector type

---

## Important Notes

1. **Slug = filename**: The slug becomes the JSON filename and the API path segment (e.g., slug `sales-summary` → `server-logic/sales-summary.json` → `POST /api/server-logic/sales-summary`).

2. **Auto-quoting warning**: String parameters are automatically quoted in SQL. Writing `'{{param}}'` causes double-quoting bugs. Always write `{{param}}` without quotes.

3. **Response format**: SQL server logics return `{ "data": rows[] }`. TypeScript server logics return the handler's `Response` as-is.

4. **Response schema is auto-inferred**: The tools infer the response schema from test results — you typically don't need to specify it manually.

5. **Parameter defaults**: When a parameter is not provided and has a `default` value, the default is used; otherwise `null` is used.

6. **Always test after creation**: Call `testServerLogic` then `testFetchServerLogic` to verify the server logic works correctly.
