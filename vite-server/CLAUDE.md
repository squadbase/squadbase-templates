# @squadbase/vite-server

Hono-based backend API server that serves server logic endpoints and static SPA assets.
Consolidates logic previously split between `packages/data-api` and `packages/app-template/server/`.

## Export Structure

| Export | Entry | Purpose |
|--------|-------|---------|
| `.` | `src/index.ts` | Hono API app (dev server & build entry) |
| `./main` | `src/main.ts` | Production server with static file serving |
| `./types` | `src/types/server-logic.ts` | TypeScript type definitions |

## Key Modules

| Module | Role |
|--------|------|
| `src/index.ts` | Initializes registry, mounts routes under `/api`, reads `.env` |
| `src/main.ts` | Adds `serveStatic` + SPA fallback for production builds |
| `src/registry.ts` | Loads JSON server logic files, watches directory, builds query handlers |
| `src/cache.ts` | In-process LRU cache (max 100 entries) with stale-while-revalidate |
| `src/connector-client/` | Database client factory (PostgreSQL, MySQL, Snowflake, BigQuery, Athena, Redshift, Databricks) + non-SQL client utilities (Airtable, Google Analytics, Kintone, Wix Store, dbt) |
| `src/routes/server-logic.ts` | `POST /api/server-logic/:slug` — execute queries |
| `src/routes/server-logic-meta.ts` | `GET /api/server-logic-meta` — list/get metadata |
| `src/routes/cache.ts` | Cache stats and invalidation endpoints |
| `src/routes/pages.ts` | Page list and Puck page data endpoints |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_LOGIC_DIR` | `<cwd>/server-logic` | Directory containing server logic JSON files |
| `CONNECTIONS_PATH` | `<cwd>/.squadbase/connections.json` | Connection credentials mapping file (keyed by connectionId) |
| `DATA_DIR` | `<cwd>/data` | Directory for Puck page JSON files |
| `STATIC_DIR` | `dist/client` (relative to main.ts) | Static assets directory (production) |

## How It's Consumed

`app-template/vite.config.ts` uses this package via:
- **Dev**: `@hono/vite-dev-server` with entry `@squadbase/vite-server` — proxies `/api/*` to Hono
- **Build**: `@hono/vite-build/node` with entry `@squadbase/vite-server/main` — produces standalone Node server

## Change Rule

**Always update `skills/source/squadbase-vite-react/server-logic-development/SKILL.md` when any of the following change:**
- Server logic JSON specification (`types/server-logic.ts`)
- API route paths or request/response shapes
- Parameter binding behavior (`registry.ts`)
- Cache behavior or configuration options
