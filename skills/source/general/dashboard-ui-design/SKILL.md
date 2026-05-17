---
name: dashboard-ui-design
description: Framework-agnostic UI/UX principles for dashboards. Read when designing a new dashboard page or restructuring an existing one — layout, hierarchy, color, typography, chart selection.
---

# Dashboard UI Design Guide

Framework-agnostic design principles. For framework-specific implementation, see Related skills.

Entry point: philosophy, IA, Do/Don't. Topic details live in `references/`.

---

## 1. Philosophy

Decide direction before coding. Avoid generic UI — choose by purpose, audience, context.

- **Purpose first** — what it communicates, who reads it
- **Data is the star** — clarity beats decoration
- **Consistency** — unify color / type / spacing across screens
- **Impact** — build rhythm, hierarchy, story; not just an orderly grid

### Dashboard types — pick one before designing

| Type | Traits | Examples |
|------|--------|----------|
| **Presentational** | At-a-glance KPIs, simple layout, passive reader | Executive KPI, weekly report |
| **Exploratory** | Filters, drill-down, active investigation | Sales analysis, ops monitoring |

Presentational → "understood at a glance". Exploratory → "reach target data fast".

---

## 2. Information Architecture

Define before coding:

```
Who  : exec / operator / engineer
What : KPI / trend / anomaly / detail
Why  : decide / monitor / report
When : real-time / daily / weekly
Where: desktop-first / mobile too
```

### Content priority (top → bottom)

1. Page title + short description
2. Most important KPI cards
3. Trend charts
4. Detail tables (drill-down)
5. Footnotes, update time, data source

---

## 3. Detail topics (load on demand)

- **Layout, grid, header patterns** → [`references/layout.md`](./references/layout.md)
- **Color, chart colors, accessibility, typography** → [`references/color-typography.md`](./references/color-typography.md)
- **KPI anatomy, tables, filters, loading / empty** → [`references/component-patterns.md`](./references/component-patterns.md)
- **Chart selection tree, comparison, common rules** → [`references/chart-selection.md`](./references/chart-selection.md)

---

## 4. Do & Don't

### Do

- Most important info → top-left
- Hero chart large (full or 2/3 width)
- Header sets rhythm (filter / summary / story)
- Enrich cards with sparklines / progress bars
- Stick to semantic color tokens
- Generous whitespace
- Provide context for numbers (comparison, delta, target)
- Always implement loading / error / empty states
- Include units on numbers
- Configure tooltips on every chart
- Decide single most important chart first
- Tell a story (esp. presentational), not just a list of facts

### Don't

- All cards same size and weight (no hero)
- Header = only title + description
- Rely on color alone for meaning
- Y-axis start anywhere but 0
- 3D charts
- Charts as decoration (no chart without data)
- 10+ charts on one page
- Legends far from their chart
- Hardcoded colors (use semantic tokens)
- One chart type fills the whole screen

---

## References

- [`references/layout.md`](./references/layout.md) — page structure, grid, hierarchy, header patterns
- [`references/color-typography.md`](./references/color-typography.md) — semantic tokens, chart colors, accessibility, type scale
- [`references/component-patterns.md`](./references/component-patterns.md) — KPI cards, tables, filters, loading / empty
- [`references/chart-selection.md`](./references/chart-selection.md) — chart comparison, decision tree, common rules

## Related skills

- `squadbase-vite-react/component-generation` — page / child creation order in Vite template
- `squadbase-vite-react/available-component-catalog` — KPI cards, charts, filters shipped in template
