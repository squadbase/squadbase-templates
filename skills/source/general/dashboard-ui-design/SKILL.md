---
name: dashboard-ui-design
description: Framework-agnostic UI/UX principles for dashboards and data apps — information design, layout, color, typography, chart selection, visual hierarchy
---

# Dashboard UI Design Guide

Framework-agnostic design principles for dashboards and data apps. For implementation patterns (component imports, chart library APIs), see framework-specific skills.

---

## 1. Design Philosophy

Decide the direction before writing code. Avoid "generic-looking UI" — make intentional choices based on purpose, audience, and context.

- **Purpose first**: state what the dashboard communicates and who uses it.
- **Data is the star**: clarity of data beats decoration and visual effects.
- **Consistency**: unify color, type, and spacing rules across the whole screen.
- **Design for impact**: an orderly grid alone does not engage users — build visual rhythm, hierarchy, and a story.

### Dashboard types

Pick one before designing:

| Type | Traits | Examples |
|------|--------|----------|
| **Presentational** | Shows key metrics at a glance, simple layout, passive reader | Executive KPI, weekly report |
| **Exploratory** | Filters and drill-down, active investigation | Sales analysis, ops monitoring |

Presentational optimizes for "understood at a glance"; exploratory optimizes for "reach the target data fast."

---

## 2. Information Architecture

Define before coding:

```
Who  : audience (exec / operator / engineer)
What : message (KPI / trend / anomaly / detail)
Why  : purpose (decide / monitor / report)
When : cadence (real-time / daily / weekly)
Where: device (desktop-first or also mobile)
```

### Content priority (top → bottom)

1. Page title + short description
2. Most important KPI cards
3. Trend charts
4. Detail tables (drill-down)
5. Footnotes, update time, data source

---

## 3. Layout

### Structure

Center the page in a container (max width ~1152px). Use ~24px between sections, ~16px between related elements.

```
[Page container — centered, max-width, padded]
  ├── Header (title + description + actions)
  ├── KPI card row
  ├── Chart row
  └── Table row
```

### Grid patterns

| Use | Layout |
|-----|--------|
| KPI cards (4 up) | 4-column grid, 2 columns on mobile |
| KPI cards (3 up) | 3-column grid, 2 columns on mobile |
| Two charts side by side | 2-column grid, 1 column on mobile |
| Primary chart + sidebar | 3-column grid: 2/3 hero, 1/3 side |
| Full-width chart / table | Single column |

### Visual flow

- Place key info following the Z / F scan pattern (top-left → bottom-right).
- Avoid cramming. If too dense, split with tabs.

### Visual hierarchy

Avoid a monotone equal grid — distinguish hero from supporting content through layout.

- **Hero chart**: full width or 2/3 width.
- **Supporting cards**: 1/3 width or smaller.
- **KPI row**: equal sizing is fine, but consider enlarging one critical card.
- **KPIs above the hero chart**: keep KPI cards visually smaller than the hero. Design the flow "numbers for overview → chart for detail."

### Header patterns

Don't settle for title + description. Pick one based on purpose:

| Pattern | Traits | Best for |
|---------|--------|----------|
| **Filter** | Date range / period selector on the right | Analysis, exploratory |
| **Status summary** | Top KPIs inline in the header | Executive KPI, monitoring |
| **Storytelling** | Prose summary like "today's sales +12% vs. yesterday" | Daily report, presentational |

The header should establish context the moment the user lands on the page.

### Never

- 10+ charts on one screen
- All cards same size and weight (no hero)
- Cramming everything above the fold
- Header with only title + description

---

## 4. Color & Typography

### Color system

Use the framework's semantic color tokens (CSS variables) — not hardcoded colors. Dark mode should work automatically.

| Use | Token role |
|-----|-----------|
| Page background, body text | Base |
| Card background | Slightly elevated from base |
| Secondary text, labels | Muted |
| Primary actions | Primary |
| Errors, warnings, negative metrics | Destructive |
| Borders, dividers | Border |

**Chart color rules:**

- **Use the default theme chart colors.** Don't specify individual series colors unless the user asks, or the color carries semantic meaning (e.g., green = success, red = failure).
- Max **5 series colors**.
- Positive → green, negative → red.
- Emphasize hero series with stronger color; fade background series.

### Accessibility

- Text contrast ≥ **4.5:1**; chart element contrast ≥ **3:1**.
- Never distinguish by color alone — pair with labels, patterns, or icons.
- Check it still reads in grayscale.

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Page title | 30px (text-3xl) | Bold |
| Section title (in card) | 16px (text-base) | Semibold |
| KPI label | 14px (text-sm) | Medium |
| KPI value | 24px (text-2xl) | Bold |
| Secondary text | 12px (text-xs) | Normal |

**Numbers:**

- Abbreviate large values for readability (`¥4.5M`, `2,350 items`).
- Always show signed deltas and reinforce with color.

---

## 5. Component Principles

### One card = one question

Each card answers a single question and reads on its own.

- **KPI card**: "what's the number now?" → value + delta + optional sparkline.
- **Chart card**: "what's the trend?" → chart + labels + optional local filter.
- Don't pack multiple independent questions into one card.

### KPI card anatomy

- **Label**: metric name (muted, small).
- **Icon**: decoration only — small and muted.
- **Value**: large and bold.
- **Delta**: signed number, reinforced with color (green positive, red negative).
- **Sparkline / progress bar** *(optional)*: adds visual richness and more info per card.

Align the internal structure across a KPI row for horizontal rhythm.

### Data tables

- Sortable columns get a sort icon.
- Paginate long tables.
- Status columns use badges with color semantics.
- Numeric columns right-aligned, text left-aligned.

### Filters & controls

- Put filters in the page header or the card header.
- Apply changes immediately — no submit button.
- Always show the active filter state.

**Global vs. card-local filters:**

- **Global** (page header): shared period / scope across all cards.
- **Card-local** (top-right of card): granularity or comparison axis for that card.
- The two layers let users preserve context while drilling in.

### Loading & empty states

- Show skeletons while loading.
- For empty data, show an empty state explaining why and suggesting a next action.

---

## 6. Chart Selection

### Quick reference

| Chart | Best for | Avoid when |
|-------|----------|-----------|
| **Line** | Time-series trends, multi-series comparison | 6+ series |
| **Bar (vertical)** | Category comparison | 20+ categories |
| **Bar (horizontal)** | Ranking, long category labels | — |
| **Stacked bar** | Total + parts together | 5+ series |
| **Area** | Time-series totals with composition | 4+ series |
| **Pie** | Share of total | 6+ slices, similar values |
| **Scatter** | Correlation between two variables | — |

### Decision tree

```
Time-series?
  Yes → Magnitude over time? → line / area
        Cumulative or share? → stacked area
  No  → Category comparison?
          Yes → Ranking? → horizontal bar
                 Otherwise → vertical bar
          No  → Share?
                  ≤5 items → pie
                  ≥6 items → horizontal bar
                  Correlation → scatter
```

### Keep chart types varied

Don't stack the same chart type across a screen.

| Avoid | Prefer |
|-------|--------|
| 3 bar charts in a row | line (trend) + bar (comparison) + donut (composition) |
| 4 line charts in a row | area (cumulative) + horizontal bar (ranking) + KPI cards |

**Rule of thumb**: on any screen with 3+ charts, use at least 2 different types.

### Common chart rules

- Y-axis starts at 0 (no visual exaggeration).
- Always configure tooltips.
- Show a legend whenever there are 2+ series.
- No 3D charts — they hurt readability.
- Set chart height explicitly.

---

## 7. Do's & Don'ts

### Do

- Place the most important info top-left.
- Make the hero chart large (full width or 2/3).
- Use the header zone to set rhythm (filter / summary / story).
- Enrich cards with sparklines or progress bars.
- Stick to the semantic color tokens.
- Leave generous whitespace.
- Provide context for numbers (comparison, delta, target).
- Always implement loading, error, and empty states.
- Include units on numbers.
- Configure tooltips on every chart.
- Decide the single most important chart before designing.
- Tell a story (especially for presentational dashboards) — not just a list of facts.

### Don't

- Make all cards the same size and weight (no hero).
- End the header at just a title + description.
- Rely on color alone to convey meaning.
- Start the Y-axis anywhere but 0.
- Use 3D charts.
- Use charts as decoration (no chart without data).
- Put 10+ charts on one page.
- Place legends far from their chart.
- Hardcode colors — use semantic tokens.
- Fill the screen with one chart type only.
