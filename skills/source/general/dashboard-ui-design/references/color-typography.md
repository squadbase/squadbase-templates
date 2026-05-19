# Color & Typography Reference

Color tokens, chart colors, accessibility, type scale. Pair with `SKILL.md` + `chart-selection.md`.

## Color system

Use the framework's semantic tokens (CSS variables) — not hardcoded colors. Dark mode works automatically.

| Use | Token role |
|-----|-----------|
| Page background, body text | Base |
| Card background | Slightly elevated from base |
| Secondary text, labels | Muted |
| Primary actions | Primary |
| Errors, warnings, negative metrics | Destructive |
| Borders, dividers | Border |

## Chart color rules

- **Use default theme chart colors.** Don't specify series colors unless requested or color carries semantic meaning (green = success, red = failure).
- Max **5 series colors**.
- Positive → green, negative → red.
- Emphasize hero series with stronger color; fade background series.

## Accessibility

- Text contrast ≥ **4.5:1**; chart element contrast ≥ **3:1**.
- Never distinguish by color alone — pair with labels, patterns, or icons.
- Check readability in grayscale.

## Typography

| Element | Size | Weight |
|---------|------|--------|
| Page title | 30px (text-3xl) | Bold |
| Section title (in card) | 16px (text-base) | Semibold |
| KPI label | 14px (text-sm) | Medium |
| KPI value | 24px (text-2xl) | Bold |
| Secondary text | 12px (text-xs) | Normal |

## Numbers

- Abbreviate large values (`¥4.5M`, `2,350 items`).
- Always show signed deltas + reinforce with color.
