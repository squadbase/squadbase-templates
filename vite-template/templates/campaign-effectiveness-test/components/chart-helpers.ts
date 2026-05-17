export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "14%", top: "8%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString("en-US")
}

export function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  if (opts.short) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
    return `$${n.toLocaleString("en-US")}`
  }
  return `$${Math.round(n).toLocaleString("en-US")}`
}

export function formatCurrencyDecimal(n: number): string {
  return `$${n.toFixed(2)}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}
