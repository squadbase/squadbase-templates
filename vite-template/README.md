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
```

#### `chart <preset-name>`

Switch the chart color preset of an existing Squadbase Vite project. Rewrites `src/themes/theme-default.css` with the selected preset.

```bash
npx @squadbase/vite-template chart sunset
npx @squadbase/vite-template chart forest --dry-run   # Preview the CSS without writing
```

#### `list`

List all available templates and chart presets.

```bash
npx @squadbase/vite-template list
```

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

Templates live in `templates/<template-name>/` and are shipped with the npm package.

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
