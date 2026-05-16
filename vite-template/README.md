# @squadbase/vite-template

CLI tool for initializing and customizing Squadbase Vite projects.

## Usage

```bash
npx @squadbase/vite-template <command> [options]
```

### Commands

#### `init`

Initialize a new Squadbase Vite project in the current directory. Copies the base template (Vite + React + Tailwind CSS + shadcn/ui) into the working directory.

```bash
npx @squadbase/vite-template init
npx @squadbase/vite-template init --force            # Overwrite existing files
npx @squadbase/vite-template init --skip-install     # Skip npm install
npx @squadbase/vite-template init --chart sunset     # Apply a chart preset during init
```

After initialization:

```bash
npm install
npm run dev
```

#### `add <template-name>`

Apply a template to an existing Squadbase Vite project. This copies template files and patches `src/routes.tsx` with new routes.

```bash
npx @squadbase/vite-template add ec-dashboard-template
npx @squadbase/vite-template add ec-dashboard-template --force     # Overwrite existing files
npx @squadbase/vite-template add ec-dashboard-template --dry-run   # Preview changes
npx @squadbase/vite-template add kpi-chart-simple --ui             # Apply a UI-pattern template (see below)
```

The `--ui` flag switches the template source from `templates/` (use-case dashboards such as `ec-dashboard-template`, `sales-revenue-dashboard`) to `ui-templates/` (UI-pattern starters such as `kpi-chart-simple`, `funnel`). See [UI Pattern Templates](#ui-pattern-templates) for the full list.

#### `chart <preset-name>`

Switch the chart color preset of an existing Squadbase Vite project. Rewrites `src/themes/theme-default.css` with the selected preset.

```bash
npx @squadbase/vite-template chart sunset
npx @squadbase/vite-template chart forest --dry-run   # Preview the CSS without writing
```

#### `list`

List available templates and chart presets.

```bash
npx @squadbase/vite-template list                  # English use-case templates (default)
npx @squadbase/vite-template list --lang ja        # Japanese templates (names ending with -ja)
npx @squadbase/vite-template list --json           # Machine-readable JSON output
npx @squadbase/vite-template list --json --lang ja # Combine flags
npx @squadbase/vite-template list --ui             # UI-pattern templates (under ui-templates/)
npx @squadbase/vite-template list --ui --lang ja   # Japanese UI-pattern templates
npx @squadbase/vite-template list --ui --json      # JSON, with preview image URLs
```

Templates are shipped as English / Japanese pairs (e.g. `bs-dashboard` and `bs-dashboard-ja`). By default `list` shows only the English variants; pass `--lang ja` to switch to the Japanese ones. Pass `--ui` to enumerate the UI-pattern templates instead of the use-case ones (the two sources are independent — the same flag rules apply). The chart presets section is language-agnostic and is always shown.

The `--json` output includes `image` / `imageSquare` URLs that point at the preview screenshots in this repository on GitHub; the URL paths reflect whether `--ui` was passed.

## UI Pattern Templates

In addition to the use-case templates under `templates/` (e.g. `sales-revenue-dashboard`, `ec-dashboard-template`), this package ships a separate set of **UI-pattern templates** under `ui-templates/`. These are domain-agnostic starters that focus on a particular layout shape, so you can pick a structure first and then fill in your own data.

Apply them with the `--ui` flag:

```bash
npx @squadbase/vite-template add kpi-chart-simple --ui
npx @squadbase/vite-template add funnel-ja --ui
npx @squadbase/vite-template list --ui
```

Six patterns are currently available, each shipped as an English / Japanese pair (`<name>` and `<name>-ja`):

| Template | Layout |
|----------|--------|
| `kpi-chart-simple` | 4 KPI cards + a single trend line + a top-items table. The minimal headline-metrics layout. |
| `kpi-chart-advanced` | Hero KPI (1 large + 4 small) + bar/line comparison + donut breakdown + daily trend + campaign table. KPI-led analytics. |
| `chart-grid` | Six-chart grid (area, line, bar, scatter, radar, heatmap) with category filter chips. Visualization-first. |
| `table-focus` | Header search + Export, status filter chips, a 24+ row sortable detail table, with a trend chart and segment breakdown in a right sidebar. For data-heavy operational dashboards. |
| `funnel` | 4 summary KPIs, a funnel chart with a per-stage drop-off + pass-through sidebar, and a stage-performance ranking table. For conversion / pipeline analysis. |
| `tabbed-dashboard` | Underline tabs split the page into Overview (KPI-led) and Detail (table-led) workspaces. For at-a-glance + deep-dive workflows. |

UI-pattern templates use a `ui-template-<slug>` prefix for their files (e.g. `src/components/ui-template-funnel/`, `src/lib/ui-template-funnel-mock-data.ts`) so they don't collide with use-case templates or with files you've already added. EN and JA variants overwrite the same `dest` paths, so you should pick one or the other for a given pattern — don't add both.

## Chart Presets

The default template ships with 6 chart color presets. Each preset defines `--chart-1` through `--chart-5` for both light and dark modes, using Tailwind v4 color variables. Because chart colors influence the overall palette feel of the dashboard UI, swapping presets is the quickest way to re-flavor a template.

| Preset | Palette | Mood |
|--------|---------|------|
| `blue` (default) | blue, teal, fuchsia, violet, gray | Business / cool |
| `sunset` | orange, rose, amber, pink, stone | Warm / energetic |
| `forest` | emerald, lime, teal, green, stone | Natural / calm |
| `ocean` | sky, cyan, indigo, teal, slate | Cool / clean |
| `berry` | purple, pink, fuchsia, violet, rose | Vibrant |
| `mono` | zinc monochrome | Minimal |

Apply a preset at init time with `--chart <preset>`, or switch later with the `chart` subcommand. Presets overwrite `src/themes/theme-default.css` in full; if you've customized that file manually, back it up before switching.

Preset CSS sources live under `chart-presets/` in this package — adding a new preset only requires dropping a new `<name>.css` file there (and registering a description in `src/chart-presets.ts`).

## Template Development

To preview a template locally against the base Vite project, use the internal `dev` script. It rsyncs `../vite/` into `base-template/`, copies it to `dev/`, symlinks the selected template's files, and starts Vite.

```bash
npm run dev                                          # First template under templates/
npm run dev -- sales-revenue-dashboard               # Specific template
npm run dev -- sales-revenue-dashboard --chart sunset # Apply a chart preset for this session
npm run dev -- --chart forest                        # First template + forest preset
```

The `--chart <preset>` flag overwrites `dev/src/themes/theme-default.css` with the selected preset from `chart-presets/`. Because `dev/` is regenerated from scratch on every run, omitting the flag reverts to the base (`blue`) palette.

## Template Screenshots

`scripts/screenshot.mjs` boots each template's dev server and captures it with Playwright at a fixed 1440×900 viewport (`deviceScaleFactor: 2`, so the PNG is 2880×1800). Output goes to `screenshots/` (gitignored).

### Setup (first time only)

```bash
npm install
npx playwright install chromium
```

### Run

```bash
npm run screenshot                          # All templates under templates/
npm run screenshot finance-budget-dashboard # One or more specific templates
npm run screenshot sales-revenue-dashboard web-seo-dashboard
```

For each template, two kinds of images are produced:

| File | Contents |
|------|----------|
| `<template>.png` | Page top — title, summary cards, the first tab |
| `<template>--<n>-<tab-slug>.png` | Each tab activated, with the tab list scrolled to the top of the viewport so the tab content sits directly underneath |

The script runs templates serially (the `dev/` workspace is shared), uses fixed port `5273` with `--strictPort`, and tears down the Vite process between templates. Errors on a single template are reported and the run continues with the next.

## Creating Templates

Use-case templates live in `templates/<template-name>/`, and UI-pattern templates live in `ui-templates/<template-name>/`. Both share the same directory layout and `manifest.json` schema described below; UI-pattern templates additionally follow the `ui-template-<slug>` `dest` prefix convention so they can coexist with use-case templates without file collisions. Both directories are shipped with the npm package.

### Directory Structure

```
templates/<template-name>/
├── manifest.json
├── pages/
│   └── *.tsx
└── components/
    └── *.tsx
```

### manifest.json

```json
{
  "name": "my-template",
  "description": "A description of the template",
  "version": "1.0.0",
  "files": [
    { "src": "pages/home.tsx", "dest": "src/pages/home.tsx", "action": "replace" },
    { "src": "pages/analytics.tsx", "dest": "src/pages/analytics.tsx", "action": "add" },
    { "src": "components/chart.tsx", "dest": "src/components/chart.tsx", "action": "add" }
  ],
  "routes": [
    { "name": "analytics", "path": "/analytics", "title": "Analytics", "page": "./pages/analytics" }
  ]
}
```

#### `files[]`

| Field | Description |
|-------|-------------|
| `src` | Path relative to the template directory |
| `dest` | Destination path relative to the project root |
| `action` | `"add"` = new file (fails if exists without `--force`), `"replace"` = overwrite existing file |

#### `routes[]`

Routes are automatically added to `src/routes.tsx`. Each entry generates a lazy-loaded route.

| Field | Description |
|-------|-------------|
| `name` | Unique route identifier (used for duplicate detection) |
| `path` | URL path (e.g., `/analytics`) |
| `title` | Display title for navigation |
| `page` | Import path relative to `src/routes.tsx` (e.g., `./pages/analytics`) |

Routes that already exist in `routes.tsx` (matched by `name`) are skipped.
