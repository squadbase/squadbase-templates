---
name: component-generation
description: Rules for generating TSX components used with buildPageSection (export, imports, layout)
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

