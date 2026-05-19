# Component Patterns Reference

Per-card composition: KPI cards, tables, filters, loading / empty states. Pair with `SKILL.md` + `layout.md`.

## One card = one question

Each card answers a single question and reads on its own.

- **KPI card** — "what's the number now?" → value + delta + optional sparkline
- **Chart card** — "what's the trend?" → chart + labels + optional local filter
- Don't pack multiple independent questions into one card.

## KPI card anatomy

- **Label** — metric name (muted, small)
- **Icon** — decoration only, small + muted
- **Value** — large + bold
- **Delta** — signed number, reinforced with color (green +, red −)
- **Sparkline / progress bar** *(optional)* — adds visual richness + info density

Align internal structure across a KPI row for horizontal rhythm.

## Data tables

- Sortable columns get sort icon
- Paginate long tables
- Status columns use badges with color semantics
- Numeric columns right-aligned, text left-aligned

## Filters & controls

- Filters in page header or card header
- Apply changes immediately — no submit button
- Always show active filter state

### Global vs card-local

- **Global** (page header) — shared period / scope across all cards
- **Card-local** (top-right of card) — granularity or comparison axis for that card

The two layers let users preserve context while drilling in.

## Loading & empty

- Skeletons while loading
- Empty data → empty state explaining why + suggesting next action
