# Chart Selection Reference

Decision tree, chart-type comparison, common rules. Pair with `SKILL.md` + `color-typography.md`.

## Quick reference

| Chart | Best for | Avoid when |
|-------|----------|-----------|
| **Line** | Time-series trends, multi-series comparison | 6+ series |
| **Bar (vertical)** | Category comparison | 20+ categories |
| **Bar (horizontal)** | Ranking, long category labels | — |
| **Stacked bar** | Total + parts together | 5+ series |
| **Area** | Time-series totals with composition | 4+ series |
| **Pie** | Share of total | 6+ slices, similar values |
| **Scatter** | Correlation between two variables | — |

## Decision tree

```
Time-series?
  Yes → Magnitude over time? → line / area
        Cumulative or share?  → stacked area
  No  → Category comparison?
          Yes → Ranking?      → horizontal bar
                Otherwise     → vertical bar
          No  → Share?
                  ≤5 items    → pie
                  ≥6 items    → horizontal bar
                  Correlation → scatter
```

## Keep chart types varied

Don't stack the same chart type across a screen.

| Avoid | Prefer |
|-------|--------|
| 3 bar charts in a row | line (trend) + bar (comparison) + donut (composition) |
| 4 line charts in a row | area (cumulative) + horizontal bar (ranking) + KPI cards |

**Rule** — on any screen with 3+ charts, use at least 2 different types.

## Common rules

- Y-axis starts at 0 (no visual exaggeration)
- Always configure tooltips
- Legend whenever 2+ series
- No 3D charts
- Set chart height explicitly
