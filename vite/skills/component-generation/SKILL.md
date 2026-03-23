---
name: component-generation
description: Rules for generating TSX components used with buildPageSection (export, imports, data fetching patterns)
---

## Component Generation Rules (for buildPageSection tsxCode)

### Export
- Must have exactly one default export: `export default function ComponentName()`

### Imports — Allowed Only
- `@/components/ui/{name}` — shadcn/ui components (from listComponents)
- `@tanstack/react-query` — `useQuery` for data fetching
- `react` — ONLY named hooks: { useState, useEffect, useMemo, useCallback }
- `@tanstack/react-table` — for tables
- `echarts` — ONLY `import type { EChartsOption } from "echarts"`

### Imports — FORBIDDEN
- `import React from "react"` — NEVER. JSX transform is automatic.
- `import React, { ... } from "react"` — NEVER. Use `import { useState } from "react"` instead.
- Any path not listed above.

### Import Gotchas
- `@/components/ui/chart` does NOT exist → use `@/components/ui/echarts`
- `@/components/ui/form` does NOT exist → use Input, Label, Select individually
- `@/components/ui/toast` does NOT exist
- `@/lib/utils` — do NOT import

### Data Fetching
- Use `useQuery` from `@tanstack/react-query` for all data fetching
- Pattern:
  ```
  const { data, isLoading, error } = useQuery({
    queryKey: ["server-logic", "slug"],
    queryFn: async () => {
      const res = await fetch("/api/server-logic/slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params: {} }),
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const json = await res.json();
      return json.data as YourType[];
    },
    staleTime: 5 * 60 * 1000,
  });
  ```
- queryKey must include slug and params for correct cache invalidation
- Always handle loading: `if (isLoading) return <Skeleton .../>`
- Always handle error: `if (error) return <p className="text-destructive">{error.message}</p>`
- NEVER call `.filter()`, `.map()`, `.length` on `data` without null guard
