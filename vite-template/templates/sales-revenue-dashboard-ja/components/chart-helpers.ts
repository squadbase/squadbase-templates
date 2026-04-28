export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function getDualAxisGrid() {
  return { left: "3%", right: "6%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}億`
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  return n.toLocaleString("ja-JP")
}

export function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  if (opts.short) {
    if (n >= 100_000_000) return `¥${(n / 100_000_000).toFixed(2)}億`
    if (n >= 10_000) return `¥${(n / 10_000).toFixed(1)}万`
    return `¥${n.toLocaleString("ja-JP")}`
  }
  return `¥${Math.round(n).toLocaleString("ja-JP")}`
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(digits)}%`
}
