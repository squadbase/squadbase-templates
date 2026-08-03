# @squadbase/vantage-template

CLI tool for initializing and customizing Squadbase Vantage projects.

It scaffolds a dashboard app built on [`@squadbase/vantage`](https://vantage-framework-vantage.vercel.app/) — a config-free React framework with file-based routing — and applies ready-made UI-pattern templates on top of it.

## Usage

```bash
npx @squadbase/vantage-template <command> [options]
```

### Commands

#### `init`

Initialize a new Vantage project in the current directory. Copies the base template — `src/index.tsx`, `src/_layout.tsx`, `src/_404.tsx`, `src/_error.tsx`, `src/styles.css`, `server/api/`, `tsconfig.json`, `squadbase.yml`, plus the agent guidance in `AGENTS.md` and `.squadbase/skills/` — and installs dependencies.

```bash
npx @squadbase/vantage-template init
npx @squadbase/vantage-template init --force                  # Overwrite existing files
npx @squadbase/vantage-template init --skip-install           # Skip npm install
npx @squadbase/vantage-template init --chart sunset           # Apply a chart preset during init
```

After initialization:

```bash
npm run dev      # vantage dev --no-overlay — dev server + API on :5173
npm run build    # vantage build → dist/
npm run check    # vantage check — static diagnostics
npm run routes   # vantage routes — page/API route map
```

There is no `vite.config.ts`, no `main.tsx`, and no route table: adding a file under `src/` adds a route (`src/index.tsx` → `/`, `src/sales/[id].tsx` → `/sales/:id`), and `src/_layout.tsx` builds the nav from `useRoutes()`.

Since `@squadbase/vantage` v0.3.0, `src/` is the page-scan root and does not appear in URLs. `server/` and `public/` stay at the project root — `src/server/` is never scanned.

Since `@squadbase/vantage` v0.5.0, the dev terminal receives only `console.warn` / `console.error` and uncaught errors (with source-mapped positions and a code frame) — `console.log` is not forwarded. The generated `dev` script passes `--no-overlay`, keeping errors in the terminal instead of behind the full-screen browser overlay; remove the flag (or pass `--overlay`) to restore it.

#### `add <template-name>`

Apply a UI-pattern template to an existing Vantage project. The entry page lands on `src/index.tsx`, and template-owned files go under `src/components/<slug>/` (plus `server/api/` at the project root for API-backed templates).

Both layouts are supported: Vantage scans `src/` when that directory exists and the project root otherwise, and `add` follows whichever one the project already uses — a project keeping its pages at the root gets `index.tsx` and `components/<slug>/` there instead, with relative imports that cross the boundary rewritten to match. `server/` and `public/` always stay at the project root.

```bash
npx @squadbase/vantage-template add kpi-chart-simple
npx @squadbase/vantage-template add funnel --dry-run    # Preview without writing
npx @squadbase/vantage-template add funnel --force      # Overwrite existing files
```

`add` replaces the entry page, so it warns before overwriting it, and it lists leftover files from a previously applied template (it never deletes them — you may have edited them). A project with pages on *both* sides — `src/` present but `index.tsx` / `_layout.tsx` / `styles.css` still at the root — is refused with the list of files to move into `src/` first: Vantage ignores the root ones, so `vantage check` already fails there with `SRC_DIR_SPLIT`.

#### `chart <preset-name>`

Switch the chart color preset. Rewrites a marked block of `--chart-1`–`--chart-5` inside the project's `styles.css` (under `src/` when that layout is in use), leaving any other overrides in that file intact. Re-running replaces the block rather than stacking.

```bash
npx @squadbase/vantage-template chart ocean
npx @squadbase/vantage-template chart forest --dry-run
```

Requires `@squadbase/vantage` v0.2.1+ (v0.2.2+ recommended), where `EChart` resolves its colors from the theme tokens and follows stylesheet changes.

#### `list`

List available UI templates and chart presets.

```bash
npx @squadbase/vantage-template list
npx @squadbase/vantage-template list --lang ja     # Japanese variants (names ending in -ja)
npx @squadbase/vantage-template list --json        # Machine-readable, includes preview image URLs
```

## UI templates

| Template | Description |
|---|---|
| `blank` | Empty `PageShell` with a title and description — the minimal scaffold |
| `kpi-chart-simple` | 4 KPI cards, one trend line, and a ranked-items table — served by `server/api` and filtered through the URL |
| `kpi-chart-advanced` | Hero KPI (1 large + 4 small), bar+line comparison, donut breakdown, daily trend, detail table |
| `chart-grid` | Six-chart grid — area, line, bar, scatter, radar, heatmap — with category filter chips |
| `funnel` | Funnel chart with per-stage drop-off sidebar, pipeline KPIs, and a stage-performance ranking |
| `table-focus` | Workbench layout — search, status chips, sortable detail table, trend + segment sidebar |

Every template has a Japanese variant under `<name>-ja`. The EN and JA variants write to the same destinations, so apply only one of the pair.

## AI customization (`add --prompt`)

Passing `--prompt` relabels the applied template's display copy toward your domain, right after the files are copied. Structure, data, and logic are left alone — only string literals in pages and components are rewritten, and the data layer (mock data, types, API handlers) is excluded from the pass by the manifest.

```bash
npx @squadbase/vantage-template add kpi-chart-simple \
  --prompt "SaaS MRR / ARR / churn dashboard" \
  --provider openai --apiKey $OPENAI_API_KEY
```

| Flag | Description |
|---|---|
| `--prompt <text>` | Customization intent. Without it, no AI call is made. |
| `--provider <name>` | `openai`, `anthropic`, `google`, `mistral`, `xai`, `groq`, … |
| `--model <id>` | Model id. Each provider has a default. |
| `--apiKey <key>` | Falls back to the provider's env var (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, …). |
| `--env-file <path>` | Load a `.env` before the call; existing `process.env` wins. Needs Node.js 20.12+. |
| `--base-url <url>` | OpenAI-compatible endpoint. |
| `--dry-run` | Print the edits as a unified diff without writing. |
| `--json` | Emit the result (`edits`, `unchanged`, `skipped`, `failedVerification`, `aiError`, `notes`) as JSON. |

Each edit is verified against the current file content before it is applied; a file whose edits don't match cleanly is left untouched and reported. `ai` and `@ai-sdk/*` are optional dependencies, imported only when `--prompt` is used — if they are missing, the CLI tells you what to install and exits.

## Requirements

Node.js 18 or later. `--env-file` additionally requires 20.12+.

## License

See the [squadbase-templates](https://github.com/squadbase/squadbase-templates) repository.
