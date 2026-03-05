# @squadbase/vite-server

Hono-based backend API server that serves data source endpoints and static SPA assets.
Consolidates logic previously split between `packages/data-api` and `packages/app-template/server/`.

## Export Structure

| Export | Entry | Purpose |
|--------|-------|---------|
| `.` | `src/index.ts` | Hono API app (dev server & build entry) |
| `./main` | `src/main.ts` | Production server with static file serving |
| `./types` | `src/types/data-source.ts` | TypeScript type definitions |

## Key Modules

| Module | Role |
|--------|------|
| `src/index.ts` | Initializes registry, mounts routes under `/api`, reads `.env` |
| `src/main.ts` | Adds `serveStatic` + SPA fallback for production builds |
| `src/registry.ts` | Loads JSON data source files, watches directory, builds query handlers |
| `src/cache.ts` | In-process LRU cache (max 100 entries) with stale-while-revalidate |
| `src/connector-client.ts` | Database client factory (PostgreSQL / Snowflake / BigQuery) |
| `src/routes/data-source.ts` | `POST /api/data-source/:slug` — execute queries |
| `src/routes/data-source-meta.ts` | `GET /api/data-source-meta` — list/get metadata |
| `src/routes/cache.ts` | Cache stats and invalidation endpoints |
| `src/routes/pages.ts` | Page list and Puck page data endpoints |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_SOURCE_DIR` | `<cwd>/data-source` | Directory containing data source JSON files |
| `CONNECTIONS_PATH` | `<cwd>/../../.squadbase/connections.json` | Connector credentials mapping file |
| `SQUADBASE_POSTGRESQL_URL` | — | Default PostgreSQL connection string |
| `DATA_DIR` | `<cwd>/data` | Directory for Puck page JSON files |
| `STATIC_DIR` | `dist/client` (relative to main.ts) | Static assets directory (production) |

## How It's Consumed

`app-template/vite.config.ts` uses this package via:
- **Dev**: `@hono/vite-dev-server` with entry `@squadbase/vite-server` — proxies `/api/*` to Hono
- **Build**: `@hono/vite-build/node` with entry `@squadbase/vite-server/main` — produces standalone Node server

## Change Rule

**Always update `AGENTS.md` when any of the following change:**
- Data source JSON specification (`types/data-source.ts`)
- API route paths or request/response shapes
- Parameter binding behavior (`registry.ts`)
- Cache behavior or configuration options
