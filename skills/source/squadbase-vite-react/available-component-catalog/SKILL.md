---
name: available-component-catalog
description: Catalog of React components available in the Squadbase Vite template (shadcn/ui primitives, app-level common components, data-display components). Read before building or modifying any page/UI so only existing components are reused and known gotchas are avoided.
---

# Available Component Catalog

Reference for the components shipped with the Squadbase Vite template. Read this **before** adding or editing any page so you reuse existing components instead of recreating them, and so you avoid the known gotchas captured below.

All components live under `src/components/` and are imported via the `@/*` alias (e.g. `@/components/common/page-shell`).

---

## Component Rules

- Every **page** (`src/pages/*.tsx`) uses `export default function` — required by the `lazy()` loader in `routes.tsx`. Components under `src/components/` may use named or default exports.
- Page files default to `PageShell` (Header → Content, optional Footer). Only switch to a custom layout when the requested design explicitly cannot be expressed with `PageShell`.
- Framed / bordered content defaults to `DashboardCard` (or `DashboardCardPreset`). Reach for `ui/Card` only when `DashboardCard` genuinely cannot meet the requirement.
- Before using any component, open its source file to confirm the exact Props and usage — do not rely on assumptions.
- Import React hooks as named imports (`import { useState } from "react"`). Never `import React from "react"` — the JSX transform is automatic.
- ECharts: `import type { EChartsOption } from "echarts"` only. Use `@/components/data/echart` for the chart component itself.

### Component splitting

Split a page into child components when it has **3+ sections**, **multiple `useQuery` calls**, or **complex logic** (tables, forms).

- Place children at `src/components/<pageName>/<component-name>.tsx`.
- Each child is self-contained — it fetches its own data and owns its loading/error UI.
- For 1–2 section pages or small partial edits, keep everything in the single page file.

---

## Component Catalog

Only components with **non-obvious usage** or **error-prone behavior** are detailed. Items with no gotcha are enumerated only.

### `components/ui/` — shadcn/Radix primitives

| Component | When to use | Gotcha |
|---|---|---|
| `Select` / `SelectItem` | Single-choice dropdown | **Empty string as `SelectItem` `value` is forbidden** (Radix throws). Use a non-empty placeholder like `"all"` for null-like options |
| `Combobox` / `Command` / `CommandItem` | Escape hatch for a custom searchable dropdown. For standard searchable single-select use `SearchableSelect` from `@/components/common/searchable-select` instead | `CommandItem` `value` is the cmdk search key — drift from the displayed text breaks search. `onSelect` fires with the lowercased value |
| `Dialog` / `Sheet` | Modal / side panel | **`DialogTitle` and `DialogDescription` are required** (a11y warning). Hide visually with `className="sr-only"` if not shown |
| `Tooltip` | Hover hint | **`TooltipProvider` required at app root**. Without it, tooltips silently fail to render |
| `Tabs` | Tabbed content | If neither `defaultValue` nor `value` is set, no tab is active on mount (silent empty content) |
| `ToggleGroup` | Single / multi toggle | **`type="single"` → `value: string`, `type="multiple"` → `value: string[]`**. Mixing the two causes shape mismatch |
| `Calendar` / `DatePicker` | Date selection primitives | Requires a `Date` instance (strings / `null` trigger react-day-picker warnings). For range selection, use `DateRangePicker` from `@/components/data/date-range-picker` (not `ui/`) |
| `DropdownMenuCheckboxItem` / `RadioItem` | Checkbox / radio menu items | `checked` must be controlled. Wrap radios in `DropdownMenuRadioGroup` |

No gotcha (listed only): `Button`, `Card`, `Badge`, `Label`, `Separator`, `Skeleton`, `Avatar`, `Progress`, `Accordion`, `Breadcrumb`, `Pagination`, `Alert`, `Collapsible`, `Empty`, `Spinner`, `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Table`, `Toggle`.

> `Card` is allowed but not the default — prefer `DashboardCard` from `components/common/` unless `DashboardCard` can't satisfy the requirement.

### `components/common/` — app-level building blocks

| Component | When to use | Gotcha |
|---|---|---|
| `AppShell` | Outer layout wrapping every route | `groups: NavGroup[]` required. `linkComponent` must accept `href` and `aria-disabled`. Sidebar context does not exist when `variant="header"` |
| `PageShell` / `PageShellHeader` / `PageShellContent` / `PageShellSummary` / `PageShellSummaryCard` | Default page frame (header + body). `PageShellSummary` is the responsive grid placed directly inside `PageShellHeader` for KPI summary cards — **inside `PageShellSummary`, use `PageShellSummaryCard` instead of `DashboardCard`** | Child order must be Header → Content (→ Footer). Reversing breaks layout. `PageShellSummaryCard` `accent` is `"default" \| "accent" \| "amber" \| "blue" \| "emerald" \| "red" \| "violet" \| "orange" \| "cyan" \| "slate"` |
| `DashboardCard` / `DashboardCardPreset` | Default frame for widgets and bordered content — prefer over `ui/Card`. Two forms: **Composable** (`DashboardCard` + `DashboardCardHeader` / `Title` / `Description` / `Action` / `Content` / `Footer`) for fine-grained layout, **Preset** (`DashboardCardPreset` with `title` / `description` / `actions` / `footer` / `children` props) as the concise default. For data display, combine with `Sparkline` inside `DashboardCardContent` to make KPI widgets look richer | `theme` is resolved via `SquadbaseTheme` — do not pass it manually |
| `MarkdownRenderer` | Markdown rendering | **Input is NOT XSS-sanitized**. Sanitize user-generated content with DOMPurify (or equivalent) beforehand |
| `MultiSelect` | Multi-select (tags, etc.) | `value` must be `string[]` (not `undefined`). Each option `value` cannot be an empty string (inherits shadcn restriction) |
| `SearchableSelect` | Standard searchable single select — prefer over `ui/Combobox` unless you need a fully custom implementation | `value` is `string \| undefined`. `onChange` passes `undefined` on clear. Empty-string options are forbidden |
| `SectionHeader` | Section title bar | `as` accepts `h1`–`h4` only |
| `SegmentedControl` | Exclusive toggle | **Re-clicking the active value does not deselect it** (always one selected). Mismatched `options[].value` vs `value` leaves silent no-selection |
| `StatusBadge` | Status indicator | `status` values missing from `colorMap` silently fall back to gray |

`select-types.ts` is types only. Call `flattenOptions()` before searching grouped options.

### `components/data/` — data display components

| Component | When to use | Gotcha |
|---|---|---|
| `DataTable` | Structured tables (sort / filter / pagination / selection) | **Every column needs `id` or `accessorKey`**. `useDataTable()` throws outside the context. `enableRowSelection=true` auto-injects the selection column (mind column counts). `globalFilter` is simple substring matching |
| `ColumnVisibility` | Toggle DataTable column visibility | none |
| `DateRangePicker` | Preset-backed range picker (today / last 7/30/90 days, etc.) | `value` is `{ from?: Date; to?: Date }`; both may be `undefined`. `minDate` / `maxDate` are client-side validation only |
| `EChart` (`@/components/data/echart`) | Theme-resolved ECharts wrapper — the only chart component in this template | `@/components/ui/chart` / `@/components/ui/echarts` do not exist — always import from `@/components/data/echart`. `option` must conform to the ECharts shape. Auto radar coloring fires only when `series[0].data.length === 2`, and `option.color` takes precedence. `decal=true` injects hatching patterns |
| `FilterBar` (+ `FilterBarSelect`, etc.) | Dashboard filter composition | **`FilterOption.value` cannot be an empty string** (use `"all"` etc. for all-select). Clear a chip by passing `undefined` (not `null`) |
| `FunnelSteps` | Funnel visualization | **Data must be sorted descending** (largest first). Conversion with previous value `0` renders `"--"`. Colors are Tailwind classes only (no inline CSS) |
| `MetricValue` / `MetricUnit` | Large KPI number display | none |
| `ProgressCircle` | Circular progress | `value` is auto-clamped to 0–100. Color is a Tailwind class (e.g. `text-chart-1`) |
| `RefreshControl` | Last-updated display + manual/auto refresh | `lastUpdatedAt` must be a `Date` instance. `autoRefreshInterval` is in **seconds**. The component does not `await` `onRefresh`, so the caller manages `isRefreshing` |
| `Sparkline` | Mini trend chart | Empty data array returns `null`. `area=true` works only with `variant="line"` |
| `Tracker` | Status timeline bar | `status` prop takes precedence over `color`. Wraps its own `TooltipProvider` — **do not nest inside another** |
| `TrendIndicator` | Delta percentage badge | `direction` is `"up" \| "down" \| "neutral"`. `value` is a plain number (the `%` sign is appended internally). `positiveIsGood=false` flips the color. `neutral` always renders gray |
