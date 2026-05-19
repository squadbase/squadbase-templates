# Layout Reference

Page layout, grid, header patterns. Pair with `SKILL.md` + `component-patterns.md`.

## Structure

Center the page in a container (max-width ~1152px). ~24px between sections, ~16px between related elements.

```
[Page container — centered, max-width, padded]
  ├── Header (title + description + actions)
  ├── KPI card row
  ├── Chart row
  └── Table row
```

## Grid patterns

| Use | Layout |
|-----|--------|
| KPI cards (4 up) | 4-col grid, 2-col mobile |
| KPI cards (3 up) | 3-col grid, 2-col mobile |
| Two charts side by side | 2-col grid, 1-col mobile |
| Primary chart + sidebar | 3-col grid: 2/3 hero, 1/3 side |
| Full-width chart / table | Single column |

## Visual flow

- Place key info on Z / F scan path (top-left → bottom-right).
- If too dense, split with tabs.

## Visual hierarchy

Distinguish hero from supporting content through layout — avoid monotone equal grid.

- **Hero chart** — full or 2/3 width
- **Supporting cards** — 1/3 width or smaller
- **KPI row** — equal sizing OK; consider enlarging one critical card
- **KPIs above hero chart** — keep visually smaller than hero. Flow = "numbers for overview → chart for detail"

## Header patterns

Don't settle for title + description. Pick by purpose:

| Pattern | Traits | Best for |
|---------|--------|----------|
| **Filter** | Date range / period selector on right | Analysis, exploratory |
| **Status summary** | Top KPIs inline in header | Executive KPI, monitoring |
| **Storytelling** | Prose summary ("today's sales +12% vs yesterday") | Daily report, presentational |

Header should establish context the moment the user lands.

## Never

- 10+ charts on one screen
- All cards same size + weight (no hero)
- Cram everything above the fold
- Header with only title + description
