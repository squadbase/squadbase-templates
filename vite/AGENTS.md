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
  hooks/
    use-data-source-query.ts  # Data fetching hook
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

```tsx
import { useDataSourceQuery } from "@/hooks/use-data-source-query";

const { data, isLoading, error } = useDataSourceQuery("slug");
// With params:
const { data, isLoading } = useDataSourceQuery("sales-by-region", { region });
```

- 1st arg: data source slug
- 2nd arg (optional): params object
- `data` is always an array
- Always show `<Skeleton />` while loading; always handle `error`

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

Split page into components when creating a **new page** with 3+ sections, multiple `useDataSourceQuery` calls, or complex logic (tables, forms).

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

## Reference

Full Japanese guidelines with detailed examples: `skills/frontend-development.md`
