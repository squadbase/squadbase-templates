---
name: available-component-catalog
description: Catalog of React components available in the Squadbase Vite template (shadcn/ui primitives, app-level common components, data-display components). Read before building or modifying any page/UI so only existing components are reused and known gotchas are avoided.
---

# Available Component Catalog

Components shipped with the Squadbase Vite template. Read **before** adding / editing any page to reuse existing components and avoid the gotchas below.

Components live under `src/components/` — import via `@/*` alias (`@/components/common/page-shell`).

---

## Rules

- **Pages** (`src/pages/*.tsx`) use `export default function` — required by `lazy()` loader in `routes.tsx`. Children may use named or default.
- Page default: `PageShell` (Header → Content, optional Footer). Switch to custom only when the design can't be expressed with `PageShell`.
- Framed / bordered content default: `DashboardCard` (or `DashboardCardPreset`). Reach for `ui/Card` only when `DashboardCard` can't meet the requirement.
- Before using any component, open its source to confirm Props + usage — don't assume.
- React hooks as named imports (`import { useState } from "react"`). Never `import React from "react"` — JSX transform is automatic.
- ECharts: `import type { EChartsOption } from "echarts"` only. Use `@/components/data/echart` for the chart component itself.

### Splitting

Split a page into children when it has **3+ sections**, **multiple `useQuery` calls**, or **complex logic** (tables, forms).

- Children at `src/components/<pageName>/<component-name>.tsx`.
- Self-contained — fetches own data, owns loading / error UI.
- 1–2 section pages or small edits: keep in single page file.

---

## Catalog

Only components with **non-obvious usage** or **error-prone behavior** detailed. Others enumerated.

### `components/ui/` — shadcn/Radix primitives

| Component | When to use | Gotcha |
|---|---|---|
| `Select` / `SelectItem` | Single-choice dropdown | `value=""` forbidden (Radix throws) — use `"all"` for null-like option |
| `Combobox` / `Command` / `CommandItem` | Escape hatch for custom searchable dropdown. For standard searchable single-select use `SearchableSelect` from `@/components/common/searchable-select` | `CommandItem` `value` is the cmdk search key — drift from displayed text breaks search. `onSelect` fires with lowercased value |
| `Dialog` / `Sheet` | Modal / side panel | `DialogTitle` + `DialogDescription` **required** (a11y warning). Hide via `className="sr-only"` if not shown |
| `Tooltip` | Hover hint | `TooltipProvider` **required at app root**. Without it, tooltips silently fail |
| `Tabs` | Tabbed content | Without `defaultValue` or `value`, no tab active on mount (silent empty content) |
| `ToggleGroup` | Single / multi toggle | `type="single"` → `value: string`. `type="multiple"` → `value: string[]`. Mixing causes shape mismatch |
| `Calendar` / `DatePicker` | Date selection primitives | Requires `Date` instance (strings / `null` trigger react-day-picker warnings). For range selection use `DateRangePicker` from `@/components/data/date-range-picker` |
| `DropdownMenuCheckboxItem` / `RadioItem` | Checkbox / radio menu items | `checked` must be controlled. Wrap radios in `DropdownMenuRadioGroup` |

No gotcha (enumerated): `Button`, `Card`, `Badge`, `Label`, `Separator`, `Skeleton`, `Avatar`, `Progress`, `Accordion`, `Breadcrumb`, `Pagination`, `Alert`, `Collapsible`, `Empty`, `Spinner`, `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Table`, `Toggle`.

> `Card` allowed but not default — prefer `DashboardCard` from `components/common/` unless it can't satisfy the requirement.

### `components/common/` — app-level building blocks

| Component | When to use | Gotcha |
|---|---|---|
| `AppShell` | Outer layout wrapping every route | `groups: NavGroup[]` required. `linkComponent` must accept `href` + `aria-disabled`. Sidebar context doesn't exist when `variant="header"` |
| `PageShell` / `PageShellHeader` / `PageShellContent` / `PageShellSummary` / `PageShellSummaryCard` | Default page frame. `PageShellSummary` is the responsive KPI grid inside `PageShellHeader` — **inside it use `PageShellSummaryCard`, NOT `DashboardCard`** | Child order: Header → Content (→ Footer). Reversing breaks layout. `PageShellSummaryCard` `accent`: `"default" \| "accent" \| "amber" \| "blue" \| "emerald" \| "red" \| "violet" \| "orange" \| "cyan" \| "slate"` |
| `DashboardCard` / `DashboardCardPreset` | Default frame for widgets + bordered content — prefer over `ui/Card`. Two forms: **Composable** (`DashboardCard` + `DashboardCardHeader` / `Title` / `Description` / `Action` / `Content` / `Footer`) for fine-grained layout, **Preset** (`DashboardCardPreset` with `title` / `description` / `actions` / `footer` / `children` props) as concise default. Combine with `Sparkline` inside `DashboardCardContent` for richer KPI widgets | `theme` resolved via `SquadbaseTheme` — don't pass manually |
| `MarkdownRenderer` | Markdown rendering | Input **NOT XSS-sanitized**. Sanitize user-generated content with DOMPurify beforehand |
| `MultiSelect` | Multi-select (tags) | `value` must be `string[]` (not `undefined`). Each option `value` ≠ empty string (inherits shadcn restriction) |
| `SearchableSelect` | Standard searchable single select — prefer over `ui/Combobox` unless fully custom needed | `value` is `string \| undefined`. `onChange` passes `undefined` on clear. Empty-string options forbidden |
| `SectionHeader` | Section title bar | `as` accepts `h1`–`h4` only |
| `SegmentedControl` | Exclusive toggle | Re-clicking active value does NOT deselect (always one selected). Mismatched `options[].value` vs `value` → silent no-selection |
| `StatusBadge` | Status indicator | `status` values missing from `colorMap` silently fall back to gray |

`select-types.ts` is types only. Call `flattenOptions()` before searching grouped options.

### `components/data/` — data display

| Component | When to use | Gotcha |
|---|---|---|
| `DataTable` | Structured tables (sort / filter / pagination / selection) | Every column needs `id` or `accessorKey`. `useDataTable()` throws outside context. `enableRowSelection=true` auto-injects selection column (mind column counts). `globalFilter` = simple substring match |
| `ColumnVisibility` | Toggle DataTable column visibility | none |
| `DateRangePicker` | Preset-backed range picker (today / last 7/30/90 days) | `value` is `{ from?: Date; to?: Date }`; both may be `undefined`. `minDate` / `maxDate` are client-side only |
| `EChart` (`@/components/data/echart`) | Theme-resolved ECharts wrapper — the only chart component in this template | `@/components/ui/chart` / `@/components/ui/echarts` don't exist — always import from `@/components/data/echart`. `option` must conform to ECharts shape. Auto radar coloring fires only when `series[0].data.length === 2`; `option.color` takes precedence. `decal=true` injects hatching patterns |
| `FilterBar` (+ `FilterBarSelect`, etc.) | Dashboard filter composition | `FilterOption.value` ≠ empty string (use `"all"` for all-select). Clear chip by passing `undefined` (not `null`) |
| `FunnelSteps` | Funnel visualization | Data must be sorted descending (largest first). Conversion with previous value `0` renders `"--"`. Colors = Tailwind classes only (no inline CSS) |
| `MetricValue` / `MetricUnit` | Large KPI number | none |
| `ProgressCircle` | Circular progress | `value` auto-clamped 0–100. Color = Tailwind class (e.g., `text-chart-1`) |
| `RefreshControl` | Last-updated + manual / auto refresh | `lastUpdatedAt` must be `Date`. `autoRefreshInterval` in **seconds**. Doesn't `await` `onRefresh` — caller manages `isRefreshing` |
| `Sparkline` | Mini trend chart | Empty data → `null`. `area=true` works only with `variant="line"` |
| `Tracker` | Status timeline bar | `status` takes precedence over `color`. Wraps own `TooltipProvider` — **don't nest inside another** |
| `TrendIndicator` | Delta percentage badge | `direction`: `"up" \| "down" \| "neutral"`. `value` is plain number (`%` appended internally). `positiveIsGood=false` flips color. `neutral` always renders gray |

---

## Related skills

- `component-generation` — page / child creation order, export conventions, `useQuery` data-fetching. Read alongside this catalog when authoring any page.
- `general/dashboard-ui-design` — framework-agnostic UI principles (layout, hierarchy, chart selection) for deciding *which* components to compose.
