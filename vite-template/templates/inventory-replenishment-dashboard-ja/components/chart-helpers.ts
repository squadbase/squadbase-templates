export function getBaseGrid() {
  return { left: "3%", right: "4%", bottom: "12%", containLabel: true }
}

export function formatNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}億`
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`
  return n.toLocaleString("ja-JP")
}

export function formatCurrency(n: number, opts: { short?: boolean } = {}): string {
  if (opts.short) {
    if (n >= 100_000_000) return `¥${(n / 100_000_000).toFixed(1)}億`
    if (n >= 10_000) return `¥${(n / 10_000).toFixed(1)}万`
    return `¥${n.toLocaleString("ja-JP")}`
  }
  return `¥${Math.round(n).toLocaleString("ja-JP")}`
}

export function formatStockDays(n: number): string {
  return `${n.toFixed(1)} 日`
}
