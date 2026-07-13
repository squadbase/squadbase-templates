---
name: component-generation
description: General rules for creating React component files (pages and child components) in the Squadbase Vite template — recommended creation order, export/import conventions, data fetching patterns, error guards, composition and styling defaults.
---

# Component Generation Rules

Rules for any React component file: `src/pages/*.tsx` (pages) and `src/components/**/*.tsx` (children). Applies to direct writes, `buildPageSection`, and edits. For props / gotchas / when-to-use of the pre-installed components, see `preinstalled-component-catalog`.

## Creation order (strongly recommended)

When a page composes child components, **always** create files in this order. Importing a child before its file exists throws a Vite module-resolution error, blocking preview and aborting the agent loop.

1. **Page file with `Skeleton` placeholders, no child imports.** Lay out `PageShell` + headers, drop `<Skeleton className="..." />` (from `@/components/ui/skeleton`) sized to match each planned child. Only import modules that exist.
2. **Each child file** at `src/components/<pageName>/<component-name>.tsx`. Self-contained (own data fetching + loading / error UI).
3. **Update page file** — add child imports, replace placeholders.

Do not collapse steps 1 and 3 — the intermediate state (page imports non-existent file) surfaces as a dev-server error and aborts preview.

For 1–2 section pages with no child split, skip straight to a single page file.

## Export

- **Pages** (`src/pages/*.tsx`) — exactly one `export default function PageName()`. Required by `lazy()` loader in `routes.tsx`.
- **Children** (`src/components/**/*.tsx`) — named export convention (`export function ComponentName()`). Default works but inconsistent with the codebase.
- Self-contained children take no props (fetch own data). Add props only when parent must configure (e.g., shared filter value).

## Imports

- Existing components are almost always **named exports**. Open source to confirm export name + Props before importing.
- Use `@/*` alias (`@/components/common/page-shell`), not relative cross-directory paths.
- React hooks as named imports (`import { useState } from "react"`). Never `import React from "react"` — JSX transform is automatic.
- Never import a file that doesn't yet exist — see Creation order.

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

- `queryKey` **must** be `["server-logic", slug, params]` so cache invalidates on param change.
- `body: JSON.stringify({ params })` — wrap under `params`. (Chat/streaming exception → `chat-app-development`.)
- Cast parsed body (`as YourType`) — server responses untyped.
- `staleTime: 5 * 60 * 1000` (5 min) default; tighten only for fast-changing data.

### Loading / error guards

- `if (isLoading) return <Skeleton className="..." />;`
- `if (error) return <p className="text-destructive">{error.message}</p>;`
- Never call `.filter()` / `.map()` / `.length` on `data` without null guard.

### Response shape

`return` in `queryFn` depends on handler type:

- **SQL** — `{ data: rows[] }` wrapper: `return json.data as SalesRow[];`
- **TypeScript** — handler's `Response` passes through as-is: `return json as DashboardSummary;`

## Composition defaults

- Page frame: `PageShell` → `PageShellHeader` → `PageShellContent` (optional footer last). Reversing breaks layout.
- Framed / bordered widgets: `DashboardCardPreset` (or composable `DashboardCard` + sub-parts). Reach for `ui/Card` only when Dashboard equivalents can't express the layout.
- Inside `PageShellSummary`: `PageShellSummaryCard` (NOT `DashboardCard`). Accent values: `"default" | "accent" | "amber" | "blue" | "emerald" | "red" | "violet" | "orange" | "cyan" | "slate"`.

## Styling

- Semantic tokens — `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`, `text-primary`, `text-destructive`, `border-border` — not raw Tailwind color scales.
- Components ship with sensible defaults. Don't restyle unless required.

---

## Related skills

- `preinstalled-component-catalog` — props, gotchas, when-to-use map for every component shipped with the template. Read before importing one of those to confirm export names + pitfalls. (For project-added components under `src/components/<pageName>/`, read the source file directly — they're not in the catalog.)
- `server-logic-development` — defining the backend endpoint `useQuery` calls. `{ params }` body shape, response format, caching.
- `chat-app-development` — when page is an LLM chat UI. `useChat` instead of `useQuery`, different body shape.
- `project-storage` — reading or writing the project's uploaded files from a component (list files; embed images / video / PDFs; upload). Load via `readSkill` when a page displays or uploads stored files.
- `general/dashboard-ui-design` — framework-agnostic principles to decide layout, hierarchy, chart selection before coding.
