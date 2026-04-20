---
name: component-generation
description: Rules for generating TSX components used with buildPageSection (export, imports, data fetching patterns, error guards). Must be loaded before using buildPageSection.
---

# Component Generation Rules (for buildPageSection tsxCode)

Constraints for the single TSX component string passed to `buildPageSection`'s `tsxCode` parameter. The component is rendered inside the Squadbase Vite template, so available modules follow that template's layout. For the component catalog (props, gotchas, when-to-use), see the `available-component-catalog` skill.

## Export

- Exactly one default export: `export default function ComponentName()`.
- No props — the component is self-contained and must render without external input.

## Imports

- Existing components are almost always **named exports**. Before importing one, open its source file to confirm the export name and Props — do not assume a default export.

## Data fetching

All server calls go through `useQuery` + `POST /api/server-logic/<slug>`.

```tsx
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

- `queryKey` **must** be `["server-logic", slug, params]` so cache invalidation fires when params change.
- `body: JSON.stringify({ params })` — wrap params under the `params` key. (Chat/streaming endpoints are the exception — see the `chat-app-development` skill.)
- Cast the parsed body (`as YourType`) — server responses are untyped.
- `staleTime: 5 * 60 * 1000` (5 min) is the default; tighten only when data changes faster.

### Loading / error guards

- `if (isLoading) return <Skeleton className="..." />;`
- `if (error) return <p className="text-destructive">{error.message}</p>;`
- Never call `.filter()` / `.map()` / `.length` on `data` without a null guard.

### Response shape

The `return` line in `queryFn` depends on the handler type:

- **SQL server logic** — results are wrapped in `{ data: rows[] }`: `return json.data as SalesRow[];`
- **TypeScript server logic** — the handler's `Response` is passed through as-is: `return json as DashboardSummary;`

## Composition defaults

- Page frame defaults to `PageShell` → `PageShellHeader` → `PageShellContent` (optional footer last). Reversing child order breaks the layout.
- Framed / bordered widgets default to `DashboardCardPreset` (or composable `DashboardCard` + sub-parts). Reach for `ui/Card` only when the Dashboard equivalents cannot express the layout.
- Inside `PageShellSummary`, use `PageShellSummaryCard` (not `DashboardCard`). Accent prop values: `"default" | "accent" | "amber" | "blue" | "emerald" | "red" | "violet" | "orange" | "cyan" | "slate"`.

## Styling

- Use semantic tokens — `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`, `text-primary`, `text-destructive`, `border-border` — not raw Tailwind color scales.
- Components ship with sensible defaults. Do not restyle them unless the request requires it.
