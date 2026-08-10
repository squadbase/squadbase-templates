# AGENTS.md — Squadbase Vite Template

Guidance for coding agents working in this template. A Squadbase project is a full-stack React SPA + API server in one repo.

## Routing

Routes are explicit in `src/routes.tsx` — the single source of route truth. To add a page:

1. Create `src/pages/<name>.tsx` with a **default export** component.
2. Append a `RouteConfig` entry in `routes.tsx`: `component: lazy(() => import("./pages/<name>"))`, plus `path`, `title`, and optional `icon` from `lucide-react`.
3. Nav entries in `App.tsx` are generated from `routes` — no manual nav edit needed.

- **The page component MUST be a default export, dynamically imported via `lazy(() => import(...))`.** `RouteConfig.component` is typed `LazyExoticComponent<ComponentType>`; a static or named import fails type-checking and disables route-level code splitting.
- Import the router from `react-router` (v8) — **not** `react-router-dom` (the package was removed in v8; runtime and type errors).

### Where to implement

| Need | Do this | Not this |
|---|---|---|
| API endpoint / backend logic | Create `server-logic/<slug>.ts` or `server-logic/<slug>.json` (SQL) | Edit `vite.config.ts` or add Express/Hono routes manually |
| New provider or context | Wrap inside the page or component that needs it | Edit `src/main.tsx` |
| Custom layout | Create a layout component in `src/components/common/` and use it inside pages | Edit `src/App.tsx` |
| New route | Add `src/pages/<name>.tsx` and append to `routes.tsx` | Hand-edit the generated nav in `App.tsx` |
| Style change | Apply Tailwind utilities on components | Edit `src/index.css` tokens |
| New dependency | `npm install` + commit `package.json` | Patch files inside `node_modules/` |

## Component Rules

- `src/components/ui/` holds shadcn/ui primitives — **DO NOT edit or recreate them.**
- Files prefixed `_` in `src/pages/` (e.g. `_router.tsx`) are infrastructure, not pages — do not register them as routes.
- Every **page** (`src/pages/*.tsx`) uses `export default function` — required by the `lazy()` loader in `routes.tsx`. Components under `src/components/` may use named or default exports.
- **Keep a component/page file to component, constant, and type exports only.** `react-refresh/only-export-components` (Fast Refresh) warns when a file that exports a component *also* exports a hook, helper function, or other runtime value — move those into a separate module. Plain constants and type-only exports are fine.
- Page files default to `PageShell` (Header → Content, optional Footer). Only switch to a custom layout when the requested design explicitly cannot be expressed with `PageShell`.
- Framed / bordered content defaults to `DashboardCard` (or `DashboardCardPreset`) — both imported from `@/components/common/dashboard-card`. Reach for `ui/Card` only when `DashboardCard` genuinely cannot meet the requirement.
- **Import building blocks via the exact path in the "Component import paths" table below — every one is a _named_ import.** Never construct a path from a component's name: `@/components/dashboard/DashboardCardPreset` does **not** exist (the real path is `@/components/common/dashboard-card`). If a component you want is not in the table and you don't know its exact path, use a `@/components/ui/*` primitive instead or inline your own — do not invent an import path.
- Import React hooks as named imports (`import { useState } from "react"`). Never `import React from "react"` — the JSX transform is automatic.
- **Unused imports, variables, and parameters fail the build — not just lint.** `tsconfig` enables `noUnusedLocals`/`noUnusedParameters`, so `tsc` (and therefore `npm run build`) errors on any leftover. Delete them. A parameter you must keep in the signature but don't use may be prefixed with `_` to silence the check; there is no such exemption for imports or local variables — those must actually be removed.
- **Select-family `value` cannot be an empty string.** `Select`/`SelectItem`, `MultiSelect`, `SearchableSelect`, and `FilterBar` all inherit the Radix rule — an empty-string value **throws**. Use a non-empty sentinel like `"all"` for null-like options.
- **`MarkdownRenderer` does NOT sanitize input.** Run user-generated content through DOMPurify (or equivalent) before passing it in.
- **`DataTable`**: every column needs an `id` or `accessorKey`, and `useDataTable()` **throws** outside the table context.
- **`FunnelSteps`**: data must be sorted **descending** (largest first), or the funnel silently renders wrong.

### Component import paths

Every building block below is a **named** export — e.g. `import { DashboardCardPreset } from "@/components/common/dashboard-card"`. Use these exact paths; do not guess a path from a component's name. (shadcn primitives live under `@/components/ui/<name>`.)

| Import path | Named exports (main) |
|---|---|
| `@/components/common/dashboard-card` | `DashboardCard`, `DashboardCardPreset`, `DashboardCardHeader`, `DashboardCardTitle`, `DashboardCardDescription`, `DashboardCardAction`, `DashboardCardContent`, `DashboardCardFooter`, `DashboardCardSkeleton` |
| `@/components/common/page-shell` | `PageShell`, `PageShellHeader`, `PageShellTitle`, `PageShellContent`, `PageShellActions`, `PageShellSummary`, `PageShellSummaryCard` |
| `@/components/common/app-shell` | `AppShell` |
| `@/components/common/placeholder` | `Placeholder` |
| `@/components/common/section-header` | `SectionHeader` |
| `@/components/common/status-badge` | `StatusBadge` |
| `@/components/common/segmented-control` | `SegmentedControl` |
| `@/components/common/multi-select` | `MultiSelect` |
| `@/components/common/searchable-select` | `SearchableSelect` |
| `@/components/common/markdown-renderer` | `MarkdownRenderer` |
| `@/components/data/echart` | `EChart` |
| `@/components/data/data-table` | `DataTable`, `useDataTable`, `DataTableToolbar`, `DataTablePagination`, `DataTableColumnVisibility`, `DataTablePreset` |
| `@/components/data/metric-value` | `MetricValue`, `MetricUnit` |
| `@/components/data/progress-circle` | `ProgressCircle` |
| `@/components/data/sparkline` | `Sparkline` |
| `@/components/data/trend-indicator` | `TrendIndicator` |
| `@/components/data/funnel-steps` | `FunnelSteps` |
| `@/components/data/tracker` | `Tracker` |
| `@/components/data/date-range-picker` | `DateRangePicker` |
| `@/components/data/filter-bar` | `FilterBar`, `FilterBarSelect`, `FilterBarMultiSelect` |
| `@/components/data/refresh-control` | `RefreshControl` |
| `@/components/data/column-visibility` | `ColumnVisibility` |

### ECharts

- **Type `option` with a `: EChartsOption` annotation or `satisfies EChartsOption` — never an `as` cast.** A cast hides the very error this catches: without annotation, literals like `type: "category"` widen to `string` and the build fails. Import the `EChartsOption` type from `"echarts"`; import the `EChart` component from `@/components/data/echart` (the only chart component — `@/components/ui/chart` does not exist).
- **Do not hardcode chart colors.** `EChart` resolves the `--chart-1`…`--chart-5` tokens at runtime and re-themes on the `squadbase-theme-change` event for light/dark. Leave `option.color` unset and let the wrapper color the series (its 2-series auto-coloring fires when `series` has length 2; an explicit `option.color` takes precedence).
- **Size the chart with the `height` prop or a `className` height — both work.** Width is always 100% of the parent (there is no `width` prop). For height, either: (a) pass `height` — a number for pixels (`height={300}`) or a CSS string (`height="50vh"`); or (b) pass a Tailwind height class via `className` (`h-full`, `h-[360px]`) — the canvas fills the wrapper, so the class controls the chart. With no `height` the wrapper defaults to `h-[400px]`. Caveats: `h-full` requires the parent to have a definite height; if you pass **both** `height` and a `className` height, `height` (inline style) wins.
- Note the asymmetry with data fetching: server-logic responses **require** an `as` cast (they are untyped), whereas ECharts options **forbid** one.

### Component splitting

Split a page into child components when it has **3+ sections**, **multiple `useQuery` calls**, or **complex logic** (tables, forms).

- Place children at `src/components/<pageName>/<component-name>.tsx`.
- Each child is self-contained — it fetches its own data and owns its loading/error UI.
- For 1–2 section pages or small partial edits, keep everything in the single page file.

## Data Fetching

Call server logic via `useQuery` + `POST /api/server-logic/<slug>` (`<slug>` is the server-logic filename, without extension):

```tsx
import { useQuery } from "@tanstack/react-query";

// ...

const { data, isLoading, error } = useQuery({
  queryKey: ["server-logic", "sales-summary", params],
  queryFn: async () => {
    const res = await fetch("/api/server-logic/sales-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params }),
    });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return /* see Response shape below */;
  },
  staleTime: 5 * 60 * 1000,
});
```

- `queryKey` must be `["server-logic", slug, params]` so cache invalidation works when params change.
- `staleTime: 5 * 60 * 1000` (5 min) is the default; adjust per endpoint if data changes faster.
- Explicitly cast the parsed body (`as YourType`) — server responses are untyped. (Contrast: ECharts options must NOT be cast — annotate instead.)
- Always render `<Skeleton />` while `isLoading`, and surface `error` (e.g. via `<p className="text-destructive">{error.message}</p>`). Never unwrap `data` without that guard.

### Response shape

The `return` line in `queryFn` depends on the handler type:

- **SQL server logic** — results are wrapped in `{ data: rows[] }`: `return json.data as SalesRow[];`
- **TypeScript server logic** — the handler's `Response` is passed through as-is: `return json as DashboardSummary;`

## Styling

- Use semantic color tokens, not raw Tailwind color classes: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`, `text-primary`, `text-destructive`, `border-border`.
- Components have sensible default styles — do not customize them unless the user explicitly asks.
- Always design layouts with responsive behavior in mind.

## Boundaries

- Do not extend the server-logic JSON schema ad hoc.
- Do not introduce a different router, state manager, or data-fetching library — use React Router v7 and TanStack Query.
- Do not downgrade Tailwind v4 idioms to v3 (no `tailwind.config.*`, no `@apply` outside CSS layers).
