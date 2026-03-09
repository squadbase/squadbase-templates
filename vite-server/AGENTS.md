# Data Source Development Guide

This document is the complete reference for AI agents creating and managing data source JSON files.
Read only this file — no other documentation is needed to create data sources.

## Overview

`@squadbase/vite-server` is a Hono-based backend that loads data source definitions from JSON files,
executes SQL queries against configured databases, and exposes results via REST API.
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
  response?: DataSourceResponse;    // Optional — response schema (see below). Omit to return { data: result }
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
  response?: DataSourceResponse;    // Optional — response schema
  cache?: DataSourceCacheConfig;    // Optional — caching configuration
}
```

#### Handler file format

The handler file must export a default async function that receives a Hono `Context` and returns any JSON-serializable value.

```typescript
// data-source/my-handler.ts
import type { Context } from "hono";

export default async function handler(c: Context): Promise<unknown> {
  const body = await c.req.json().catch(() => ({}));
  const userId = (body.params?.userId as string) ?? "";

  if (!userId) return { error: "userId is required" };

  const res = await fetch(`https://api.example.com/users/${userId}`, {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

**Rules:**
- Always use `import type { Context } from "hono"` (type-only import)
- Read request body via `c.req.json().catch(() => ({}))` — params are in `body.params`
- Return data directly (JSON-serializable value); the server wraps it in `{ data: result }` unless `response` schema overrides this
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

#### `response` (DataSourceResponse, optional)

Describes the response schema and format. When omitted, the API returns `{ data: rows[] }`.

```typescript
interface DataSourceSchemaObject {
  type?: "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
  format?: string;           // "date" | "date-time" | "uri" | "email" | "uuid" etc.
  description?: string;
  nullable?: boolean;
  enum?: (string | number | boolean | null)[];
  items?: DataSourceSchemaObject;                          // for array type
  properties?: Record<string, DataSourceSchemaObject>;    // for object type
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface DataSourceMediaType {
  schema?: DataSourceSchemaObject;
  example?: unknown;
}

interface DataSourceResponse {
  description?: string;
  defaultContentType?: string;   // "application/json" | "text/csv"
  content?: Record<string, DataSourceMediaType>;
}
```

#### Response format decision table

| `response` config | API response format |
|---|---|
| omitted | `{ data: rows[] }` (default, array wrapped) |
| `content["application/json"].schema.type = "object"` with `properties` | raw object (no wrapper) |
| `defaultContentType = "text/csv"` | `text/csv` with CSV body |

#### `connectionId` (string, **required for SQL data sources**)
Key in `.squadbase/connections.json` identifying the connection. Required for SQL data sources. TypeScript data sources do not use this field.

The connector type is determined automatically from `connections.json` entry's `connector.slug`:

**SQL connectors** (used in data source JSON `query` field):
`"postgresql"`, `"squadbase-db"`, `"mysql"`, `"bigquery"`, `"snowflake"`, `"athena"`, `"redshift"`, `"databricks"`

**Non-SQL connectors** (used in TypeScript handlers via client utilities):
`"airtable"`, `"google-analytics"`, `"kintone"`, `"wix-store"`, `"dbt"`

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

All data sources require a `connectionId` that maps to an entry in `.squadbase/connections.json` (default: `<cwd>/.squadbase/connections.json`).

```json
{
  "my-bigquery": {
    "connector": { "slug": "bigquery" },
    "envVars": {
      "project-id": "GCP_PROJECT_ID",
      "service-account-key-json-base64": "GCP_SA_JSON_BASE64"
    }
  },
  "my-snowflake": {
    "connector": { "slug": "snowflake" },
    "envVars": {
      "account": "SNOWFLAKE_ACCOUNT",
      "user": "SNOWFLAKE_USER",
      "role": "SNOWFLAKE_ROLE",
      "warehouse": "SNOWFLAKE_WAREHOUSE",
      "private-key-base64": "SNOWFLAKE_PRIVATE_KEY_BASE64"
    }
  },
  "my-pg": {
    "connector": { "slug": "postgresql" },
    "envVars": {
      "connection-url": "PG_URL"
    }
  },
  "my-mysql": {
    "connector": { "slug": "mysql" },
    "envVars": {
      "connection-url": "MYSQL_URL"
    }
  },
  "my-athena": {
    "connector": { "slug": "athena" },
    "envVars": {
      "aws-region": "ATHENA_AWS_REGION",
      "aws-access-key-id": "ATHENA_AWS_ACCESS_KEY_ID",
      "aws-secret-access-key": "ATHENA_AWS_SECRET_ACCESS_KEY",
      "workgroup": "ATHENA_WORKGROUP",
      "output-location": "ATHENA_OUTPUT_LOCATION"
    }
  },
  "my-redshift": {
    "connector": { "slug": "redshift" },
    "envVars": {
      "aws-region": "REDSHIFT_AWS_REGION",
      "aws-access-key-id": "REDSHIFT_AWS_ACCESS_KEY_ID",
      "aws-secret-access-key": "REDSHIFT_AWS_SECRET_ACCESS_KEY",
      "database": "REDSHIFT_DATABASE",
      "cluster-identifier": "REDSHIFT_CLUSTER_IDENTIFIER",
      "workgroup-name": "REDSHIFT_WORKGROUP_NAME"
    }
  },
  "my-databricks": {
    "connector": { "slug": "databricks" },
    "envVars": {
      "host": "DATABRICKS_HOST",
      "http-path": "DATABRICKS_HTTP_PATH",
      "token": "DATABRICKS_TOKEN"
    }
  },
  "my-airtable": {
    "connector": { "slug": "airtable" },
    "envVars": {
      "base-id": "AIRTABLE_BASE_ID",
      "api-key": "AIRTABLE_API_KEY"
    }
  },
  "my-ga": {
    "connector": { "slug": "google-analytics" },
    "envVars": {
      "service-account-json-base64": "GA_SERVICE_ACCOUNT_JSON_BASE64",
      "property-id": "GA_PROPERTY_ID"
    }
  },
  "my-kintone": {
    "connector": { "slug": "kintone" },
    "envVars": {
      "base-url": "KINTONE_BASE_URL",
      "username": "KINTONE_USERNAME",
      "password": "KINTONE_PASSWORD"
    }
  },
  "my-wix": {
    "connector": { "slug": "wix-store" },
    "envVars": {
      "site-id": "WIX_SITE_ID",
      "api-key": "WIX_API_KEY"
    }
  },
  "my-dbt": {
    "connector": { "slug": "dbt" },
    "envVars": {
      "host": "DBT_HOST",
      "prod-env-id": "DBT_PROD_ENV_ID",
      "token": "DBT_TOKEN"
    }
  }
}
```

Each `envVars` value is the **name of an environment variable** (not the actual secret).
The actual credentials must be set in the environment or `.env` file.

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
| GET | `/api/data-source/:slug` | — | see response format table | Execute query with no parameters (debug) |
| POST | `/api/data-source/:slug` | `{ "params": { ... } }` | see response format table | Execute query with parameters |

### Data Source Metadata

| Method | Path | Response | Description |
|--------|------|----------|-------------|
| GET | `/api/data-source-meta` | `[{ slug, description, type, parameters, response?, connectionId?, query?, handlerPath?, cache? }]` | List all registered data sources |
| GET | `/api/data-source-meta/:slug` | `{ slug, description, type, parameters, response?, connectionId?, query?, handlerPath?, cache? }` | Get metadata for a specific data source |

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

## SQL Dialect Guide per Connector

| Feature | PostgreSQL | MySQL | BigQuery (GoogleSQL) | Snowflake | Athena (Trino/Presto) | Redshift | Databricks (Spark SQL) |
|---------|-----------|-------|---------------------|-----------|----------------------|----------|----------------------|
| Table reference | `schema.table` | `database.table` | `` `project.dataset.table` `` | `DATABASE.SCHEMA.TABLE` | `database.table` | `schema.table` | `catalog.schema.table` |
| Date truncate | `DATE_TRUNC('month', d)` | `DATE_FORMAT(d, '%Y-%m-01')` | `DATE_TRUNC(d, MONTH)` | `DATE_TRUNC('MONTH', d)` | `DATE_TRUNC('month', d)` | `DATE_TRUNC('month', d)` | `DATE_TRUNC('MONTH', d)` |
| Current timestamp | `NOW()` | `NOW()` | `CURRENT_TIMESTAMP()` | `CURRENT_TIMESTAMP()` | `NOW()` | `GETDATE()` | `CURRENT_TIMESTAMP()` |
| LIMIT | `LIMIT n` | `LIMIT n` | `LIMIT n` | `LIMIT n` | `LIMIT n` | `LIMIT n` | `LIMIT n` |
| Parameter binding | `$1, $2` | `?` placeholders | Literal replacement | Literal replacement | Literal replacement | Literal replacement | Literal replacement |

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

### Example 3: Unwrapped Object Response (Pagination / Summary)

When `schema.type = "object"` with `properties`, the result is returned **without** the `data` wrapper.

Filename: `orders-paginated.json`

```json
{
  "description": "Paginated orders with total count",
  "connectionId": "my-pg",
  "query": "...",
  "response": {
    "content": {
      "application/json": {
        "schema": {
          "type": "object",
          "properties": {
            "rows": { "type": "array", "description": "Order rows" },
            "total": { "type": "integer", "description": "Total count" }
          }
        }
      }
    }
  }
}
```

Response: `{ "rows": [...], "total": 42 }` (no wrapper)

### Example 4: CSV Export

Filename: `orders-export.json`

```json
{
  "description": "Export orders as CSV",
  "connectionId": "my-pg",
  "query": "SELECT id, date, amount FROM orders ORDER BY date DESC",
  "response": {
    "defaultContentType": "text/csv"
  }
}
```

Response: `text/csv` body with CSV content.

### Example 5: BigQuery with Date Range

Filename: `bq-daily-pageviews.json`

```json
{
  "description": "Daily pageview counts from BigQuery analytics",
  "query": "SELECT FORMAT_DATE('%Y-%m-%d', event_date) AS date, SUM(pageviews) AS pageviews, COUNT(DISTINCT user_id) AS unique_users FROM `myproject.analytics.page_events` WHERE event_date >= DATE({{start_date}}) AND event_date <= DATE({{end_date}}) GROUP BY date ORDER BY date DESC",
  "parameters": [
    { "name": "start_date", "type": "string", "description": "Start date (YYYY-MM-DD)", "required": true },
    { "name": "end_date", "type": "string", "description": "End date (YYYY-MM-DD)", "required": true }
  ],
  "response": {
    "content": {
      "application/json": {
        "schema": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "date": { "type": "string", "description": "Event date" },
              "pageviews": { "type": "number", "description": "Total pageviews" },
              "unique_users": { "type": "number", "description": "Unique user count" }
            }
          }
        }
      }
    }
  },
  "connectionId": "my-bigquery",
  "cache": {
    "ttl": 600,
    "staleWhileRevalidate": true
  }
}
```

---

## Using Non-SQL Connectors in TypeScript Handlers

Non-SQL connectors (Airtable, Google Analytics, Kintone, Wix Store, dbt) are used via TypeScript data source handlers. Import client factories from `@squadbase/vite-server`.

### Example: Airtable handler (`data-source/airtable-records.ts`)

```typescript
import type { Context } from "hono";
import { createAirtableClient, loadConnections } from "@squadbase/vite-server";

export default async function handler(c: Context): Promise<unknown> {
  const body = await c.req.json().catch(() => ({}));
  const tableName = (body.params?.table as string) ?? "Tasks";

  const connections = await loadConnections();
  const entry = connections["my-airtable"];
  if (!entry) throw new Error("Airtable connection not configured");

  const client = createAirtableClient(entry, "my-airtable");
  const { records } = await client.listRecords(tableName, { maxRecords: 100 });
  return records.map((r) => ({ id: r.id, ...r.fields }));
}
```

### Available client factories

| Factory | Connector Type | Methods |
|---------|---------------|---------|
| `createAirtableClient(entry, slug)` | airtable | `listRecords()`, `getRecord()` |
| `createGoogleAnalyticsClient(entry, slug)` | google-analytics | `runReport()` |
| `createKintoneClient(entry, slug)` | kintone | `getRecords()`, `getRecord()`, `listApps()` |
| `createWixStoreClient(entry, slug)` | wix-store | `queryProducts()`, `queryOrders()` |
| `createDbtClient(entry, slug)` | dbt | `query()`, `getModels()`, `getModelByName()` |

Use `await loadConnections()` to get the connections map, then pass the entry and slug to the factory function.

---

## Important Notes and Gotchas

1. **Filename = Slug**: The JSON filename (without `.json`) is the data source slug used in API calls and frontend hooks.

2. **Auto-reload**: The server watches the data source directory with `fs.watch`. After creating or modifying a JSON file, wait ~300ms for automatic reload. No server restart needed.

3. **String auto-quoting**: String parameters are automatically quoted. Writing `'{{param}}'` in SQL causes double-quoting bugs. Always write `{{param}}` without quotes.

4. **Required fields**: All data sources require `description`. SQL data sources additionally require `connectionId` and `query`. TypeScript data sources additionally require `type: "typescript"` and `handlerPath`. Files missing required fields are skipped with a warning.

5. **`response` is optional**: When omitted, the API always returns `{ data: rows[] }`. Add `response` only when you need schema documentation or a different response format (object unwrapping or CSV).

6. **Response format selection**: The server checks `response.defaultContentType` first (CSV), then checks if `content["application/json"].schema` is an object type (unwrapped), otherwise defaults to `{ data: result }`.

7. **Parameter defaults**: When a parameter is not provided in the request and has a `default` value, the default is used. Otherwise `null` is used.

8. **BigQuery table names**: Always use backtick-quoted fully qualified names: `` `project.dataset.table` ``.

9. **Snowflake table names**: Use fully qualified `DATABASE.SCHEMA.TABLE` format. Snowflake identifiers are case-insensitive by default but stored as uppercase.

10. **Cache key includes parameters**: Different parameter combinations create separate cache entries. High-cardinality filters reduce cache hit rates.

11. **connections.json**: SQL data sources require a `connectionId` that maps to an entry in `.squadbase/connections.json`. Each entry has `connector: { slug }` and `envVars`. The `envVars` values are environment variable **names**, not actual secrets.

12. **`.env` loading**: The server reads the root `.env` file at startup (since Vite doesn't pass non-`VITE_`-prefixed env vars to the server process).
