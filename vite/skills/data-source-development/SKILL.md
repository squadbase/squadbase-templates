---
name: data-source-development
description: Data source creation and editing workflows — SQL/TypeScript data source patterns, connection setup, testing procedures
---

# Data Source Development Guide

This document is the complete reference for AI agents creating and managing data source JSON files.
Read only this file — no other documentation is needed to create data sources.

## Overview

`@squadbase/vite-server` is a Hono-based backend that loads data source definitions from JSON files,
executes SQL queries or arbitrary server-side logic via TypeScript handlers, and exposes results via REST API.
The server watches the data source directory and **auto-reloads on file changes** — no restart needed.

---

## Data Source JSON Specification

Each data source is a single `.json` file in the data source directory (default: `<project>/data-source/`).
The **filename (without extension) becomes the slug** used in API calls.

Example: `sales-summary.json` → slug `sales-summary` → `POST /api/data-source/sales-summary`

Two types of data sources are supported: **SQL** (default) and **TypeScript**.

### SQL Data Source (JsonDataSourceDefinition)

```typescript
interface JsonDataSourceDefinition {
  description: string;              // REQUIRED — human-readable description
  type?: "sql";                     // Optional — defaults to SQL when omitted
  query: string;                    // REQUIRED — SQL query with {{param}} placeholders
  connectionId: string;             // REQUIRED — key in .squadbase/connections.json
  parameters?: ParameterMeta[];     // Optional — query parameter definitions
  response?: DataSourceResponse;    // Optional — response schema (used by AI agents and UI)
  cache?: DataSourceCacheConfig;    // Optional — caching configuration
}
```

### TypeScript Data Source (JsonTypeScriptDataSourceDefinition)

A TypeScript data source lets you run arbitrary server-side logic — external API calls, data transformations, multi-source aggregation — and expose the result through the same `/api/data-source/:slug` endpoint.

```typescript
interface JsonTypeScriptDataSourceDefinition {
  description: string;              // REQUIRED — human-readable description
  type: "typescript";               // REQUIRED — must be exactly "typescript"
  handlerPath: string;              // REQUIRED — relative path to .ts handler file (from the JSON file's directory)
  parameters?: ParameterMeta[];     // Optional — parameter definitions (for metadata only)
  response?: DataSourceResponse;    // Optional — response schema (used by AI agents and UI)
  cache?: DataSourceCacheConfig;    // Optional — caching configuration
}
```

#### Handler file format

The handler file must export a default async function that returns a `Response` object.

```typescript
// data-source/my-handler.ts
export default async function handler() {
  const res = await fetch(`https://api.example.com/users`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const users = await res.json();

  return new Response(JSON.stringify({ data: users }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

**Rules:**
- Export a default async function (no arguments needed)
- Return a `Response` object directly (e.g., `new Response(JSON.stringify(...))`) — the server passes the handler's response through as-is
- For non-SQL connectors, use `connection()` from `@squadbase/vite-server/connectors/<type>` (see "Using Non-SQL Connectors" section below)
- `handlerPath` must be relative to the JSON file's directory and must point to a `.ts` file within the data-source directory (no path traversal)
- Handlers run with full Node.js environment access including `process.env`

#### TypeScript data source examples

**Simple external API call** (`data-source/user-summary.json`):
```json
{
  "description": "Fetch user purchase summary from external API",
  "type": "typescript",
  "handlerPath": "./user-summary.ts",
  "parameters": [
    { "name": "userId", "type": "string", "description": "Target user ID", "required": true }
  ],
  "cache": { "ttl": 60, "staleWhileRevalidate": true }
}
```

**Multi-source aggregation** (`data-source/sales-forecast.json`):
```json
{
  "description": "Combine sales data and trend data from multiple APIs",
  "type": "typescript",
  "handlerPath": "./sales-forecast.ts",
  "parameters": [
    { "name": "region", "type": "string", "description": "Region code", "required": true }
  ]
}
```

#### Coexistence with SQL data sources

```
data-source/
  ├── active-users.json        # SQL data source (no type field → SQL)
  ├── sales-by-region.json     # SQL data source
  ├── user-summary.json        # TypeScript data source (type: "typescript")
  └── user-summary.ts          # Corresponding handler file
```

### Field Definitions

#### `description` (string, **required**)
Human-readable description of what this data source returns.

#### `query` (string, **required**)
SQL query template. Use `{{paramName}}` placeholders for dynamic values.

```sql
SELECT * FROM orders WHERE created_at >= {{start_date}} AND region = {{region}} LIMIT {{limit}}
```

#### `parameters` (ParameterMeta[], optional)
Defines the parameters that can be passed to the query.

```typescript
interface ParameterMeta {
  name: string;                           // Parameter name (matches {{name}} in query)
  type: "string" | "number" | "boolean";  // Value type
  description: string;                    // Human-readable description
  required?: boolean;                     // Default: false
  default?: string | number | boolean;    // Default value when parameter is not provided
}
```

#### Response format

| Data source type | Response format |
|---|---|
| SQL (`type: "sql"` or omitted) | `{ "data": rows[] }` — the server wraps the query result in a `data` property |
| TypeScript (`type: "typescript"`) | The handler's `Response` is returned as-is — the handler controls the format via `new Response(...)` |

#### `connectionId` (string, **required for SQL data sources only**)
Key in `.squadbase/connections.json` identifying the database connection. Required for SQL data sources; not used (and not accepted) for TypeScript data sources.

The connector type is determined by each entry's `connector.slug`. SQL connectors are used with the `query` field in JSON; non-SQL connectors are used in TypeScript handlers via `connection()` from connector subpath exports.

#### `cache` (DataSourceCacheConfig, optional)
```typescript
interface DataSourceCacheConfig {
  ttl: number;                      // Cache lifetime in seconds. 0 = no cache.
  staleWhileRevalidate?: boolean;   // Return stale data immediately while refreshing in background. Default: false.
}
```

---

## Placeholder Syntax and Auto-Quoting Rules

Parameters are embedded in SQL using `{{paramName}}` placeholders.

### PostgreSQL / squadbase-db
Placeholders are converted to `$1, $2, ...` positional parameters with proper parameterized query binding.

### MySQL
Placeholders are converted to `?` style positional parameters with parameterized query binding.

### Snowflake / BigQuery / Athena / Redshift / Databricks
Placeholders are replaced with **literal values** inline (these connectors don't support parameterized queries).

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

## Connection Configuration

SQL data sources require a `connectionId` that maps to an entry in `.squadbase/connections.json` (default: `<cwd>/.squadbase/connections.json`). TypeScript data sources access connections via the `connection()` function from connector subpath exports (e.g., `@squadbase/vite-server/connectors/kintone`).

```json
{
  "<connectionId>": {
    "connector": { "slug": "<connector-type>" },
    "envVars": {
      "<param-slug>": "<ENV_VAR_NAME>"
    }
  }
}
```

Each `envVars` value is the **name of an environment variable** (not the actual secret).

---

## Cache Configuration

### Recommended TTL Values

| Use Case | TTL (seconds) | staleWhileRevalidate | Rationale |
|----------|---------------|----------------------|-----------|
| Real-time monitoring | 10–30 | `true` | Near-fresh data; stale fallback avoids loading states |
| Daily reports / aggregations | 300–600 | `true` | 5–10 min delay acceptable; background refresh for UX |
| Master data (region lists, etc.) | 3600+ | `false` | Rarely changes; long TTL reduces DB load |
| Historical / archive data | 3600+ | `false` | Never changes; cache as long as possible |

### Response Headers

When cache is enabled (`ttl > 0`), responses include:

| Header | Values | Description |
|--------|--------|-------------|
| `X-Cache` | `HIT` / `MISS` / `STALE` | Cache status |
| `X-Cache-Age` | seconds | Age of cached entry |
| `Cache-Control` | `max-age=N` | Remaining TTL |

### Cache Behavior

- In-process LRU memory cache, max 100 entries
- Cache keys include slug + serialized parameters (different params = different cache entries)
- Server restart clears all cache
- `staleWhileRevalidate: true` returns expired data immediately, refreshes in background

---

## API Endpoints

All endpoints are under the `/api` prefix.

### Data Source

| Method | Path | Body | Response | Description |
|--------|------|------|----------|-------------|
| GET | `/api/data-source/:slug` | — | SQL: `{ data: rows[] }`, TS: handler response | Execute query with no parameters (debug) |
| POST | `/api/data-source/:slug` | `{ "params": { ... } }` | SQL: `{ data: rows[] }`, TS: handler response | Execute query with parameters |

### Data Source Metadata

| Method | Path | Response | Description |
|--------|------|----------|-------------|
| GET | `/api/data-source-meta` | `[{ slug, description, type, parameters, response?, connectionId, query?, handlerPath?, cache? }]` | List all registered data sources |
| GET | `/api/data-source-meta/:slug` | `{ slug, description, type, parameters, response?, connectionId, query?, handlerPath?, cache? }` | Get metadata for a specific data source |

### Cache Management

| Method | Path | Response | Description |
|--------|------|----------|-------------|
| GET | `/api/cache/stats` | `{ size, maxSize, totalHits, totalMisses, hitRate, entries }` | Cache statistics |
| POST | `/api/cache/invalidate` | `{ invalidated, message }` | Clear all cache entries |
| POST | `/api/cache/invalidate/:slug` | `{ slug, invalidated }` | Clear cache for a specific slug |

### Pages

| Method | Path | Response | Description |
|--------|------|----------|-------------|
| GET | `/api/pages` | `[{ name, path, title }]` | List all pages |
| GET | `/api/page-data?page=<name>` | `{ pageData, runtimeData }` | Get Puck page data |
| GET | `/api/runtime-data?page=<name>` | `{ queries: [...] }` | Get runtime data config |

---

## Complete JSON Examples

### Example 1: Simple Row Array (No Response Schema)

Filename: `active-users.json`

```json
{
  "description": "List of all active users",
  "connectionId": "my-pg",
  "query": "SELECT id, name, email, role FROM users WHERE active = true ORDER BY name",
  "cache": {
    "ttl": 600,
    "staleWhileRevalidate": true
  }
}
```

Response: `{ "data": [{ "id": 1, "name": "Alice", ... }, ...] }`

### Example 2: Row Array with Response Schema

Filename: `sales-by-region.json`

```json
{
  "description": "Sales aggregation filtered by region and date range",
  "connectionId": "my-pg",
  "query": "SELECT DATE(order_date) AS date, region, SUM(amount) AS total_amount, COUNT(*) AS order_count FROM orders WHERE order_date >= {{start_date}} AND order_date <= {{end_date}} AND region = {{region}} GROUP BY date, region ORDER BY date DESC",
  "parameters": [
    { "name": "start_date", "type": "string", "description": "Start date (YYYY-MM-DD)", "required": true },
    { "name": "end_date", "type": "string", "description": "End date (YYYY-MM-DD)", "required": true },
    { "name": "region", "type": "string", "description": "Region code", "required": false, "default": "all" }
  ],
  "response": {
    "content": {
      "application/json": {
        "schema": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "date": { "type": "string", "description": "Order date" },
              "region": { "type": "string", "description": "Region code" },
              "total_amount": { "type": "number", "description": "Sum of order amounts" },
              "order_count": { "type": "number", "description": "Number of orders" }
            }
          }
        }
      }
    }
  },
  "cache": {
    "ttl": 300,
    "staleWhileRevalidate": true
  }
}
```

Response: `{ "data": [{ "date": "2025-01-01", ... }, ...] }`

---

## Using Non-SQL Connectors in TypeScript Handlers

Non-SQL connectors are used via TypeScript data source handlers. Import the `connection()` function from the connector-specific subpath export of `@squadbase/vite-server`.

### Usage

```typescript
import { connection } from "@squadbase/vite-server/connectors/<type>";

const client = connection("<connectionId>");
```

- Import the connector-specific `connection()` function from `@squadbase/vite-server/connectors/<type>`
- `connection(connectionId)` reads the connection entry from `.squadbase/connections.json`, resolves environment variables, and returns a typed client instance
- Each connector's SDK usage (methods, arguments, etc.) depends on the connector type

---

## Important Notes and Gotchas

1. **Filename = Slug**: The JSON filename (without `.json`) is the data source slug used in API calls and frontend hooks.

2. **Auto-reload**: The server watches the data source directory with `fs.watch`. After creating or modifying a JSON file, wait ~300ms for automatic reload. No server restart needed.

3. **String auto-quoting**: String parameters are automatically quoted. Writing `'{{param}}'` in SQL causes double-quoting bugs. Always write `{{param}}` without quotes.

4. **Required fields**: All data sources require `description`. SQL data sources additionally require `connectionId` and `query`. TypeScript data sources require `type: "typescript"` and `handlerPath` (no `connectionId`). Files missing required fields are skipped with a warning.

5. **Response format**: SQL data sources always return `{ "data": rows[] }`. TypeScript data sources return the handler's `Response` as-is (the handler controls the response format via `new Response(...)`).

6. **Parameter defaults**: When a parameter is not provided in the request and has a `default` value, the default is used. Otherwise `null` is used.

7. **Cache key includes parameters**: Different parameter combinations create separate cache entries. High-cardinality filters reduce cache hit rates.

8. **connections.json**: SQL data sources require a `connectionId` that maps to an entry in `.squadbase/connections.json`. TypeScript handlers access connections via `connection()` from connector subpath exports, passing the connection ID. Each connections.json entry has `connector: { slug }` and `envVars`. The `envVars` values are environment variable **names**, not actual secrets.
