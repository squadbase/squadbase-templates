# Squadbase Vite Template — Agent Instructions

## Stack

Vite 6 + React 19 + Hono + TypeScript + Tailwind CSS v4 + shadcn/ui
Full-stack: React SPA (client) + Hono API server (Node 20).

## Commands

```
npm run dev      # Start dev server (HMR enabled)
npm run build    # tsc -b + vite build client (dist/client/) + server (dist/server/)
npm run start    # Run production server: node dist/server/index.js
npm run preview  # Vite preview
```

## Project Structure

```
src/
  pages/           # File-based routing. Files starting with _ are excluded from routing.
  components/ui/   # shadcn/ui components — DO NOT recreate these
  hooks/           # Place custom hooks here
server/            # Hono API server (server-side only)
```

**Routing**: `home.tsx` → `/`, `dashboard.tsx` → `/dashboard`
HMR: edits to existing files reflect instantly; new files trigger a full reload.

## Page Pattern

Always use `default export`. Pages live at `src/pages/{name}.tsx`.

```tsx
export default function DashboardPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      {/* content */}
    </div>
  );
}
```

## Data Fetching

Use `useQuery` from `@tanstack/react-query` directly.

```tsx
import { useQuery } from "@tanstack/react-query";

// Basic
const { data, isLoading, error } = useQuery({
  queryKey: ["data-source", "users"],
  queryFn: async () => {
    const res = await fetch("/api/data-source/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params: {} }),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const json = await res.json();
    return json.data as User[];
  },
  staleTime: 5 * 60 * 1000,
});

// With params
const { data } = useQuery({
  queryKey: ["data-source", "sales-by-region", { region }],
  queryFn: async () => {
    const res = await fetch("/api/data-source/sales-by-region", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ params: { region } }),
    });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const json = await res.json();
    return json.data as SalesRow[];
  },
  staleTime: 5 * 60 * 1000,
});
```

- `queryKey` must include slug and params for correct cache invalidation
- `staleTime: 5 * 60 * 1000` (5 min) is the standard; adjust as needed
- Always show `<Skeleton />` while loading; always handle `error`
- Explicitly type the return value with `as YourType`

## UI Components — Always Use These

All from `@/components/ui/`:

| Category | Components |
|----------|-----------|
| Layout | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Separator`, `Tabs`, `Accordion`, `Sidebar`, `Sheet` |
| Data Display | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `Badge`, `Progress`, `Skeleton`, `Spinner`, `Empty` |
| Forms | `Button`, `Input`, `Textarea`, `Label`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Combobox`, `MultiSelect`, `DatePicker`, `DateRangePicker`, `Calendar` |
| Overlays | `Dialog`, `Popover`, `Tooltip`, `DropdownMenu`, `Breadcrumb`, `Alert`, `Pagination` |
| Charts | `EChartsWrapper` from `@/components/ui/echarts` |

## Charts — EChartsWrapper

```tsx
import { EChartsWrapper } from "@/components/ui/echarts";
import type { EChartsOption } from "echarts";

const option: EChartsOption = {
  xAxis: { type: "category", data: ["Jan", "Feb"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [100, 200] }],
  tooltip: { trigger: "axis" },
};

<EChartsWrapper option={option} height="400px" />
```

Props: `option` (required), `height` (default `"400px"`), `className`, `theme` (`"light" | "dark"`).

## Tables — TanStack Table

```tsx
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const columns: ColumnDef<Row>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "amount", header: "Amount" },
];
const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
```

## Styling — Tailwind CSS v4

- Container: `container mx-auto max-w-6xl p-8`
- Responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Semantic colors: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`, `text-primary`, `text-destructive`
- Dark mode via `.dark` class (automatic)

## TypeScript

- Strict mode enabled — no `any` types
- Explicitly type data from data sources

## Component Splitting

Split page into components when creating a **new page** with 3+ sections, multiple `useQuery` calls, or complex logic (tables, forms).

- Components: `src/components/{pageName}/{component-name}.tsx`
- Each component uses `default export` and is self-contained (fetches its own data)

Keep simple 1-2 section pages or partial edits in a single file.

## NEVER DO

| Prohibited | Use Instead |
|-----------|-------------|
| `import React from "react"` | Vite JSX transform handles it automatically |
| `import { cn } from "@/lib/utils"` | Use Tailwind classes directly |
| `@/components/ui/chart` | `@/components/ui/echarts` (EChartsWrapper) |
| `@/components/ui/form` | Individual components: `Input`, `Label`, `Select`, etc. |
| `@/components/ui/toast` | Does not exist |
| Named exports for pages/components | `export default function ...` only |
| `useDataSourceQuery` | `useQuery` from `@tanstack/react-query` directly |

## Reference

Full Japanese guidelines with detailed examples: `skills/frontend-development.md`
