---
name: advanced-echarts-patterns
description: Advanced ECharts visualization patterns — composite charts, pie/donut, stacked, gauge, data zoom, tooltips, scatter with pitfall avoidance for dashboard development
---

# Advanced ECharts Patterns

For basic ECharts setup, `EChartsWrapper` props, and simple bar/line charts, see the `frontend-development` skill.

## Rules

```tsx
import type { EChartsOption } from "echarts";
import { EChartsWrapper } from "@/components/ui/echarts";
```

- **notMerge**: Every `EChartsOption` object must be complete — `EChartsWrapper` replaces the entire option on each render. Never pass partial options.
- **useMemo**: When options depend on fetched data, wrap with `useMemo`. Static options can be defined at module scope.
  ```tsx
  const option = useMemo<EChartsOption>(() => ({ ... }), [data]);
  ```
- **No axes on non-cartesian charts**: Never include `xAxis` or `yAxis` in pie, gauge, or treemap charts.
- **Empty data**: Check `data.length` before building chart options — render `<Empty />` when there's no data.
- **Performance**: For 1k+ data points on line/scatter, add `large: true` and `sampling: "lttb"` to the series. For auto-refresh dashboards, set `animation: false`.

## Data Format Reference

| Chart Type | `series.data` Format | Axis Config |
|---|---|---|
| bar / line | `number[]` | xAxis: category, yAxis: value |
| area | `number[]` (+ `areaStyle: {}`) | xAxis: category, yAxis: value |
| stacked bar/area | `number[]` (+ `stack: "total"`) | xAxis: category, yAxis: value |
| pie / donut | `{ name: string, value: number }[]` | No axes |
| gauge | `[{ value: number }]` | No axes |
| scatter | `[number, number][]` or `[x, y, size][]` | xAxis: value, yAxis: value |
| treemap | `{ name, value, children? }[]` | No axes |

## 1. Multi-Series & Composite Charts

Dual Y-axis enables bar + line composites for metrics with different scales.

```tsx
const option: EChartsOption = {
  tooltip: { trigger: "axis" },
  legend: { data: ["Revenue", "Growth Rate"] },
  xAxis: { type: "category", data: ["Q1", "Q2", "Q3", "Q4"] },
  yAxis: [
    { type: "value", name: "Revenue ($)" },
    { type: "value", name: "Growth (%)" },
  ],
  series: [
    {
      name: "Revenue",
      type: "bar",
      data: [4200, 5800, 7100, 6900],
    },
    {
      name: "Growth Rate",
      type: "line",
      yAxisIndex: 1,
      data: [12.5, 38.1, 22.4, -2.8],
    },
  ],
};
```

- `yAxisIndex: 1` links a series to the second Y-axis.
- Always include `legend.data` matching each `series.name` for composite charts.

## 2. Custom Tooltip Formatters

Tooltip behavior differs by `trigger` type:

- **`trigger: "axis"`** (bar/line/area): `params` is an **array** — iterate with `params.map(...)`.
- **`trigger: "item"`** (pie/scatter/gauge): `params` is a **single object** — access `params.name`, `params.value`.

```tsx
const option: EChartsOption = {
  tooltip: {
    trigger: "axis",
    formatter: (params: any) => {
      const header = `<strong>${params[0].axisValueLabel}</strong>`;
      const rows = params.map(
        (p: any) =>
          `${p.marker} ${p.seriesName}: $${p.value.toLocaleString()}`
      );
      return [header, ...rows].join("<br/>");
    },
  },
  // ... series, axes
};
```

Number formatting: `value.toLocaleString()` for comma separators, `.toFixed(2)` for decimals.

## 3. Pie & Donut Charts

Donut: set `radius: ["40%", "70%"]` (inner, outer). Pie: `radius: "70%"` only.

```tsx
const option: EChartsOption = {
  tooltip: { trigger: "item" },
  legend: { orient: "vertical", left: "left" },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: true,
      label: { formatter: "{b}: {d}%" },
      data: [
        { name: "Direct", value: 335 },
        { name: "Email", value: 310 },
        { name: "Search", value: 234 },
        { name: "Social", value: 135 },
      ],
    },
  ],
};
```

- `{b}` = name, `{c}` = value, `{d}` = percentage.
- Use ECharts `graphic` component for donut center text.
- No `xAxis` / `yAxis` — pie charts must omit them entirely.

## 4. Stacked & Area Charts

- Stacked bar: add `stack: "total"` to each bar series.
- Stacked area: `type: "line"` + `areaStyle: {}` + `stack: "total"`.
- Use stacked for part-of-whole composition. Use grouped (no `stack`) for side-by-side comparison.

```tsx
const series: EChartsOption["series"] = [
  { name: "Organic", type: "line", stack: "total", areaStyle: {}, data: [120, 200, 150, 80, 70] },
  { name: "Paid", type: "line", stack: "total", areaStyle: {}, data: [60, 120, 90, 140, 130] },
  { name: "Referral", type: "line", stack: "total", areaStyle: {}, data: [30, 50, 70, 40, 60] },
];
```

## 5. Gauge Charts

KPI gauge for single-value metrics. **Always set `max`** — the default is 100, which silently produces wrong visuals for non-percentage KPIs.

```tsx
const option: EChartsOption = {
  series: [
    {
      type: "gauge",
      max: 100,
      data: [{ value: 72.5 }],
      detail: { formatter: "{value}%", fontSize: 24 },
      axisLine: {
        lineStyle: {
          color: [
            [0.3, "#fd666d"],
            [0.7, "#37a2da"],
            [1, "#67e0e3"],
          ],
        },
      },
    },
  ],
};
```

- Threshold coloring: each `[breakpoint, color]` pair defines a segment (0-0.3 red, 0.3-0.7 blue, 0.7-1 green).
- No `xAxis` / `yAxis` for gauge charts.

## 6. Data Zoom & Scatter

### Time-Series with Data Zoom

`slider` shows a visible scrollbar; `inside` enables mouse wheel / pinch zoom.

```tsx
const option: EChartsOption = {
  xAxis: { type: "category", data: months },
  yAxis: { type: "value" },
  series: [{ type: "line", data: values, large: true, sampling: "lttb" }],
  dataZoom: [
    { type: "slider", start: 0, end: 100 },
    { type: "inside" },
  ],
  tooltip: { trigger: "axis" },
};
```

### Scatter & Bubble

Scatter requires `xAxis: { type: "value" }` — NOT `"category"`.

```tsx
const option: EChartsOption = {
  xAxis: { type: "value", name: "Age" },
  yAxis: { type: "value", name: "Income" },
  tooltip: { trigger: "item" },
  series: [
    {
      type: "scatter",
      data: [
        [25, 45000, 10],
        [30, 62000, 15],
        [35, 78000, 20],
      ],
      symbolSize: (val: number[]) => val[2],
    },
  ],
};
```

- Bubble size: use `symbolSize` function with 3-element arrays `[x, y, size]`.
- For 1k+ points, add `large: true` to the series.

## Color Palette

Override the default palette at the top level of the option:

```tsx
const option: EChartsOption = {
  color: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272"],
  // ... rest of option
};
```

Use a consistent palette across all charts in a dashboard for visual coherence.
