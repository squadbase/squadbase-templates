---
name: component-generation
description: General rules for creating React component files (pages and child components) in the Squadbase Vite template — recommended creation order, export/import conventions, data fetching patterns, error guards, composition and styling defaults.
---

# Component Generation Rules

Rules for authoring any React component file in the Squadbase Vite template — `src/pages/*.tsx` (page files) and `src/components/**/*.tsx` (child components). Apply these whether you are writing directly, using `buildPageSection`, or editing an existing file. For the component catalog (props, gotchas, when-to-use), see the `available-component-catalog` skill.

## Recommended creation order (strongly recommended)

When a page is composed of child components, **always** create files in this order. Importing a child component before its file exists causes the Vite dev server to throw a module resolution error, which blocks preview and interrupts the agent loop.

1. **Create the page file with `Skeleton` placeholders, no child imports.** Lay out `PageShell` + headers and drop a `<Skeleton className="..." />` (from `@/components/ui/skeleton`) sized to match each planned child where it will go. Only import modules that already exist (shadcn primitives, `@/components/common/*`, etc.).
2. **Create each child component file** under `src/components/<pageName>/<component-name>.tsx`. Each child is self-contained (owns its data fetching + loading/error UI).
3. **Update the page file** to add the child imports and replace placeholders with the real components.

Do not collapse steps 1 and 3 into a single write — even if you plan to create the child immediately afterward, the intermediate state (page imports a non-existent file) surfaces as a dev-server error and aborts preview.

When a page has only 1–2 sections and no child split is needed, skip straight to a single page file.

## Export

- **Pages** (`src/pages/*.tsx`): exactly one `export default function PageName()`. Required by the `lazy()` loader in `routes.tsx`.
- **Child components** (`src/components/**/*.tsx`): named export is the convention in this template (`export function ComponentName()`). Default exports work but are inconsistent with the rest of the codebase.
- Self-contained children take no props — they fetch their own data. Add props only when the parent genuinely needs to configure the child (e.g. a shared filter value).

## Imports

- Existing components are almost always **named exports**. Before importing one, open its source file to confirm the export name and Props — do not assume a default export.
- Use the `@/*` alias (e.g. `@/components/common/page-shell`), not relative paths across directories.
- Import React hooks as named imports (`import { useState } from "react"`). Never `import React from "react"` — the JSX transform is automatic.
- Never add an import for a file that does not yet exist on disk — see the creation order above.

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
