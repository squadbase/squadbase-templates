---
name: dashboard-best-practices
description: Dashboard page composition patterns — KPI cards with sparklines, grid layouts, data transformation, comparison metrics, filter bars, URL state, debounced search
---

# Dashboard Best Practices

## Rules & Cross-References

- For full `useQuery` boilerplate, component list, `Skeleton` loading, and `EChartsWrapper` props, see the `frontend-development` skill.
- For import allow-list and `buildPageSection` conventions, see the `component-generation` skill.
- **Additional allowed import**: `react-router` — for `useSearchParams` (on top of `component-generation`'s allow-list).
- **Null guard**: NEVER call `.reduce()`, `.map()`, `.filter()`, `.length` on `data` without a null guard — `data` is `undefined` until the fetch resolves. Use `data ?? []` or an early `if (!data) return ...`.
- **useMemo**: Data transformations MUST be wrapped in `useMemo` — never run `.reduce()` or expensive transforms in the render path without memoization.
- **Component composition**: Each dashboard section is a separate component in `src/components/{pageName}/` with its own `useQuery` and `default export`. The parent page composes them inside a grid layout.

## 1. Dashboard Grid Layout

Page container and responsive grid rows:

```tsx
<div className="container mx-auto max-w-6xl space-y-8 p-8">
  <h1 className="text-3xl font-bold">Dashboard</h1>

  {/* KPI row */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <RevenueKPI />
    <UsersKPI />
    <OrdersKPI />
    <ConversionKPI />
  </div>

  {/* Chart row */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <SalesChart />
    <RegionChart />
  </div>

  {/* Table — full width, no grid */}
  <OrdersTable />
</div>
```

- KPI row: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Chart row: `grid-cols-1 lg:grid-cols-2 gap-6`
- Table section: full-width, no wrapping grid
- Section components live in `src/components/{pageName}/`, each with `default export`

## 2. KPI Card Pattern

Show JSX fragments and sparkline option — not a full self-contained component. The full `useQuery` + loading pattern is covered by `frontend-development`.

Card structure — title in `CardHeader`, metric + trend + sparkline in `CardContent`:

```tsx
<Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    <div className="flex items-center gap-1 mt-1">
      <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
        {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
      </span>
      <p className="text-sm text-muted-foreground">vs last month</p>
    </div>
    <EChartsWrapper option={sparklineOption} height="60px" />
  </CardContent>
</Card>
```

Sparkline option — explicit config required at `height="60px"`:

```ts
const sparklineOption: EChartsOption = {
  grid: { top: 5, right: 5, bottom: 5, left: 5 },
  xAxis: { show: false, type: "category", data: dates },
  yAxis: { show: false, type: "value" },
  series: [{
    type: "line",
    data: values,
    symbol: "none",
    smooth: true,
    lineStyle: { width: 2 },
    areaStyle: { opacity: 0.1 },
  }],
};
```

> Only use sparklines when trend data comes from the same query as KPI metrics — do not add an extra fetch per card.

## 3. Data Transformation for Charts

### Null-guarded groupBy

```ts
const grouped = useMemo(() => {
  if (!data) return {};
  return data.reduce<Record<string, Row[]>>((acc, row) => {
    const key = row.region;
    (acc[key] ??= []).push(row);
    return acc;
  }, {});
}, [data]);
```

### Aggregation

```ts
const totals = useMemo(() => {
  if (!data) return [];
  return Object.entries(grouped).map(([name, rows]) => ({
    name,
    value: rows.reduce((s, r) => s + r.revenue, 0),
  }));
}, [data, grouped]);
```

### Time-series bucketing

Use `row.date.slice(0, 7)` for monthly YYYY-MM grouping — no `date-fns`.

### Full pipeline to EChartsOption

```ts
const option = useMemo<EChartsOption>(() => {
  if (!data) return {};
  const categories = [...new Set(data.map(r => r.month))];
  const regions = [...new Set(data.map(r => r.region))];
  return {
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value" },
    series: regions.map(region => ({
      name: region,
      type: "bar",
      data: categories.map(m =>
        data.filter(r => r.region === region && r.month === m)
          .reduce((s, r) => s + r.revenue, 0)),
    })),
  };
}, [data]);
```

> Keep the query function pure — transform in `useMemo`, not inside the query callback.

## 4. Comparison Patterns

### Zero-guarded percentage change

```ts
const change = previous === 0 ? null : ((current - previous) / previous) * 100;
const changeText = change === null ? "N/A" : `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
const changeColor = change === null ? "text-muted-foreground" : change >= 0 ? "text-green-600" : "text-red-600";
```

### Target vs actual

```tsx
<Progress value={Math.min((actual / target) * 100, 100)} />
```

### Status badge

```tsx
<Badge variant={status === "on-track" ? "default" : "destructive"}>{status}</Badge>
```

## 5. Dashboard Loading & Empty States

Each section component handles its own loading/error — the parent page does not.

### Skeleton grid

Use the same grid classes as the actual dashboard:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <Card key={i}>
      <CardContent className="pt-6">
        <Skeleton className="h-24" />
      </CardContent>
    </Card>
  ))}
</div>
```

### Empty state

```tsx
<Empty>
  <EmptyHeader>
    <EmptyTitle>No data available</EmptyTitle>
    <EmptyDescription>Try adjusting your filters or date range</EmptyDescription>
  </EmptyHeader>
</Empty>
```

### Error isolation

```tsx
if (error) return (
  <Card>
    <CardContent className="pt-6">
      <p className="text-destructive">{error.message}</p>
    </CardContent>
  </Card>
);
```

## 6. Filter Bar Pattern

Filter container layout:

```tsx
<div className="flex flex-wrap items-end gap-4">
  <Select value={category} onValueChange={setCategory}>
    <SelectTrigger>
      <SelectValue placeholder="Category" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Categories</SelectItem>
      <SelectItem value="electronics">Electronics</SelectItem>
      <SelectItem value="clothing">Clothing</SelectItem>
    </SelectContent>
  </Select>

  <DateRangePicker value={dateRange} onSelect={setDateRange} />

  <Button variant="outline" onClick={handleReset}>Reset</Button>
</div>
```

- Use `value="all"` as sentinel for "no filter" — Radix Select does not accept `value=""`.
- When passing to query params: `category === "all" ? undefined : category`.
- DateRangePicker uses `date-fns` internally — consumers do NOT import `date-fns`.

## 7. URL State with useSearchParams

Import from `"react-router"` (NOT the legacy `-dom` package):

```ts
import { useSearchParams } from "react-router";
```

### Reading state

```ts
const [searchParams, setSearchParams] = useSearchParams();
const category = searchParams.get("category") ?? "all";
```

### Writing state — never mutate, always create a new instance

```ts
const next = new URLSearchParams(searchParams);
next.set("category", value);
if (value === "all") next.delete("category");
setSearchParams(next, { replace: true });
```

Always use `{ replace: true }` to avoid polluting browser history with every filter change.

## 8. useQuery with Filters

Show only the delta from `frontend-development`'s useQuery pattern — do NOT repeat the full query/data-fetching boilerplate.

### queryKey with filter values

```ts
const { data, isLoading, isFetching, error } = useQuery({
  queryKey: ["data-source", "sales", { category, startDate, endDate }],
  // ...query function omitted, see frontend-development
  enabled: !!startDate && !!endDate,
});
```

- Include filter values in `queryKey` so the cache invalidates on filter change.
- Use `enabled` to skip the query when required filters are missing.
- Use `isFetching` (not `isLoading`) for filter-change loading indicators — this lets you show stale data with a loading overlay instead of replacing content with a skeleton.

## 9. Debounced Search Input

```ts
import { useState, useEffect } from "react";

const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const id = setTimeout(() => setDebouncedSearch(search), 300);
  return () => clearTimeout(id);
}, [search]);
```

Use `debouncedSearch` in `queryKey`, `search` for the Input value:

```tsx
<Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
```

Alternative: React 19 `useDeferredValue(search)` can replace the manual debounce for rendering-only deferral.

## 10. Tabs & Cross-Component Communication

Controlled Tabs with state:

```tsx
const [tab, setTab] = useState("overview");

<Tabs value={tab} onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <OverviewSection filters={filters} />
  </TabsContent>
  <TabsContent value="details">
    <DetailsSection filters={filters} />
  </TabsContent>
</Tabs>
```

- Lift filter state to the page level and pass it down to section components as props.
- `buildPageSection` components cannot accept props — use `src/components/{pageName}/` with explicit props for this pattern.

## NEVER DO

| Prohibited | Use Instead |
|-----------|-------------|
| `import { ... } from "date-fns"` | Native `Date` methods, `.toISOString()`, `.slice(0, 10)` |
| `<Combobox>` for category filter | `<Select>` with sentinel `value="all"` |
| `setSearchParams({ key: value })` (replaces all params) | `new URLSearchParams(searchParams)` then `.set()` / `.delete()` |
| `<Select value="">` (empty string) | `<Select value="all">` with sentinel |
| Passing props to `buildPageSection` components | `src/components/{pageName}/` with explicit props |
| `useMemo` without null guard on `data` | `if (!data) return ...` inside useMemo callback |
| Data transforms inside `queryFn` | `useMemo` outside the query |
