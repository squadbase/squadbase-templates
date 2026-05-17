# SQL Server Logic Reference

Spec for `create-sql-server-logic`. Pair with `SKILL.md` + `cache-and-connectors.md`.

## Tool parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Identifier — becomes filename + API path |
| `description` | string | yes | What this server logic returns |
| `query` | string | yes | SQL with `{{paramName}}` placeholders |
| `connectionId` | string | yes | Connection ID from `listConnections` |
| `parameters` | ParameterMeta[] | no | Query parameter definitions (below) |
| `cache` | CacheConfig | no | See `cache-and-connectors.md` |
| `title` | string | no | Display title |

## Placeholder syntax

Parameters embed via `{{paramName}}`.

```sql
SELECT * FROM orders
WHERE created_at >= {{start_date}}
  AND region = {{region}}
LIMIT {{limit}}
```

## Connector binding

| Connector | Binding |
|-----------|---------|
| PostgreSQL / squadbase-db | `$1, $2, ...` positional (parameterized) |
| MySQL | `?` positional (parameterized) |
| Snowflake / BigQuery / Athena / Redshift / Databricks | Literal substitution (no parameterized query) |

## Auto-quoting (CRITICAL)

**String params auto-quoted by server.** Never add quotes around placeholders.

```
CORRECT:   WHERE date >= {{start_date}}
WRONG:     WHERE date >= '{{start_date}}'    ← double-quoting bug
```

- `string` → auto-wrapped in `'...'` (`'` escaped to `''`)
- `number` → bare numeric literal
- `null` / `undefined` → `NULL`

## Parameter definition

```typescript
interface ParameterMeta {
  name: string;                           // Matches {{name}} in SQL
  type: "string" | "number" | "boolean";  // Value type
  description: string;                    // Human-readable description
  required?: boolean;                     // Default: false
  default?: string | number | boolean;    // Used when param missing
}
```

Missing param → uses `default` if set, else `null`.

## Response shape

SQL always returns `{ "data": rows[] }`. Each row = object keyed by column name.

Frontend:

```tsx
const json = await res.json();
return json.data as SalesRow[];
```
